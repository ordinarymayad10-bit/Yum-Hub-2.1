import React from 'react';
import { Star } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface TestimonialsSectionProps {
  lang: Language;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ lang }) => {
  const t = translations[lang];

  const reviews = [
    {
      name: 'Dr. Mahbubur Rahman',
      location: 'Balaganj Bazar, Sylhet',
      occasion: lang === 'en' ? 'Daughter’s 5th Birthday' : 'মেয়ের ৫ম জন্মদিন',
      cake: lang === 'en' ? 'Belgian Dark Truffle Cake (2 lb)' : 'বেলজিয়ান ডার্ক ট্রাফল কেক (২ পাউন্ড)',
      comment: lang === 'en'
        ? 'The Belgian Dark Truffle was simply exquisite. Rich, velvety, and delivered right on time in Balaganj. Our guests couldn’t stop praising the moist layers and cocoa richness.'
        : 'বেলজিয়ান ডার্ক ট্রাফল কেকটি চমৎকার ছিল। টেস্ট একদম পারফেক্ট এবং মিষ্টির ব্যালেন্স অসাধারণ। বালাগঞ্জে সময়মতো অক্ষত অবস্থায় পেয়েছি।',
      date: 'October 2026',
    },
    {
      name: 'Sabrina Hossain',
      location: 'Subidbazar, Sylhet',
      occasion: lang === 'en' ? 'Wedding Reception Cake' : 'বিয়ের রিসেপশন',
      cake: lang === 'en' ? 'Royal Golden Chocolate Wedding Tier Cake' : 'রয়্যাল গোল্ডেন চকোলেট ওয়েডিং টিয়ার কেক',
      comment: lang === 'en'
        ? 'YUM HUB exceeded every expectation for our wedding. The custom multi-tier chocolate design with edible gold was breathtaking and tasted as glorious as it looked!'
        : 'আমাদের বিয়ের জন্য যে কাস্টম চকোলেট কেক অর্ডার করেছিলাম তা অসাধারণ হয়েছিল। গোল্ড লিফ এবং ফিনিশিং ছিল পুরো রাজকীয়!',
      date: 'September 2026',
    },
    {
      name: 'Farhan & Nabila',
      location: 'Osmani Nagar & Balaganj',
      occasion: lang === 'en' ? 'Family Anniversary Party' : 'পরিবারের বিবাহবার্ষিকী',
      cake: lang === 'en' ? 'Sea Salt Brownies & Cupcakes Box' : 'সী-সল্ট ব্রাউনি ও কাপকেক বক্স',
      comment: lang === 'en'
        ? 'The gooey brownies and chocolate cupcakes were a massive hit! Ordering via WhatsApp was seamless, and the delivery packaging was 100% cooling-safe.'
        : 'ব্রাউনিগুলো মুখে দেওয়ার সাথে সাথে গলে যাচ্ছিল! প্যাকেজিং খুবই ভালো ছিল এবং হোয়াটসঅ্যাপে অর্ডার কনফার্মেশন খুবই দ্রুত পেয়েছি।',
      date: 'October 2026',
    },
  ];

  return (
    <section className="py-16 bg-[#180c07] border-t border-[#31180d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-[#c59b27] font-semibold mb-2">
            {lang === 'en' ? 'Verified Celebrations' : 'গ্রাহক পর্যালোচনা'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f7f2eb]">
            {t.reviewsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#a99485] mt-2">
            {t.reviewsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#201009] border border-[#3b1e11] flex flex-col justify-between hover:border-[#c59b27]/40 transition-colors shadow-lg"
            >
              <div>
                <div className="flex items-center gap-1 text-[#e5c158] mb-3">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-current text-[#c59b27]" />
                  ))}
                  <span className="text-[11px] text-[#8e7666] ml-2 font-mono tabular-nums">5.0</span>
                </div>

                <p className="text-xs sm:text-sm text-[#c4b5a8] leading-relaxed italic font-serif">
                  "{r.comment}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#31180d] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#f7f2eb]">{r.name}</h4>
                  <div className="text-[10px] text-[#8e7666] flex items-center gap-1 mt-0.5">
                    <span>{r.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#a99485]">{r.occasion}</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#8e7666] font-mono">{r.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
