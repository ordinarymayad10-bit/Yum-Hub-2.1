import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Language } from '../types';
import { translations } from '../translations';

interface CheckoutModalProps {
  isOpen: boolean;
  lang: Language;
  items: CartItem[];
  onClose: () => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  lang,
  items,
  onClose,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'Balaganj' | 'Sylhet'>('Balaganj');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Afternoon (2:00 PM – 5:00 PM)');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Tomorrow's date as minimum delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const subtotal = items.reduce(
    (sum, item) => sum + item.selectedSize.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 2500;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : (deliveryArea === 'Balaganj' ? 60 : 120);
  const finalTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg(lang === 'en' ? 'Customer name is required' : 'অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter a valid Bangladeshi contact number (e.g. 017XXXXXXXX)'
          : 'একটি সঠিক মোবাইল নম্বর লিখুন (যেমন: ০১৭xxxxxxxx)'
      );
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg(lang === 'en' ? 'Delivery address is required' : 'ডেলিভারি ঠিকানা ও ল্যান্ডমার্ক দিন');
      return;
    }
    if (!deliveryDate) {
      setErrorMsg(lang === 'en' ? 'Please select a delivery date' : 'ডেলিভারির তারিখ নির্বাচন করুন');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_area: deliveryArea,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        notes,
        payment_method: 'Cash on Delivery',
        items: items.map((i) => ({
          id: i.product.id,
          selectedSize: i.selectedSize.size,
          quantity: i.quantity,
          cake_message: i.cake_message || '',
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setConfirmedOrder(data.order);
      onClearCart();

      // Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c59b27', '#e5c158', '#432316', '#22c55e'],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please call/WhatsApp +8801608627888');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#1c0e07] border border-[#3f2113] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#251209] border-b border-[#3b1e11] flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#f7f2eb]">
              {confirmedOrder ? t.orderConfirmed : t.checkoutTitle}
            </h2>
            <p className="text-xs text-[#a99485]">
              {confirmedOrder
                ? 'YUM HUB Artisanal Bakery, Balaganj'
                : lang === 'en' ? 'Cash on Delivery · Secure Backend Verification' : 'ক্যাশ অন ডেলিভারি · নিরাপদ যাচাইকরণ'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#c4b5a8] hover:text-white hover:bg-[#31180d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {confirmedOrder ? (
            /* Post-Order Confirmation State */
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#201009] border border-[#c59b27] flex items-center justify-center mx-auto text-[#c59b27] shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-[#f7f2eb]">
                  {lang === 'en' ? 'Celebration Secured!' : 'অর্ডার নিশ্চিত হয়েছে!'}
                </h3>
                <p className="text-xs sm:text-sm text-[#c4b5a8] max-w-md mx-auto mt-2 leading-relaxed">
                  {t.orderSuccessMessage}
                </p>
              </div>

              {/* Order ID Card */}
              <div className="p-4 rounded-xl bg-[#251209] border border-[#4a2614] max-w-sm mx-auto text-center space-y-1">
                <span className="text-[11px] text-[#a99485] uppercase tracking-wider block">
                  {t.orderIdLabel}
                </span>
                <span className="text-2xl font-mono font-bold text-[#e5c158] tracking-widest tabular-nums block">
                  {confirmedOrder.order_code}
                </span>
                <span className="text-[11px] text-[#8e7666] block">
                  {t.keepOrderIdNote}
                </span>
              </div>

              {/* Order Summary Snapshot */}
              <div className="p-4 rounded-xl bg-[#201009] border border-[#381c0f] max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between text-[#c4b5a8]">
                  <span>{lang === 'en' ? 'Customer:' : 'গ্রাহক:'}</span>
                  <span className="font-semibold text-white">{confirmedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-[#c4b5a8]">
                  <span>{t.deliveryDate}:</span>
                  <span className="text-[#e5c158] font-medium">{confirmedOrder.delivery_date} ({confirmedOrder.delivery_time})</span>
                </div>
                <div className="flex justify-between text-[#c4b5a8]">
                  <span>{t.subtotal}:</span>
                  <span className="font-mono tabular-nums">৳{confirmedOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#c4b5a8]">
                  <span>{t.deliveryFee}:</span>
                  <span className="font-mono tabular-nums">৳{confirmedOrder.delivery_fee?.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-[#31180d] flex justify-between text-sm font-bold text-white">
                  <span>{t.total} ({confirmedOrder.payment_method}):</span>
                  <span className="font-mono text-[#e5c158] tabular-nums">৳{confirmedOrder.total?.toLocaleString()} BDT</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/8801608627888?text=${encodeURIComponent(
                    `Hello YUM HUB, I just placed an order (Order ID: ${confirmedOrder.order_code}) for ৳${confirmedOrder.total} BDT on ${confirmedOrder.delivery_date}. Please confirm dispatch details.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.chatWhatsApp}</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] text-[#f7f2eb] border border-[#4a2614] text-xs font-semibold cursor-pointer"
                >
                  {t.continueShopping}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Order Items Preview */}
              <div className="p-3.5 rounded-xl bg-[#201009] border border-[#381c0f] space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-[#f7f2eb]">
                  <span>{lang === 'en' ? 'Order Summary' : 'অর্ডারের বিবরণ'}</span>
                  <span className="text-[#e5c158]">{items.length} {lang === 'en' ? 'items' : 'টি পদ'}</span>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-[#a99485]">
                      <span className="truncate pr-2">
                        {lang === 'bn' ? i.product.name_bn : i.product.name_en} ({i.selectedSize.size}) × {i.quantity}
                      </span>
                      <span className="font-mono text-white tabular-nums shrink-0">
                        ৳{(i.selectedSize.price * i.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                    {t.fullName} <span className="text-[#c59b27]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Nafis Chowdhury"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                    {t.phone} <span className="text-[#c59b27]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Delivery Area Picker */}
              <div>
                <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                  {t.deliveryArea}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('Balaganj')}
                    className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                      deliveryArea === 'Balaganj'
                        ? 'bg-[#2f180c] border-[#c59b27] text-white'
                        : 'bg-[#201009] border-[#381c0f] text-[#a99485]'
                    }`}
                  >
                    <div className="font-semibold">{t.deliveryAreaBalaganj}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryArea('Sylhet')}
                    className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                      deliveryArea === 'Sylhet'
                        ? 'bg-[#2f180c] border-[#c59b27] text-white'
                        : 'bg-[#201009] border-[#381c0f] text-[#a99485]'
                    }`}
                  >
                    <div className="font-semibold">{t.deliveryAreaSylhet}</div>
                  </button>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                  {t.address} <span className="text-[#c59b27]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Village, Road number, Near landmark, Balaganj"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              {/* Delivery Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                    {t.deliveryDate} <span className="text-[#c59b27]">*</span>
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                    {t.deliveryTime}
                  </label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                  >
                    <option value="Morning (10:00 AM – 1:00 PM)">{t.deliveryTimeSlots.slot1}</option>
                    <option value="Afternoon (2:00 PM – 5:00 PM)">{t.deliveryTimeSlots.slot2}</option>
                    <option value="Evening (6:00 PM – 9:00 PM)">{t.deliveryTimeSlots.slot3}</option>
                    <option value="Flexible / Anytime">{t.deliveryTimeSlots.slot4}</option>
                  </select>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                  {t.orderNotes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please bring candles, ring the bell gently"
                  className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              {/* Price Calculation Card */}
              <div className="pt-2 border-t border-[#31180d] space-y-1.5 text-xs text-[#c4b5a8]">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-mono text-white tabular-nums">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>{t.deliveryFee} ({deliveryArea})</span>
                  {isFreeDelivery ? (
                    <span className="text-emerald-400 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    <span className="font-mono text-white tabular-nums">৳{deliveryFee}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-[#31180d] flex justify-between text-sm font-bold text-[#f7f2eb]">
                  <span>{t.total} (Cash on Delivery)</span>
                  <span className="font-mono text-[#e5c158] tabular-nums text-base">
                    ৳{finalTotal.toLocaleString()} BDT
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? t.placingOrder : t.confirmOrder}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
