import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, Truck, Cake, AlertCircle, MessageCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface OrderTrackerModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  lang,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    const cleanCode = code.trim().toUpperCase();

    try {
      if (cleanCode.startsWith('CC-')) {
        // Custom order lookup
        const res = await fetch(`/api/custom-orders/lookup?code=${encodeURIComponent(cleanCode)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Custom cake request not found');
        setIsCustom(true);
        setResult(data.customOrder);
      } else {
        // Standard order lookup
        const res = await fetch(`/api/orders/lookup?code=${encodeURIComponent(cleanCode)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order not found');
        setIsCustom(false);
        setResult(data.order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Order not found. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return <span className="text-emerald-400 font-semibold">{status}</span>;
      case 'Shipped':
      case 'Baking':
      case 'Processing':
        return <span className="text-amber-400 font-semibold">{status}</span>;
      case 'Confirmed':
      case 'Price Quoted':
        return <span className="text-blue-400 font-semibold">{status}</span>;
      case 'Cancelled':
        return <span className="text-red-400 font-semibold">{status}</span>;
      default:
        return <span className="text-[#c59b27] font-semibold">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#1c0e07] border border-[#3f2113] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 bg-[#251209] border-b border-[#3b1e11] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#f7f2eb]">{t.trackTitle}</h2>
            <p className="text-xs text-[#a99485]">{t.trackSub}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#c4b5a8] hover:text-white hover:bg-[#31180d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. YH-58192 or CC-4921"
              required
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] font-mono tracking-wider focus:outline-none focus:border-[#c59b27]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#c59b27] hover:bg-[#d4af37] text-[#160b06] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : t.trackButton}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-[#221008] border border-[#3b1e11] space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-[#31180d] pb-3">
                <div>
                  <div className="text-[11px] text-[#a99485] uppercase tracking-wider">
                    {isCustom ? 'Custom Cake Request' : 'Standard Cake Order'}
                  </div>
                  <div className="text-base font-mono font-bold text-[#e5c158] tabular-nums">
                    {isCustom ? result.request_code : result.order_code}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#8e7666]">Status</div>
                  <div className="text-sm">{getStatusBadge(result.status)}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#c4b5a8]">
                <div className="flex justify-between">
                  <span>{lang === 'en' ? 'Customer Name:' : 'গ্রাহক:'}</span>
                  <span className="font-semibold text-white">{result.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.deliveryDate}:</span>
                  <span className="text-[#f7f2eb]">{result.delivery_date} ({result.delivery_time})</span>
                </div>

                {isCustom ? (
                  <>
                    <div className="flex justify-between">
                      <span>{t.cakeFlavor}:</span>
                      <span className="text-[#f7f2eb]">{result.cake_flavor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.cakeWeight}:</span>
                      <span className="text-[#f7f2eb]">{result.cake_weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'en' ? 'Confirmed Price:' : 'নির্ধারিত মূল্য:'}</span>
                      <span className="font-mono text-[#e5c158] font-bold">
                        {result.estimated_price > 0 ? `৳${result.estimated_price} BDT` : 'Awaiting Confirmation'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>{t.total}:</span>
                      <span className="font-mono text-[#e5c158] font-bold">৳{result.total?.toLocaleString()} BDT</span>
                    </div>
                    {result.items && (
                      <div className="pt-2 border-t border-[#31180d]">
                        <span className="text-[11px] text-[#8e7666] block mb-1">Purchased Items:</span>
                        <div className="space-y-1">
                          {result.items.map((it: any, idx: number) => (
                            <div key={idx} className="text-[#f7f2eb] flex justify-between">
                              <span>• {it.name_en} ({it.selectedSize})</span>
                              <span className="font-mono">× {it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-[#31180d] flex items-center justify-between">
                <span className="text-[11px] text-[#8e7666]">Questions regarding your cake?</span>
                <a
                  href={`https://wa.me/8801608627888?text=${encodeURIComponent(
                    `Hello YUM HUB, checking status of ${isCustom ? result.request_code : result.order_code}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#25D366] hover:underline flex items-center gap-1 font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp +8801608627888</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
