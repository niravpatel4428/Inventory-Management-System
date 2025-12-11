
import React, { useState, useEffect } from 'react';
import { Product, AuditLog, StockMovement } from '../types';
import { db } from '../services/database';
import { Search, Filter, Plus, X, Edit, Trash2, ListPlus, AlertCircle, ScanLine, History, ChevronDown, CheckSquare, Square, XCircle, Package } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  categories: string[];
  auditLogs: AuditLog[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  categories, 
  auditLogs,
  onAdd, 
  onUpdate, 
  onDelete, 
  onBulkDelete,
  onAddCategory, 
  onDeleteCategory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalTab, setProductModalTab] = useState<'details' | 'history'>('details');
  const [currentHistory, setCurrentHistory] = useState<StockMovement[]>([]);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [viewBarcodeProduct, setViewBarcodeProduct] = useState<Product | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '', name: '', category: categories[0] || 'Uncategorized', quantity: 0, unit: 'pcs', price: 0, location: '', minLevel: 0
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  // --- Filtering Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStock = 
      stockFilter === 'All' ? true :
      stockFilter === 'Out' ? p.quantity === 0 :
      stockFilter === 'Low' ? p.quantity > 0 && p.quantity <= p.minLevel : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter(p => p.quantity <= p.minLevel && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  const isFilterActive = stockFilter !== 'All' || selectedCategory !== 'All' || searchTerm !== '';

  const clearFilters = () => {
    setStockFilter('All');
    setSelectedCategory('All');
    setSearchTerm('');
  };

  // --- Handlers ---
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    if (editingId) {
      onUpdate({
        ...formData as Product,
        id: editingId,
        cost: 0, // Keeping simplified
        supplier: 'Updated Supplier'
      });
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        sku: formData.sku!,
        name: formData.name!,
        category: formData.category || categories[0],
        quantity: Number(formData.quantity) || 0,
        unit: formData.unit || 'pcs',
        location: formData.location || 'WH/Stock',
        price: Number(formData.price) || 0,
        cost: 0,
        supplier: 'New Supplier',
        minLevel: Number(formData.minLevel) || 10
      });
    }
    handleCloseProductModal();
  };

  const handleEdit = async (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setProductModalTab('details');
    // Load history
    const history = await db.getStockMovements(product.id);
    setCurrentHistory(history);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingId(null);
    setFormData({ sku: '', name: '', category: categories[0] || 'Uncategorized', quantity: 0, unit: 'pcs', price: 0, location: '', minLevel: 0 });
    setCurrentHistory([]);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      
      {/* --- ALERTS --- */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex gap-4 mb-2">
          {outOfStockCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center gap-3 flex-1">
              <AlertCircle size={20} />
              <div>
                <p className="font-bold">{outOfStockCount} Products Out of Stock</p>
                <button onClick={() => setStockFilter('Out')} className="text-xs underline hover:text-rose-950">Filter Out of Stock</button>
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="bg-amber-50 border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3 flex-1">
              <AlertCircle size={20} />
              <div>
                <p className="font-bold">{lowStockCount} Products Low on Stock</p>
                <button onClick={() => setStockFilter('Low')} className="text-xs underline hover:text-amber-950">Filter Low Stock</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={handleCloseProductModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Tabs */}
            {editingId && (
              <div className="flex border-b border-slate-100 px-6">
                 <button 
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${productModalTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setProductModalTab('details')}
                 >
                   Details
                 </button>
                 <button 
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${productModalTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setProductModalTab('history')}
                 >
                   Stock History
                 </button>
              </div>
            )}

            {productModalTab === 'details' ? (
              <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">SKU</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="E.g. ITEM-001" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Product Name</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Product Name" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Price ($)</label>
                    <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Quantity</label>
                    <input type="number" min="0" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Unit</label>
                    <select 
                       className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                       value={formData.unit || 'pcs'}
                       onChange={e => setFormData({...formData, unit: e.target.value})}
                    >
                       <option value="pcs">Pieces</option>
                       <option value="kg">Kg</option>
                       <option value="g">Grams</option>
                       <option value="l">Liters</option>
                       <option value="box">Box</option>
                       <option value="m">Meters</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="WH/Stock" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Min Level</label>
                    <input type="number" min="0" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.minLevel} onChange={e => setFormData({...formData, minLevel: parseInt(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors mt-4">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            ) : (
              <div className="p-0 h-96 overflow-y-auto bg-slate-50">
                {currentHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No stock movement history found.</div>
                ) : (
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-500 sticky top-0">
                        <tr>
                           <th className="px-4 py-2">Date</th>
                           <th className="px-4 py-2">Ref</th>
                           <th className="px-4 py-2">Change</th>
                           <th className="px-4 py-2 text-right">Balance</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                        {currentHistory.map(move => (
                           <tr key={move.id}>
                              <td className="px-4 py-2 text-xs text-slate-500">
                                 {new Date(move.date).toLocaleDateString()}
                                 <br/>
                                 {new Date(move.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                              <td className="px-4 py-2">
                                 <div className="font-medium text-slate-700">{move.reference}</div>
                                 {move.batchNumber && <span className="text-xs bg-slate-200 px-1 rounded">Batch: {move.batchNumber}</span>}
                              </td>
                              <td className={`px-4 py-2 font-bold ${move.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {move.quantity > 0 ? '+' : ''}{move.quantity}
                              </td>
                              <td className="px-4 py-2 text-right font-medium text-slate-800">
                                 {move.balanceAfter}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {viewBarcodeProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{viewBarcodeProduct.name}</h3>
            <p className="text-slate-500 mb-6">{viewBarcodeProduct.category}</p>
            
            <div className="bg-white p-4 border-2 border-slate-900 inline-block mb-6 rounded">
               {/* Visual CSS-only pseudo-barcode */}
               <div className="flex h-24 items-stretch gap-[2px] justify-center">
                  {viewBarcodeProduct.sku.split('').map((char, i) => {
                    const code = char.charCodeAt(0);
                    const width = code % 3 === 0 ? 'w-1.5' : code % 2 === 0 ? 'w-2.5' : 'w-3.5';
                    return <div key={i} className={`bg-slate-900 ${width}`}></div>
                  })}
                  {[...Array(8)].map((_,i) => <div key={`f${i}`} className={`bg-slate-900 ${i%2===0?'w-1':'w-px'}`}></div>)}
               </div>
               <div className="font-mono text-xl tracking-[0.3em] font-bold mt-2">{viewBarcodeProduct.sku}</div>
            </div>

            <div className="flex gap-2">
               <button 
                onClick={() => window.print()} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg font-medium"
               >
                 Print Label
               </button>
               <button 
                onClick={() => setViewBarcodeProduct(null)} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
               >
                 Done
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl h-[80vh] sm:rounded-xl shadow-2xl flex flex-col animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="text-indigo-600" size={20} />
                <h3 className="font-bold text-slate-800">System Audit Log</h3>
              </div>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
               {auditLogs.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No activity recorded yet.</div>
               ) : (
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b sticky top-0">
                       <tr>
                          <th className="px-6 py-3">Timestamp</th>
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">Details</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                             <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                             </td>
                             <td className="px-6 py-3 font-medium text-slate-700">{log.user}</td>
                             <td className="px-6 py-3">
                                <span className={`text-xs px-2 py-1 rounded font-bold ${
                                   log.action.includes('DELETE') ? 'bg-rose-100 text-rose-700' : 
                                   log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                   {log.action}
                                </span>
                             </td>
                             <td className="px-6 py-3 text-slate-600">{log.details}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal (Same as before) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Manage Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCategorySubmit} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  required
                  placeholder="New Category..." 
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                  <Plus size={20} />
                </button>
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded group hover:bg-slate-100">
                    <span className="text-slate-700 text-sm font-medium">{cat}</span>
                    <button 
                      onClick={() => { if(window.confirm(`Delete category "${cat}"?`)) onDeleteCategory(cat); }}
                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-3">
           <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
           <button 
             onClick={() => setIsAuditModalOpen(true)}
             className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
             title="View Audit Log"
           >
             <History size={20} />
           </button>
        </div>
        
        {/* Bulk Actions Banner */}
        {selectedIds.size > 0 ? (
          <div className="flex-1 w-full xl:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-between animate-fade-in shadow-lg shadow-indigo-200">
            <span className="font-medium text-sm">{selectedIds.size} items selected</span>
            <div className="flex gap-2">
               <button 
                onClick={handleBulkDelete}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
               >
                 <Trash2 size={14} /> Delete Selected
               </button>
               <button 
                onClick={() => setSelectedIds(new Set())}
                className="bg-transparent hover:bg-white/10 px-3 py-1.5 rounded text-xs font-bold transition-colors"
               >
                 Cancel
               </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            {/* Filters */}
            <div className="flex gap-2 items-center">
               <div className="relative min-w-[140px]">
                 <select 
                   value={stockFilter}
                   onChange={(e) => setStockFilter(e.target.value as any)}
                   className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white cursor-pointer"
                 >
                   <option value="All">All Status</option>
                   <option value="Low">Low Stock</option>
                   <option value="Out">Out of Stock</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
               </div>

              <div className="relative min-w-[140px]">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>

              {isFilterActive && (
                 <button 
                   onClick={clearFilters}
                   className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                   title="Clear All Filters"
                 >
                   <XCircle size={16} /> Clear
                 </button>
              )}

              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 px-3 py-2 rounded-lg transition-colors"
                title="Manage Categories"
              >
                <ListPlus size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SKU or Name..." 
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap shadow-sm shadow-indigo-200"
            >
              <Plus size={16} /> New Product
            </button>
          </div>
        )}
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">
                   <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                      {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? <CheckSquare size={18} /> : <Square size={18} />}
                   </button>
                </th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-right">On Hand</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = product.quantity === 0 ? 'Out of Stock' : product.quantity <= product.minLevel ? 'Low Stock' : 'In Stock';
                  const statusColor = status === 'Out of Stock' ? 'bg-rose-100 text-rose-700' : status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                  const isSelected = selectedIds.has(product.id);
                  
                  return (
                    <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-4 py-3">
                         <button onClick={() => toggleSelectOne(product.id)} className={`${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                         </button>
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-700">{product.sku}</td>
                      <td className="px-6 py-3 text-slate-600">{product.name}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{product.location}</td>
                      <td className="px-6 py-3 text-right font-medium text-slate-700">
                        {product.quantity} <span className="text-xs font-normal text-slate-400">{product.unit || 'pcs'}</span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => setViewBarcodeProduct(product)}
                            className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors"
                            title="Generate Barcode"
                           >
                            <ScanLine size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Delete this product?')) onDelete(product.id); }}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;
