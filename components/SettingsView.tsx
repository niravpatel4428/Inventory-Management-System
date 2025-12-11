
import React, { useState } from 'react';
import { Save, Building2, Bell, ShieldCheck, Database, Sliders, Loader2 } from 'lucide-react';
import { db } from '../services/database';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: 'NexInventory Corp',
    email: 'admin@nexinventory.com',
    currency: 'USD ($)',
    timezone: 'UTC-5 (EST)',
    lowStockThreshold: 10,
    enableAiAnalysis: true,
    emailNotifications: true,
    autoBackup: false
  });
  
  const [isResetting, setIsResetting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Mock save functionality with visual feedback
    const btn = document.getElementById('save-btn');
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = 'Saving...';
      setTimeout(() => {
        btn.innerText = 'Saved!';
        setTimeout(() => btn.innerText = originalText, 2000);
      }, 800);
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm('Are you sure you want to reset the database? This cannot be undone and will restore default data.')) {
      setIsResetting(true);
      try {
        await db.resetDatabase();
        window.location.reload();
      } catch (error) {
        console.error("Reset failed", error);
        setIsResetting(false);
        alert("Failed to reset database");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configuration</h2>
          <p className="text-slate-500">System parameters and preferences</p>
        </div>
        <button 
          id="save-btn"
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Company Information */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Building2 className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Company Profile</h3>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
              <input 
                type="text" 
                value={settings.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Currency</label>
              <select 
                value={settings.currency}
                onChange={e => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>JPY (¥)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Timezone</label>
              <select 
                value={settings.timezone}
                onChange={e => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
              >
                <option>UTC-5 (EST)</option>
                <option>UTC-8 (PST)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (CET)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Sliders className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Inventory Logic</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Global Low Stock Threshold</p>
                <p className="text-sm text-slate-500">Default minimum quantity to trigger low stock warnings if not set per product.</p>
              </div>
              <input 
                type="number" 
                className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={settings.lowStockThreshold}
                onChange={e => handleChange('lowStockThreshold', parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                <div className="mt-1"><ShieldCheck className="text-emerald-500" size={20} /></div>
                <div>
                  <p className="font-medium text-slate-800">Enable AI Analysis</p>
                  <p className="text-sm text-slate-500">Allow Gemini AI to scan inventory data for insights and optimization tips.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.enableAiAnalysis} onChange={e => handleChange('enableAiAnalysis', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Bell className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" checked={settings.emailNotifications} onChange={e => handleChange('emailNotifications', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
              <span className="ml-3 font-medium text-slate-700">Email Alerts for Low Stock</span>
            </label>
            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" checked={settings.autoBackup} onChange={e => handleChange('autoBackup', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
              <span className="ml-3 font-medium text-slate-700">Daily Automated Backups</span>
            </label>
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Database className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">System Data</h3>
          </div>
          <div className="p-6">
             <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                   <p className="font-bold text-rose-800">Reset System Data</p>
                   <p className="text-sm text-rose-600">This will restore the database to its initial mock state. All custom data will be lost.</p>
                </div>
                <button 
                  disabled={isResetting}
                  onClick={handleResetDatabase}
                  className="bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-lg font-bold hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                   {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
                   {isResetting ? 'Resetting...' : 'Reset Database'}
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
