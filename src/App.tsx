import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Cake,
  ArrowRight,
  Shield,
  Clock,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { Product, CakeSize, CartItem, Language } from './types';
import { translations } from './translations';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CustomCakeOrderForm } from './components/CustomCakeOrderForm';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BakeryFooter } from './components/BakeryFooter';
import { AdminPanel } from './components/AdminPanel';
import { safeStorage } from './utils/storage';

export default function App() {
  // Language State
  const [lang, setLang] = useState<Language>(() => {
    return (safeStorage.getItem('yumhub_lang') as Language) || 'en';
  });

  const handleSetLang = (l: Language) => {
    setLang(l);
    safeStorage.setItem('yumhub_lang', l);
  };

  const t = translations[lang];

  // View state: 'home' | 'catalog' | 'track' | 'admin'
  const [currentView, setCurrentView] = useState<string>('home');

  // Products from Database API
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Cart State (Persisted in safeStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = safeStorage.getItem('yumhub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeStorage.setItem('yumhub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomCakeOpen, setIsCustomCakeOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);

  // Fetch Products from real backend API
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    selectedSize: CakeSize,
    quantity: number,
    cakeMessage?: string
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedSize.size === selectedSize.size &&
          i.cake_message === cakeMessage
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            id: Date.now(),
            product,
            selectedSize,
            quantity,
            cake_message: cakeMessage,
          },
        ];
      }
    });
  };

  const handleQuickAdd = (product: Product) => {
    const size = product.sizes && product.sizes.length > 0
      ? product.sizes[0]
      : { size: '1 lb', weight: '1 lb', price: product.base_price, serves: '3-4 persons' };
    handleAddToCart(product, size, 1);
    setIsCartOpen(true);
  };

  const handleBuyNow = (
    product: Product,
    selectedSize: CakeSize,
    quantity: number,
    cakeMessage?: string
  ) => {
    handleAddToCart(product, selectedSize, quantity, cakeMessage);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (id: number, sizeLabel: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(id, sizeLabel);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize.size === sizeLabel
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const handleRemoveItem = (id: number, sizeLabel: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === id && i.selectedSize.size === sizeLabel))
    );
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Filtered & Sorted Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      selectedCategory === 'সবগুলো' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name_en.toLowerCase().includes(q) ||
      p.name_bn.toLowerCase().includes(q) ||
      p.description_en.toLowerCase().includes(q) ||
      p.description_bn.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceLow') return a.base_price - b.base_price;
    if (sortBy === 'priceHigh') return b.base_price - a.base_price;
    return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0);
  });

  const categoriesList = [
    { id: 'All', labelEn: t.categories.all, labelBn: t.categories.all },
    { id: 'Best Sellers', labelEn: t.categories.bestSellers, labelBn: t.categories.bestSellers },
    { id: 'Birthday Cakes', labelEn: t.categories.birthdayCakes, labelBn: t.categories.birthdayCakes },
    { id: 'Chocolate Cakes', labelEn: t.categories.chocolateCakes, labelBn: t.categories.chocolateCakes },
    { id: 'Wedding Cakes', labelEn: t.categories.weddingCakes, labelBn: t.categories.weddingCakes },
    { id: 'Cupcakes', labelEn: t.categories.cupcakes, labelBn: t.categories.cupcakes },
    { id: 'Brownies', labelEn: t.categories.brownies, labelBn: t.categories.brownies },
  ];

  // If viewing Admin Panel
  if (currentView === 'admin') {
    return <AdminPanel lang={lang} onExit={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#160b06] text-[#f7f2eb] flex flex-col selection:bg-[#c59b27] selection:text-[#160b06]">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={handleSetLang}
        currentView={currentView}
        setCurrentView={(v) => {
          if (v === 'track') {
            setIsTrackOrderOpen(true);
          } else {
            setCurrentView(v);
          }
        }}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        openCustomCakeModal={() => setIsCustomCakeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Hero
            lang={lang}
            onShopClick={() => {
              const el = document.getElementById('cake-catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onCustomCakeClick={() => setIsCustomCakeOpen(true)}
          />
        )}

        {/* Product Catalog Section */}
        <section id="cake-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30180d] pb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#c59b27] font-semibold mb-1">
                {lang === 'en' ? 'Fresh From Our Balaganj Oven' : 'আমাদের ওভেন থেকে তাজা'}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#f7f2eb]">
                {currentView === 'catalog' ? t.catalog : (lang === 'en' ? 'Artisanal Cake Collection' : 'প্রিমিয়াম কেক সম্ভার')}
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#8e7666]" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#201009] border border-[#3b1e11] text-xs text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27] transition-colors"
              />
            </div>
          </div>

          {/* Interactive Category Segmented Controls & Sort Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Functional Category Buttons (Allowed Segmented Filter Controls per Frontend Constitution) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#c59b27] text-[#160b06] font-semibold shadow-sm'
                        : 'bg-[#201009] text-[#c4b5a8] hover:text-white hover:bg-[#2b160d] border border-[#361b0f]'
                    }`}
                  >
                    {lang === 'bn' ? cat.labelBn : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
              <span className="text-xs text-[#8e7666]">{t.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#201009] border border-[#3b1e11] text-xs text-[#f7f2eb] focus:outline-none cursor-pointer"
              >
                <option value="featured">{t.sortOptions.featured}</option>
                <option value="priceLow">{t.sortOptions.priceLow}</option>
                <option value="priceHigh">{t.sortOptions.priceHigh}</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#a99485] font-serif">
                {lang === 'en' ? 'Preparing bakery showcase...' : 'বেকারি আইটেম লোড হচ্ছে...'}
              </p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[#1e0e07] rounded-2xl border border-[#31180d] p-8">
              <Cake className="w-12 h-12 text-[#8e7666] mx-auto stroke-1" />
              <h3 className="text-base font-serif font-semibold text-white">
                {lang === 'en' ? 'No cakes matched your search' : 'কোনো কেক পাওয়া যায়নি'}
              </h3>
              <p className="text-xs text-[#a99485]">
                {lang === 'en' ? 'Try searching another flavor, or order a custom cake!' : 'অন্য কোনো নাম দিয়ে খুঁজুন অথবা আপনার পছন্দের কাস্টম কেক অর্ডার করুন!'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] border border-[#4a2614] text-xs text-[#e5c158] cursor-pointer"
              >
                {lang === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট করুন'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  onSelect={(p) => setSelectedProduct(p)}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          )}
        </section>

        {/* Custom Cake Banner Promo */}
        <section className="bg-gradient-to-r from-[#201009] via-[#2d150b] to-[#201009] border-y border-[#341b0f] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#c59b27] font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Custom Celebration Artistry' : 'বিশেষ কাস্টম কেক'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#f7f2eb]">
                  {lang === 'en'
                    ? 'Have a Unique Dream Cake in Mind?'
                    : 'আপনার মনের মতো ডিজাইনের কেক চান?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#c4b5a8] leading-relaxed max-w-2xl">
                  {lang === 'en'
                    ? 'Send us a photo or describe your celebration theme. Our pastry master in Balaganj will handcraft your bespoke creation with pure chocolate layers and custom decor.'
                    : 'যেকোনো ছবি বা ডিজাইন আমাদের পাঠান। আমাদের মাস্টার শেফ যত্ন সহকারে আপনার মনের মতো কেক তৈরি করে দেবেন।'}
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <button
                  onClick={() => setIsCustomCakeOpen(true)}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.orderCustomCake}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Genuine Customer Testimonials */}
        <TestimonialsSection lang={lang} />
      </main>

      {/* Bakery Footer */}
      <BakeryFooter
        lang={lang}
        onNavigateAdmin={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateCustomCake={() => setIsCustomCakeOpen(true)}
        onNavigateTrack={() => setIsTrackOrderOpen(true)}
        onNavigateCatalog={() => {
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/8801608627888?text=Hello%20YUM%20HUB%20Bakery,%20I%20would%20like%20to%20inquire%20about%20ordering%20a%20cake."
        target="_blank"
        rel="noreferrer"
        aria-label="Direct WhatsApp Chat"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-105 transition-transform flex items-center justify-center border-2 border-white/20"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Mobile Sticky Quick Buy / Cart Bar (adhering to mobile sticky cap) */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-[#1c0e07]/95 backdrop-blur-md border-t border-[#3b1e11] p-3 px-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#a99485] uppercase">
              {totalCartCount} {lang === 'en' ? 'Item(s)' : 'আইটেম'}
            </div>
            <div className="text-sm font-bold font-mono text-[#e5c158] tabular-nums">
              ৳{cartItems.reduce((acc, i) => acc + i.selectedSize.price * i.quantity, 0).toLocaleString()} BDT
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-[#c59b27] text-[#160b06] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'en' ? 'View Bag' : 'ব্যাগ দেখুন'}</span>
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        lang={lang}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Custom Cake Order Modal */}
      {isCustomCakeOpen && (
        <CustomCakeOrderForm
          lang={lang}
          onClose={() => setIsCustomCakeOpen(false)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        lang={lang}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        lang={lang}
        items={cartItems}
        onClose={() => setIsCheckoutOpen(false)}
        onClearCart={() => setCartItems([])}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackOrderOpen}
        lang={lang}
        onClose={() => setIsTrackOrderOpen(false)}
      />
    </div>
  );
}
