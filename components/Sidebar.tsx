
import React from 'react';
import { LayoutDashboard, Package, ArrowLeftRight, ScanBarcode, Settings, Truck, Users, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onLogout }) => {
  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, requiredRole: 'user' },
    { id: 'operations', label: 'Operations', icon: ArrowLeftRight, requiredRole: 'user' },
    { id: 'inventory', label: 'Inventory', icon: Package, requiredRole: 'user' },
    { id: 'scanner', label: 'Barcode Scanner', icon: ScanBarcode, requiredRole: 'user' },
    { id: 'shipping', label: 'Shipping Carriers', icon: Truck, requiredRole: 'user' },
    { id: 'users', label: 'User Management', icon: Users, requiredRole: 'admin' },
    { id: 'settings', label: 'Configuration', icon: Settings, requiredRole: 'admin' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">N</div>
        <span className="font-semibold text-lg tracking-tight">NexInventory</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.requiredRole === 'admin' && !isAdmin) return null;
          
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>

        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-400">Online • DB Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
