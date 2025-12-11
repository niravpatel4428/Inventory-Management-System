
import React, { useState } from 'react';
import { Product, Operation, OperationStatus, OperationType, AIInsight } from '../types';
import { analyzeInventory } from '../services/geminiService';
import StatCard from './StatCard';
import { DollarSign, AlertTriangle, Box, Truck, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardViewProps {
  products: Product[];
  operations: Operation[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ products, operations }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  // lowStockCount includes out of stock items for broader warning
  const lowStockCount = products.filter(p => p.quantity <= p.minLevel).length;
  const pendingReceipts = operations.filter(o => o.type === OperationType.RECEIPT && o.status !== OperationStatus.DONE).length;
  const pendingDeliveries = operations.filter(o => o.type === OperationType.DELIVERY && o.status !== OperationStatus.DONE).length;

  const chartData = [
    { name: 'Mon', receipts: 4, deliveries: 2 },
    { name: 'Tue', receipts: 3, deliveries: 5 },
    { name: 'Wed', receipts: 2, deliveries: 8 },
    { name: 'Thu', receipts: 6, deliveries: 4 },
    { name: 'Fri', receipts: 8, deliveries: 9 },
    { name: 'Sat', receipts: 1, deliveries: 3 },
    { name: 'Sun', receipts: 0, deliveries: 1 },
  ];

  const categoryChartData = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.quantity;
    } else {
      acc.push({ name: product.category, value: product.quantity });
    }
    return acc;
  }, []);

  const handleAnalyze = async () => {
    setLoadingInsights(true);
    const results = await analyzeInventory(products, operations);
    setInsights(results);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Welcome back, Warehouse Manager</p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loadingInsights}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70"
        >
          {loadingInsights ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="flex items-center gap-2">✨ AI Insights</span>
          )}
        </button>
      </div>

      {insights.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🤖</span> Gemini Analysis
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-lg border flex flex-col justify-between ${
                insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                insight.type === 'suggestion' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <p className="text-sm font-medium mb-2">{insight.message}</p>
                {insight.action && (
                  <button className="text-xs font-bold uppercase tracking-wide self-start hover:underline">
                    {insight.action} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Inventory Value" value={`$${totalValue.toLocaleString()}`} trend="12%" trendUp={true} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Out of Stock" value={outOfStockCount} icon={XCircle} color="bg-rose-500" />
        <StatCard title="Low Stock Items" value={lowStockCount} trend="2" trendUp={false} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard title="Pending Receipts" value={pendingReceipts} icon={Box} color="bg-blue-500" />
        <StatCard title="To Deliver" value={pendingDeliveries} icon={Truck} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Weekly Operations Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Line type="monotone" dataKey="receipts" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="deliveries" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Stock by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData.length > 0 ? categoryChartData : [{name: 'No Data', value: 0}]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                 <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
