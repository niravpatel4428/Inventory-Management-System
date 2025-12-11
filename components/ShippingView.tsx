import React, { useState } from 'react';
import { CARRIERS } from '../constants';
import { Truck, Check, Globe } from 'lucide-react';

const ShippingView: React.FC = () => {
  const [activeCarriers, setActiveCarriers] = useState<string[]>(['fedex', 'ups']);

  const toggleCarrier = (id: string) => {
    if (activeCarriers.includes(id)) {
      setActiveCarriers(activeCarriers.filter(c => c !== id));
    } else {
      setActiveCarriers([...activeCarriers, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-8 h-8 text-indigo-600" />
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Shipping Carriers</h2>
           <p className="text-slate-500">Manage integrations and real-time rates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARRIERS.map(carrier => {
          const isActive = activeCarriers.includes(carrier.id);
          return (
            <div key={carrier.id} className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              isActive ? 'border-indigo-500 bg-white shadow-md' : 'border-slate-100 bg-slate-50 opacity-70 grayscale'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-16 h-16 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-2">
                      <img src={carrier.logo} alt={carrier.name} className="max-w-full max-h-full object-contain" />
                   </div>
                   <button 
                      onClick={() => toggleCarrier(carrier.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                   >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-1">{carrier.name} Express</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                   <span className="flex items-center gap-1"><Globe size={14} /> Global</span>
                   <span>•</span>
                   <span>Base Rate: ${carrier.rate}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium">
                   <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">Tracking API</span>
                   <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">Label Printing</span>
                </div>
              </div>
              
              {isActive && (
                <div className="bg-indigo-50 px-6 py-2 flex items-center gap-2 text-indigo-700 text-xs font-bold border-t border-indigo-100">
                   <Check size={14} /> INTEGRATION ACTIVE
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingView;