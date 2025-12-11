
import React, { useState } from 'react';
import { Product, Operation, OperationType, OperationStatus } from '../types';
import { ScanLine, CheckCircle2, SearchX, PackagePlus, ArrowRightLeft, Save, Plus } from 'lucide-react';

interface ScannerViewProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddOperation: (op: Operation) => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ products, onUpdateProduct, onAddOperation }) => {
  const [scannedCode, setScannedCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Action States
  const [actionMode, setActionMode] = useState<'none' | 'adjust' | 'transfer'>('none');
  const [actionQty, setActionQty] = useState<number>(1);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [transferType, setTransferType] = useState<OperationType>(OperationType.RECEIPT);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode) return;
    
    // Simple exact match logic for SKU
    const found = products.find(p => p.sku.toLowerCase() === scannedCode.toLowerCase());
    
    if (found) {
      setScannedProduct(found);
      setError(null);
      setActionMode('none');
      setActionQty(1);
      setBatchNumber('');
    } else {
      setScannedProduct(null);
      setError(`SKU "${scannedCode}" not found in inventory.`);
    }
    setScannedCode('');
  };

  const handleAdjustStock = () => {
    if (!scannedProduct) return;
    // Direct inventory adjustment
    onUpdateProduct({
      ...scannedProduct,
      quantity: actionQty
    });
    setScannedProduct({ ...scannedProduct, quantity: actionQty }); // Local update for UI
    setActionMode('none');
    alert(`Stock updated to ${actionQty}`);
  };

  const handleCreateTransfer = () => {
    if (!scannedProduct) return;

    const op: Operation = {
      id: Math.random().toString(36).substr(2, 9),
      reference: `WH/${transferType === OperationType.RECEIPT ? 'IN' : 'OUT'}/SCAN-${Math.floor(Math.random() * 1000)}`,
      type: transferType,
      partner: 'Scanner Operator',
      status: OperationStatus.READY, // Create as Ready so it can be processed
      scheduledDate: new Date().toISOString().split('T')[0],
      items: [{ productId: scannedProduct.id, qty: actionQty, done: 0, batchNumber: batchNumber || undefined }]
    };

    onAddOperation(op);
    setActionMode('none');
    alert('Transfer Operation Created with Batch Tracking');
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Barcode Scanner</h2>
      
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex-1 flex flex-col">
        {/* Scanner Header */}
        <div className="p-8 bg-slate-900 text-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
          <ScanLine className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-white text-lg font-medium">Ready to Scan</h3>
          <p className="text-slate-400 text-sm mt-1">Supports USB/Bluetooth Scanners (Keyboard Mode)</p>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
           {/* Search Input */}
           <form onSubmit={handleScan} className="relative mb-8">
             <input 
                type="text" 
                autoFocus
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                className="w-full text-center text-3xl font-mono py-4 border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-600 bg-transparent text-slate-800 placeholder-slate-300 transition-colors"
                placeholder="Scan Item SKU..."
             />
           </form>

           {/* Results Area */}
           {scannedProduct && (
             <div className="space-y-6 animate-fade-in-up">
               {/* Product Details Card */}
               <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <CheckCircle2 size={100} className="text-emerald-500" />
                 </div>
                 
                 <div className="flex items-start gap-4 relative z-10">
                   <div className="w-16 h-16 rounded-lg bg-white shadow-sm flex items-center justify-center text-2xl font-bold text-emerald-600 shrink-0">
                      {scannedProduct.quantity}
                   </div>
                   <div className="flex-1">
                     <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Product Found</p>
                     <h3 className="text-xl font-bold text-slate-800">{scannedProduct.name}</h3>
                     <p className="font-mono text-slate-500 mb-3">{scannedProduct.sku}</p>
                     
                     <div className="flex gap-4 text-sm text-slate-600">
                        <span className="bg-white/60 px-2 py-1 rounded">Loc: <strong>{scannedProduct.location}</strong></span>
                        <span className="bg-white/60 px-2 py-1 rounded">Unit: <strong>{scannedProduct.unit || 'pcs'}</strong></span>
                        <span className="bg-white/60 px-2 py-1 rounded">Cat: <strong>{scannedProduct.category}</strong></span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Quick Actions Grid */}
               {actionMode === 'none' && (
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { setActionMode('adjust'); setActionQty(scannedProduct.quantity); }}
                      className="p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                    >
                       <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                          <PackagePlus size={20} />
                       </div>
                       <h4 className="font-bold text-slate-800">Adjust Stock</h4>
                       <p className="text-xs text-slate-500 mt-1">Directly update quantity</p>
                    </button>

                    <button 
                      onClick={() => { setActionMode('transfer'); setActionQty(1); }}
                      className="p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-left group"
                    >
                       <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                          <ArrowRightLeft size={20} />
                       </div>
                       <h4 className="font-bold text-slate-800">Create Transfer</h4>
                       <p className="text-xs text-slate-500 mt-1">Receipt or Delivery</p>
                    </button>
                 </div>
               )}

               {/* Action Forms */}
               {actionMode === 'adjust' && (
                 <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <PackagePlus size={18} className="text-indigo-600" /> Adjust Inventory Quantity
                    </h4>
                    <div className="flex gap-4 items-end">
                       <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Quantity</label>
                          <input 
                            type="number" min="0" 
                            className="w-full border rounded-lg p-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={actionQty}
                            onChange={(e) => setActionQty(parseInt(e.target.value) || 0)}
                          />
                       </div>
                       <button onClick={handleAdjustStock} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
                          <Save size={18} /> Update
                       </button>
                       <button onClick={() => setActionMode('none')} className="bg-slate-100 text-slate-600 px-4 py-3 rounded-lg font-bold hover:bg-slate-200">
                          Cancel
                       </button>
                    </div>
                 </div>
               )}

               {actionMode === 'transfer' && (
                 <div className="bg-white border-2 border-purple-100 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <ArrowRightLeft size={18} className="text-purple-600" /> Create Transfer
                    </h4>
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => setTransferType(OperationType.RECEIPT)}
                             className={`p-3 rounded-lg border font-medium text-sm text-center transition-colors ${transferType === OperationType.RECEIPT ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                             IN (Receipt)
                          </button>
                          <button 
                             onClick={() => setTransferType(OperationType.DELIVERY)}
                             className={`p-3 rounded-lg border font-medium text-sm text-center transition-colors ${transferType === OperationType.DELIVERY ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                             OUT (Delivery)
                          </button>
                       </div>
                       
                       <div className="flex gap-4 items-end">
                          <div className="w-1/3">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Quantity</label>
                             <input 
                               type="number" min="1" 
                               className="w-full border rounded-lg p-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                               value={actionQty}
                               onChange={(e) => setActionQty(parseInt(e.target.value) || 0)}
                             />
                          </div>
                          <div className="flex-1">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Batch/Lot #</label>
                             <input 
                               type="text"
                               placeholder="Optional"
                               className="w-full border rounded-lg p-3 text-lg font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                               value={batchNumber}
                               onChange={(e) => setBatchNumber(e.target.value)}
                             />
                          </div>
                       </div>
                       
                       <div className="flex gap-2 mt-2">
                          <button onClick={handleCreateTransfer} className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-purple-700 flex justify-center items-center gap-2">
                             <Plus size={18} /> Create
                          </button>
                          <button onClick={() => setActionMode('none')} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200">
                             Cancel
                          </button>
                       </div>
                    </div>
                 </div>
               )}

             </div>
           )}

           {/* Error Message */}
           {error && (
             <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up">
               <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                 <SearchX size={20} />
               </div>
               <div>
                 <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">Scan Error</p>
                 <p className="text-slate-800">{error}</p>
               </div>
             </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between text-xs text-slate-500 shrink-0">
           <span>Mode: <strong>Interactive Scanner</strong></span>
           <span className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             Active
           </span>
        </div>
      </div>
    </div>
  );
};

export default ScannerView;
