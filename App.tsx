
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import OperationsView from './components/OperationsView';
import ScannerView from './components/ScannerView';
import ShippingView from './components/ShippingView';
import LoginView from './components/LoginView';
import UsersView from './components/UsersView';
import SettingsView from './components/SettingsView';
import { db } from './services/database';
import { Product, Operation, OperationStatus, OperationType, User, AuditLog } from './types';
import { Menu, Bell } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // UI State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    const initApp = async () => {
      await db.init();
      // Check for existing session (simplified: we rely on memory for this demo, so reload = logout)
      setAuthChecked(true);
    };
    initApp();
  }, []);

  // --- Data Fetching ---
  const fetchData = async () => {
    setIsLoadingData(true);
    const p = await db.getProducts();
    const o = await db.getOperations();
    const c = await db.getCategories();
    const l = await db.getAuditLogs();
    setProducts(p);
    setOperations(o);
    setCategories(c);
    setAuditLogs(l);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // --- Notification System ---
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Helpers ---
  const logActivity = async (action: string, details: string, entityId?: string) => {
    if (!currentUser) return;
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      user: currentUser.name,
      timestamp: new Date().toISOString(),
      entityId
    };
    await db.addAuditLog(log);
  };

  // --- Handlers ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    showNotification(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleAddProduct = async (product: Product) => {
    await db.saveProduct(product);
    await logActivity('CREATE', `Created product: ${product.name}`, product.id);
    await fetchData();
    showNotification(`Product ${product.name} created successfully`);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await db.saveProduct(updatedProduct);
    await logActivity('UPDATE', `Updated product: ${updatedProduct.name}`, updatedProduct.id);
    await fetchData();
    showNotification(`Product ${updatedProduct.name} updated`);
  };

  const handleDeleteProduct = async (id: string) => {
    const p = products.find(p => p.id === id);
    await db.deleteProduct(id);
    await logActivity('DELETE', `Deleted product: ${p?.name || id}`, id);
    await fetchData();
    showNotification('Product deleted');
  };

  const handleBulkDeleteProducts = async (ids: string[]) => {
    for (const id of ids) {
      await db.deleteProduct(id);
    }
    await logActivity('BULK_DELETE', `Deleted ${ids.length} products`);
    await fetchData();
    showNotification(`${ids.length} products deleted`);
  };

  const handleAddCategory = async (category: string) => {
    await db.addCategory(category);
    await logActivity('CREATE_CATEGORY', `Created category: ${category}`);
    await fetchData();
    showNotification(`Category "${category}" added`);
  };

  const handleDeleteCategory = async (category: string) => {
    await db.deleteCategory(category);
    await logActivity('DELETE_CATEGORY', `Deleted category: ${category}`);
    await fetchData();
    showNotification(`Category "${category}" removed`);
  };

  const handleAddOperation = async (operation: Operation) => {
    await db.saveOperation(operation);
    await logActivity('CREATE_OP', `Created operation ${operation.reference}`, operation.id);
    await fetchData();
    showNotification(`Operation ${operation.reference} created`);
  };

  const handleProcessOperation = async (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;
    if (op.status === OperationStatus.DONE) return;

    // Validate Stock for Deliveries
    if (op.type === OperationType.DELIVERY) {
      for (const item of op.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.quantity < item.qty) {
          showNotification(`Insufficient stock for ${product?.name || 'Unknown Item'}`, 'error');
          return;
        }
      }
    }

    // Update Logic
    const newProducts = [...products];
    op.items.forEach(item => {
      const productIndex = newProducts.findIndex(p => p.id === item.productId);
      if (productIndex > -1) {
        const currentQty = newProducts[productIndex].quantity;
        if (op.type === OperationType.RECEIPT) {
          newProducts[productIndex] = { ...newProducts[productIndex], quantity: currentQty + item.qty };
        } else if (op.type === OperationType.DELIVERY) {
          newProducts[productIndex] = { ...newProducts[productIndex], quantity: currentQty - item.qty };
        }
      }
    });

    // Save changes to DB
    const updatedOp = { ...op, status: OperationStatus.DONE };
    await db.processOperation(updatedOp, newProducts);
    await logActivity('PROCESS_OP', `Processed operation ${op.reference}`, op.id);
    await fetchData();
    
    showNotification(`Operation ${op.reference} Validated & Stock Updated`);
  };

  // --- Render Views ---
  const renderView = () => {
    if (isLoadingData) {
      return (
        <div className="flex h-full items-center justify-center text-slate-400">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch(currentView) {
      case 'dashboard': 
        return <DashboardView products={products} operations={operations} />;
      case 'inventory': 
        return <InventoryView 
          products={products} 
          categories={categories}
          auditLogs={auditLogs}
          onAdd={handleAddProduct} 
          onUpdate={handleUpdateProduct} 
          onDelete={handleDeleteProduct}
          onBulkDelete={handleBulkDeleteProducts}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />;
      case 'operations': 
        return <OperationsView 
          operations={operations} 
          products={products}
          onAdd={handleAddOperation}
          onProcess={handleProcessOperation}
        />;
      case 'scanner': 
        return <ScannerView 
          products={products} 
          onUpdateProduct={handleUpdateProduct}
          onAddOperation={handleAddOperation}
        />;
      case 'shipping': 
        return <ShippingView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default: 
        return <DashboardView products={products} operations={operations} />;
    }
  };

  if (!authChecked) return null; // Initial boot

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      <Sidebar currentView={currentView} setView={setCurrentView} currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4 text-slate-400">
             <Menu className="w-5 h-5 cursor-pointer hover:text-slate-600 lg:hidden" />
             <div className="hidden lg:flex items-center gap-2 text-sm">
                <span className="hover:text-slate-600 cursor-pointer">Warehouse</span>
                <span>/</span>
                <span className="text-slate-800 font-medium capitalize">{currentView}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative">
               <Bell className="w-5 h-5 text-slate-400 hover:text-slate-600 cursor-pointer" />
               {operations.some(o => o.status === OperationStatus.READY) && (
                 <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
               )}
             </div>
             <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
                   <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
                </div>
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-white font-bold shadow-sm ${
                   currentUser.role === 'admin' ? 'bg-indigo-600 border-indigo-700' : 
                   currentUser.role === 'manager' ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-500 border-slate-600'
                }`}>
                   {currentUser.avatar}
                </div>
             </div>
          </div>
        </header>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 z-50 px-6 py-4 rounded-lg shadow-xl border animate-fade-in-down flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
             <span className="text-lg">{notification.type === 'success' ? '✅' : '⚠️'}</span>
             <span className="font-medium">{notification.message}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
