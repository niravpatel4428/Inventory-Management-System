import React, { useState } from 'react';
import { Operation, Product, OperationType, OperationStatus } from '../types';
import { Plus, X, ArrowRight, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

interface OperationsViewProps {
  operations: Operation[];
  products: Product[];
  onAdd: (op: Operation) => void;
  onProcess: (id: string) => void;
}

const OperationsView: React.FC<OperationsViewProps> = ({ operations, products, onAdd, onProcess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  
  // New Operation Form State
  const [newOpType, setNewOpType] = useState<OperationType>(OperationType.RECEIPT);
  const [newOpPartner, setNewOpPartner] = useState('');
  const [newOpItems, setNewOpItems] = useState<{productId: string, qty: number}[]>([{productId: '', qty: 1}]);

  const getBadgeColor = (type: OperationType) => {
    switch (type) {
      case OperationType.RECEIPT: return 'bg-blue-100 text-blue-700';
      case OperationType.DELIVERY: return 'bg-purple-100 text-purple-700';
      case OperationType.INTERNAL: return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = newOpItems.filter(i => i.productId && i.qty > 0);
    if (!newOpPartner || validItems.length === 0) return;

    const op: Operation = {
      id: Math.random().toString(36).substr(2, 9),
      reference: `WH/${newOpType === OperationType.RECEIPT ? 'IN' : 'OUT'}/${Math.floor(Math.random() * 10000)}`,
      type: newOpType,
      partner: newOpPartner,
      status: OperationStatus.READY,
      scheduledDate: new Date().toISOString().split('T')[0],
      items: validItems.map(i => ({ ...i, done: 0 }))
    };

    onAdd(op);
    setIsModalOpen(false);
    setNewOpPartner('');
    setNewOpItems([{productId: '', qty: 1}]);
  };

  const addItemRow = () => {
    setNewOpItems([...newOpItems, {productId: '', qty: 1}]);
  };

  const updateItemRow = (index: number, field: 'productId' | 'qty', value: any) => {
    const newItems = [...newOpItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewOpItems(newItems);
  };

  const handleProcessClick = () => {
    if (selectedOp) {
      onProcess(selectedOp.id);
      setSelectedOp(null); // Close modal
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Create New Operation</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
             </div>
             <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Operation Type</label>
                      <select className="w-full border rounded-lg p-2" value={newOpType} onChange={e => setNewOpType(e.target.value as OperationType)}>
                        <option value={OperationType.RECEIPT}>Receipt (In)</option>
                        <option value={OperationType.DELIVERY}>Delivery (Out)</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Partner</label>
                      <input required type="text" className="w-full border rounded-lg p-2" placeholder="Customer or Supplier Name"
                        value={newOpPartner} onChange={e => setNewOpPartner(e.target.value)} />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase">Items</label>
                      <button type="button" onClick={addItemRow} className="text-xs text-indigo-600 font-bold hover:underline">+ Add Line</button>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg space-y-3 max-h-60 overflow-y-auto">
                      {newOpItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                           <select 
                              required
                              className="flex-1 border rounded p-2 text-sm" 
                              value={item.productId}
                              onChange={e => updateItemRow(idx, 'productId', e.target.value)}
                           >
                              <option value="">Select Product...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.sku} - {p.name} ({p.quantity})</option>
                              ))}
                           </select>
                           <input 
                              type="number" min="1" className="w-24 border rounded p-2 text-sm"
                              value={item.qty}
                              onChange={e => updateItemRow(idx, 'qty', parseInt(e.target.value))}
                           />
                        </div>
                      ))}
                   </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Create Operation</button>
             </form>
          </div>
        </div>
      )}

      {/* Detail / Validate Modal */}
      {selectedOp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="font-bold text-slate-800">{selectedOp.reference}</h3>
                   <span className={`text-xs px-2 py-0.5 rounded ${getBadgeColor(selectedOp.type)}`}>{selectedOp.type}</span>
                </div>
                <button onClick={() => setSelectedOp(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
             </div>
             <div className="p-6">
                <div className="flex justify-between mb-4">
                   <div>
                      <p className="text-xs text-slate-500 uppercase">Partner</p>
                      <p className="font-medium">{selectedOp.partner}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase">Status</p>
                      <p className={`font-bold ${selectedOp.status === OperationStatus.DONE ? 'text-emerald-600' : 'text-blue-600'}`}>
                         {selectedOp.status}
                      </p>
                   </div>
                </div>
                
                <h4 className="font-bold text-sm mb-2 text-slate-700">Product Lines</h4>
                <div className="border rounded-lg overflow-hidden mb-6">
                   <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-right">Demand</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y">
                         {selectedOp.items.map((item, i) => {
                            const prod = products.find(p => p.id === item.productId);
                            return (
                               <tr key={i}>
                                  <td className="px-3 py-2">{prod?.name || 'Unknown Item'}</td>
                                  <td className="px-3 py-2 text-right">{item.qty}</td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>

                {selectedOp.status !== OperationStatus.DONE && (
                   <button 
                      onClick={handleProcessClick}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
                   >
                      <CheckCircle2 size={18} /> Validate & {selectedOp.type === OperationType.RECEIPT ? 'Receive' : 'Deliver'}
                   </button>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Main Kanban Board */}
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-800">Operations</h2>
         <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> New Transfer
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Ready', 'Waiting', 'Done'].map((status) => (
          <div key={status} className="bg-slate-100 p-4 rounded-xl min-h-[400px] flex flex-col gap-3">
            <h3 className="font-semibold text-slate-500 uppercase text-xs tracking-wider mb-2 flex justify-between">
              {status} <span className="bg-slate-200 px-2 rounded-full text-slate-600">
                {operations.filter(o => {
                  if (status === 'Done') return o.status === OperationStatus.DONE;
                  if (status === 'Ready') return o.status === OperationStatus.READY;
                  return o.status === OperationStatus.DRAFT;
                }).length}
              </span>
            </h3>
            
            {operations.filter(o => {
              if (status === 'Done') return o.status === OperationStatus.DONE;
              if (status === 'Ready') return o.status === OperationStatus.READY;
              return o.status === OperationStatus.DRAFT;
            }).map(op => (
              <div 
                key={op.id} 
                onClick={() => setSelectedOp(op)}
                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group relative"
              >
                {op.status === OperationStatus.DONE && <div className="absolute top-2 right-2 text-emerald-500"><CheckCircle2 size={16}/></div>}
                
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getBadgeColor(op.type)}`}>
                    {op.type}
                  </span>
                  <span className="text-xs text-slate-400">{op.scheduledDate}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{op.reference}</h4>
                <p className="text-sm text-slate-500 mb-3">{op.partner}</p>
                <div className="flex justify-between items-center text-xs text-slate-400 border-t pt-2 border-slate-50">
                   <span>{op.items.reduce((s, i) => s + i.qty, 0)} Items</span>
                   <span className="group-hover:translate-x-1 transition-transform text-indigo-500">View →</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperationsView;