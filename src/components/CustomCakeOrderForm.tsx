import React, { useState } from 'react';
import { X, Sparkles, Upload, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { translations } from '../translations';

interface CustomCakeOrderFormProps {
  lang: Language;
  onClose: () => void;
}

export const CustomCakeOrderForm: React.FC<CustomCakeOrderFormProps> = ({ lang, onClose }) => {
  const t = translations[lang];

  const [flavor, setFlavor] = useState(t.flavorOptions[0]);
  const [weight, setWeight] = useState(t.weightOptions[0]);
  const [designNotes, setDesignNotes] = useState('');
  const [cakeMessage, setCakeMessage] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Afternoon (2:00 PM – 5:00 PM)');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{ requestCode: string } | null>(null);

  // Tomorrow's date as min
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg(lang === 'en' ? 'Image file size should be under 8MB' : 'ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setReferenceImageUrl(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg(lang === 'en' ? 'Please provide your full name.' : 'অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMsg(lang === 'en' ? 'Please provide a valid Bangladeshi phone number.' : 'একটি বৈধ মোবাইল নম্বর দিন।');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg(lang === 'en' ? 'Delivery address is required.' : 'ডেলিভারি ঠিকানা দিন।');
      return;
    }
    if (!designNotes.trim()) {
      setErrorMsg(lang === 'en' ? 'Please describe your cake design or celebration theme.' : 'কেকের ডিজাইন ও থিম সম্পর্কে লিখুন।');
      return;
    }
    if (!deliveryDate) {
      setErrorMsg(lang === 'en' ? 'Please select a delivery date.' : 'ডেলিভারির কাঙ্ক্ষিত তারিখ নির্বাচন করুন।');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          cake_flavor: flavor,
          cake_weight: weight,
          design_notes: designNotes,
          cake_message: cakeMessage,
          reference_image: referenceImageUrl,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit custom cake request.');
      }

      setSuccessData({ requestCode: data.requestCode });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c59b27', '#e5c158', '#432316'],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred. Please WhatsApp us directly at +8801608627888');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#1c0e07] border border-[#3f2113] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#251209] border-b border-[#3b1e11] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#3d1f10] text-[#e5c158]">
              <Sparkles className="w-5 h-5 text-[#c59b27]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#f7f2eb]">
                {t.customCakeHeading}
              </h2>
              <p className="text-xs text-[#a99485]">
                {lang === 'en' ? 'Crafted by YUM HUB Master Baker in Balaganj' : 'বালাগঞ্জে ইয়াম হাব শেফ দ্বারা প্রস্তুত'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1c0e07] text-[#c4b5a8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {successData ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#2e170c] border border-[#c59b27] text-[#e5c158] flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-9 h-9 text-[#c59b27]" />
              </div>

              <h3 className="text-xl font-serif font-bold text-[#f7f2eb]">
                {t.customOrderSuccess}
              </h3>

              <div className="inline-block px-4 py-2 rounded-lg bg-[#251209] border border-[#432314] font-mono text-base font-bold text-[#e5c158] tabular-nums">
                {lang === 'en' ? 'Request Code:' : 'রিকোয়েস্ট নম্বর:'} {successData.requestCode}
              </div>

              <p className="text-xs sm:text-sm text-[#c4b5a8] max-w-md mx-auto leading-relaxed">
                {t.customOrderSuccessMsg}
              </p>

              <div className="p-4 rounded-xl bg-[#201009] border border-[#381c0f] text-xs text-[#a99485] text-left space-y-1 max-w-md mx-auto">
                <div className="font-semibold text-[#e5c158]">
                  {lang === 'en' ? 'What happens next?' : 'পরবর্তী ধাপসমূহ:'}
                </div>
                <div>1. {lang === 'en' ? 'Status is currently Awaiting Price Confirmation.' : 'বর্তমানে স্ট্যাটাস মূল্য নির্ধারণ ও যাচাইকরণে আছে।'}</div>
                <div>2. {lang === 'en' ? 'Our chef will contact you via phone or WhatsApp with the final price.' : 'আমাদের শেফ আপনাকে ফোন অথবা হোয়াটসঅ্যাপে চূড়ান্ত মূল্য জানাবেন।'}</div>
                <div>3. {lang === 'en' ? 'You can also instantly chat with us below.' : 'নিচের বাটন দিয়ে এখনই হোয়াটসঅ্যাপে চ্যাট শুরু করতে পারেন।'}</div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/8801608627888?text=${encodeURIComponent(
                    `Hello YUM HUB, I just submitted a custom cake request (Code: ${successData.requestCode}). Could you please confirm design availability and price?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.chatWhatsApp} (+8801608627888)</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#251209] hover:bg-[#341b0f] text-[#f7f2eb] border border-[#3e2013] text-xs font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Close Window' : 'উইন্ডো বন্ধ করুন'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Note / Disclaimer Banner */}
              <div className="p-3.5 rounded-xl bg-[#26130b] border border-[#4d2816] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <p className="text-xs text-[#c4b5a8] leading-relaxed">
                  {t.customCakeNote}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Flavor & Weight Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#f7f2eb] mb-1.5">
                    {t.cakeFlavor}
                  </label>
                  <select
                    value={flavor}
                    onChange={(e) => setFlavor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                  >
                    {t.flavorOptions.map((opt, i) => (
                      <option key={i} value={opt} className="bg-[#1c0e07] text-[#f7f2eb]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#f7f2eb] mb-1.5">
                    {t.cakeWeight}
                  </label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                  >
                    {t.weightOptions.map((w, i) => (
                      <option key={i} value={w} className="bg-[#1c0e07] text-[#f7f2eb]">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Design Description */}
              <div>
                <label className="block text-xs font-semibold text-[#f7f2eb] mb-1.5">
                  {t.designDescription} <span className="text-[#c59b27]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  placeholder={t.designDescriptionPlaceholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27] leading-relaxed"
                />
              </div>

              {/* Message to write on cake */}
              <div>
                <label className="block text-xs font-semibold text-[#f7f2eb] mb-1.5">
                  {t.customMessagePrompt}
                </label>
                <input
                  type="text"
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  placeholder={t.customMessagePlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              {/* Reference Image Upload & Preview */}
              <div className="p-3.5 rounded-xl bg-[#201009] border border-[#341b0f] space-y-2.5">
                <label className="block text-xs font-semibold text-[#f7f2eb]">
                  {t.referenceImage}
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                  <input
                    type="text"
                    value={referenceImageUrl.startsWith('data:') ? 'Image attached from file' : referenceImageUrl}
                    onChange={(e) => setReferenceImageUrl(e.target.value)}
                    placeholder={t.referenceImagePlaceholder}
                    className="flex-1 w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                  />

                  <label className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] border border-[#4a2614] text-xs text-[#e5c158] font-medium flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Processing...' : t.uploadPhoto}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {referenceImageUrl && (
                  <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-[#4d2816]">
                    <img
                      src={referenceImageUrl}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setReferenceImageUrl('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Details */}
              <div className="pt-2 border-t border-[#31180d] space-y-3">
                <div className="text-xs font-bold text-[#e5c158] uppercase tracking-wider">
                  {lang === 'en' ? 'Delivery Information' : 'ডেলিভারির তথ্য'}
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                      {t.fullName} <span className="text-[#c59b27]">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
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

                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                    {t.address} <span className="text-[#c59b27]">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. House 14, Balaganj Sadar, Sylhet"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : t.submitCustomOrder}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
