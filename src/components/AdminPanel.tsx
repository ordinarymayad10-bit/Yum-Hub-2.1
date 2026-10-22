import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Layers,
  Settings as SettingsIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Upload,
  MessageCircle,
  ExternalLink,
  Search,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { Product, CakeSize, Order, CustomOrder, Language } from '../types';
import { safeStorage } from '../utils/storage';

interface AdminPanelProps {
  lang: Language;
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, onExit }) => {
  const [token, setToken] = useState<string>(() => safeStorage.getItem('yumhub_admin_token') || '');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [verifying, setVerifying] = useState<boolean>(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('mnonly357@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('mnonly357@gmail.com');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetGeneratedCode, setResetGeneratedCode] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [resetErrorMessage, setResetErrorMessage] = useState('');

  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'custom' | 'products' | 'inventory' | 'settings'>('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(false);

  // Filter / Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Product Add / Edit Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name_en: '',
    name_bn: '',
    description_en: '',
    description_bn: '',
    category: 'Chocolate Cakes',
    base_price: 950,
    sizes: [
      { size: '1 Pound (১ পাউন্ড)', weight: '1 lb', price: 950, serves: '3-4 persons' },
      { size: '2 Pound (২ পাউন্ড)', weight: '2 lb', price: 1800, serves: '7-9 persons' },
    ] as CakeSize[],
    image_url: '/src/assets/images/hero_chocolate_cake_1792698652472.jpg',
    in_stock: true,
    is_bestseller: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Reference Image Lightbox Modal
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Verify token on load via POST /api/admin/verify
  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setVerifying(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setAdminUser(data.admin);
        } else {
          safeStorage.removeItem('yumhub_admin_token');
          setToken('');
        }
      } catch (err) {
        safeStorage.removeItem('yumhub_admin_token');
        setToken('');
      } finally {
        setVerifying(false);
      }
    }
    checkToken();
  }, [token]);

  // Load Admin Data when authenticated
  const fetchAllData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ordersRes, customRes, prodsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/custom-orders', { headers }),
        fetch('/api/products'),
        fetch('/api/admin/settings', { headers }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || []);
      }
      if (customRes.ok) {
        const d = await customRes.json();
        setCustomOrders(d.customOrders || []);
      }
      if (prodsRes.ok) {
        const d = await prodsRes.json();
        setProducts(d.products || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        setStoreSettings(d.settings || {});
        setSettingsForm(d.settings || {});
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (adminUser && token) {
      fetchAllData();
    }
  }, [adminUser, token]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Check your password.');
      }

      safeStorage.setItem('yumhub_admin_token', data.token);
      setToken(data.token);
      setAdminUser(data.admin);
    } catch (err: any) {
      setLoginError(err.message || 'Login error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    safeStorage.removeItem('yumhub_admin_token');
    setToken('');
    setAdminUser(null);
  };

  // Handle requesting password reset recovery code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage('');
    setResetSuccessMessage('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate recovery code.');
      }
      setResetGeneratedCode(data.recoveryCode || '');
      setResetCode(data.recoveryCode || '');
      setResetStep(2);
      setResetSuccessMessage(
        lang === 'bn'
          ? `আপনার অ্যাকাউন্ট ভেরিফিকেশন কোড: ${data.recoveryCode}`
          : `Recovery Code generated: ${data.recoveryCode}. Enter new password below.`
      );
    } catch (err: any) {
      setResetErrorMessage(err.message || 'Error occurred.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle resetting password with recovery code
  const handlePerformReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage('');
    setResetSuccessMessage('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          new_password: resetNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }
      setResetSuccessMessage(
        lang === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করা হচ্ছে...'
          : 'Password successfully changed! Logging you in with new password...'
      );
      setLoginPassword(resetNewPassword);
      setTimeout(() => {
        setIsResetMode(false);
        setResetStep(1);
        setResetGeneratedCode('');
        setResetNewPassword('');
        setResetCode('');
      }, 1800);
    } catch (err: any) {
      setResetErrorMessage(err.message || 'Error resetting password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o))
        );
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update custom order status or price
  const handleUpdateCustomOrder = async (
    customId: number,
    status: string,
    estimatedPrice?: number,
    adminNotes?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/custom-orders/${customId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          estimated_price: estimatedPrice,
          admin_notes: adminNotes,
        }),
      });
      if (res.ok) {
        setCustomOrders((prev) =>
          prev.map((c) =>
            c.id === customId
              ? {
                  ...c,
                  status: status as any,
                  estimated_price: estimatedPrice ?? c.estimated_price,
                  admin_notes: adminNotes ?? c.admin_notes,
                }
              : c
          )
        );
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle inventory stock
  const handleToggleStock = async (productId: number, currentStock: boolean) => {
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ in_stock: !currentStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, in_stock: !currentStock } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Image Upload in Admin
  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setProdForm((prev) => ({ ...prev, image_url: data.url }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prodForm),
      });

      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bakery item from the catalog?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: settingsForm,
          new_password: newAdminPassword || undefined,
        }),
      });
      if (res.ok) {
        setSettingsSuccess('Settings and store preferences updated successfully!');
        setNewAdminPassword('');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#160b06] flex items-center justify-center text-[#c59b27]">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Verifying secure admin session...</span>
        </div>
      </div>
    );
  }

  // If Not Authenticated -> Show Admin Login Form or Forgot Password Form
  if (!token || !adminUser) {
    return (
      <div className="min-h-screen bg-[#140a05] py-16 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-[#1c0e07] border border-[#3f2113] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#2e170c] border border-[#c59b27] text-[#c59b27] flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#f7f2eb]">
              YUM HUB Admin Portal
            </h1>
            <p className="text-xs text-[#a99485]">
              {isResetMode
                ? (lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড রিসেট সিস্টেম' : 'Admin Password Recovery & Reset')
                : (lang === 'bn' ? 'বালাগঞ্জ বেকারি কন্ট্রোল ও অর্ডার ম্যানেজমেন্ট' : 'Balaganj Bakery Management & Order Control')}
            </p>
          </div>

          {!isResetMode ? (
            /* ================= LOGIN FORM ================= */
            <>
              {loginError && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#c4b5a8] mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>{lang === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Admin Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#c4b5a8] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{lang === 'bn' ? 'পাসওয়ার্ড' : 'Secure Password'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setResetErrorMessage('');
                        setResetSuccessMessage('');
                        setResetEmail(loginEmail || 'mnonly357@gmail.com');
                      }}
                      className="text-[11px] text-[#e5c158] hover:underline cursor-pointer"
                    >
                      {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={lang === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Enter password'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>

                {/* Quick Credentials Info & 1-Click Auto Fill */}
                <div className="p-3 rounded-lg bg-[#221008] border border-[#341b0f] text-[11px] text-[#a99485] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#e5c158] font-bold">
                      {lang === 'bn' ? 'মালিকের ডিফল্ট পাসওয়ার্ড:' : 'Default Credentials:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLoginPassword('YumHub@2026!')}
                      className="px-2 py-0.5 rounded bg-[#3b1d0e] border border-[#6b3a1d] text-[#e5c158] hover:bg-[#4d2511] font-mono text-[10px] cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? 'অটো-ফিল করুন' : 'Auto Fill'}
                    </button>
                  </div>
                  <div className="font-mono text-white text-[10px] bg-[#170a05] px-2 py-1 rounded border border-[#2b140a]">
                    Email: <span className="text-[#e5c158]">mnonly357@gmail.com</span><br />
                    Password: <span className="text-[#e5c158]">YumHub@2026!</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loginLoading ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...') : (lang === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to Dashboard')}</span>
                </button>
              </form>
            </>
          ) : (
            /* ================= PASSWORD RESET FORM ================= */
            <div className="space-y-4">
              {resetErrorMessage && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetErrorMessage}</span>
                </div>
              )}

              {resetSuccessMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              {resetStep === 1 ? (
                /* Step 1: Request Recovery Code */
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#c4b5a8] mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{lang === 'bn' ? 'অ্যাডমিন ইমেইল এড্রেস' : 'Admin Email Address'}</span>
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                    />
                  </div>

                  <p className="text-[11px] text-[#a99485] leading-relaxed">
                    {lang === 'bn'
                      ? 'বাটনে ক্লিক করলে তাৎক্ষণিক ৬-সংখ্যার সিকিউরিটি কোড তৈরি হবে যার মাধ্যমে আপনি নতুন পাসওয়ার্ড সেট করতে পারবেন।'
                      : 'Click below to instantly generate a 6-digit recovery code to set your new password.'}
                  </p>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${resetLoading ? 'animate-spin' : ''}`} />
                    <span>{resetLoading ? (lang === 'bn' ? 'কোড তৈরি হচ্ছে...' : 'Generating Code...') : (lang === 'bn' ? 'সিকিউরিটি কোড গ্রহণ করুন' : 'Get Recovery Code')}</span>
                  </button>
                </form>
              ) : (
                /* Step 2: Input Recovery Code & New Password */
                <form onSubmit={handlePerformReset} className="space-y-4">
                  {resetGeneratedCode && (
                    <div className="p-3 rounded-lg bg-[#2e170c] border border-[#c59b27] text-center space-y-1">
                      <span className="text-[10px] text-[#c4b5a8] uppercase tracking-wider block">
                        {lang === 'bn' ? 'আপনার সিকিউরিটি কোড' : 'Your Recovery Code'}
                      </span>
                      <div className="text-xl font-mono font-bold tracking-widest text-[#e5c158]">
                        {resetGeneratedCode}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#c4b5a8] mb-1">
                      {lang === 'bn' ? '৬-সংখ্যার কোড' : '6-Digit Recovery Code'}
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 123456"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] font-mono tracking-wider focus:outline-none focus:border-[#c59b27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#c4b5a8] mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{lang === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}</span>
                    </label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder={lang === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন' : 'Enter new password'}
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] focus:outline-none focus:border-[#c59b27]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{resetLoading ? (lang === 'bn' ? 'রিসেট করা হচ্ছে...' : 'Resetting Password...') : (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন' : 'Confirm & Save New Password')}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetErrorMessage('');
                    setResetSuccessMessage('');
                  }}
                  className="text-xs text-[#c59b27] hover:underline cursor-pointer"
                >
                  ← {lang === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Admin Login'}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 text-center border-t border-[#2e170c]">
            <button
              onClick={onExit}
              className="text-xs text-[#a99485] hover:text-[#e5c158] transition-colors cursor-pointer"
            >
              ← {lang === 'bn' ? 'বেকারি শপে ফিরুন' : 'Return to Bakery Storefront'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const pendingCustomCount = customOrders.filter((c) => c.status === 'Pending Review').length;

  return (
    <div className="min-h-screen bg-[#140a05] text-[#f7f2eb] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#1c0e07] border-b border-[#361a0e] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="text-xs text-[#a99485] hover:text-[#e5c158] transition-colors cursor-pointer"
          >
            ← Storefront
          </button>
          <div className="h-4 w-px bg-[#361a0e]" />
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c59b27]" />
            <span className="font-serif font-bold text-base tracking-wide text-white">
              YUM HUB Control Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Alert */}
          {(pendingOrdersCount > 0 || pendingCustomCount > 0) && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#3d1a0a] border border-[#c59b27]/60 text-xs text-[#e5c158]">
              <Bell className="w-3.5 h-3.5 text-[#c59b27] animate-bounce" />
              <span>
                {pendingOrdersCount} orders · {pendingCustomCount} custom pending
              </span>
            </div>
          )}

          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">{adminUser.name}</div>
            <div className="text-[10px] text-[#a99485] font-mono">{adminUser.email}</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-[#271309] hover:bg-[#381a0c] border border-[#3e2013] text-[#c4b5a8] hover:text-white transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#2e170c]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#c59b27] text-[#160b06]'
                : 'text-[#c4b5a8] hover:text-white hover:bg-[#201009]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'orders'
                ? 'bg-[#c59b27] text-[#160b06]'
                : 'text-[#c4b5a8] hover:text-white hover:bg-[#201009]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'custom'
                ? 'bg-[#c59b27] text-[#160b06]'
                : 'text-[#c4b5a8] hover:text-white hover:bg-[#201009]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Custom Cake Requests</span>
            {pendingCustomCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingCustomCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#c59b27] text-[#160b06]'
                : 'text-[#c4b5a8] hover:text-white hover:bg-[#201009]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#c59b27] text-[#160b06]'
                : 'text-[#c4b5a8] hover:text-white hover:bg-[#201009]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stock & Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#c59b27] text-[#160b06]'
                : 'text-[#c4b5a8] hover:text-white hover:bg-[#201009]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Store Settings</span>
          </button>

          <button
            onClick={fetchAllData}
            title="Refresh database"
            className="ml-auto p-2 rounded-lg text-[#a99485] hover:text-white hover:bg-[#221008] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-[#c59b27]' : ''}`} />
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#1c0e07] border border-[#381c0f] shadow-lg">
                <div className="text-[11px] text-[#a99485] uppercase tracking-wider">Total Sales Revenue</div>
                <div className="text-2xl font-serif font-bold text-[#e5c158] mt-1 tabular-nums">
                  ৳{stats.total_revenue?.toLocaleString()} BDT
                </div>
                <div className="text-[10px] text-[#8e7666] mt-1">Confirmed & Completed</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c0e07] border border-[#381c0f] shadow-lg">
                <div className="text-[11px] text-[#a99485] uppercase tracking-wider">Total Customer Orders</div>
                <div className="text-2xl font-serif font-bold text-white mt-1 tabular-nums">
                  {stats.total_orders}
                </div>
                <div className="text-[10px] text-[#e5c158] mt-1">
                  {stats.pending_orders} pending action
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c0e07] border border-[#381c0f] shadow-lg">
                <div className="text-[11px] text-[#a99485] uppercase tracking-wider">Custom Cake Inquiries</div>
                <div className="text-2xl font-serif font-bold text-white mt-1 tabular-nums">
                  {customOrders.length}
                </div>
                <div className="text-[10px] text-[#c59b27] mt-1">
                  {stats.pending_custom_cakes} awaiting quote
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c0e07] border border-[#381c0f] shadow-lg">
                <div className="text-[11px] text-[#a99485] uppercase tracking-wider">Catalog Products</div>
                <div className="text-2xl font-serif font-bold text-white mt-1 tabular-nums">
                  {stats.total_products}
                </div>
                <div className="text-[10px] text-[#8e7666] mt-1">
                  {stats.out_of_stock_products} currently sold out
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-2xl bg-[#1c0e07] border border-[#381c0f] shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-white">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#c59b27] hover:underline cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#a99485] uppercase text-[10px] border-b border-[#31180d]">
                    <tr>
                      <th className="py-2.5">Order Code</th>
                      <th>Customer</th>
                      <th>Delivery Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a1308]">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-[#221008]">
                        <td className="py-3 font-mono text-[#e5c158] font-bold">{o.order_code}</td>
                        <td className="text-white font-medium">{o.customer_name}</td>
                        <td className="text-[#a99485]">{o.delivery_date}</td>
                        <td className="font-mono tabular-nums">৳{o.total?.toLocaleString()}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            o.status === 'Pending' ? 'bg-amber-950 text-amber-300' : 'bg-[#251209] text-white'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8e7666]" />
                <input
                  type="text"
                  placeholder="Search by order ID, name, or phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#1c0e07] border border-[#381c0f] text-xs text-white placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-[#a99485]">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#1c0e07] border border-[#381c0f] text-xs text-white focus:outline-none"
                >
                  <option value="All">All Statuses ({orders.length})</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-[#1c0e07] border border-[#381c0f] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#a99485] uppercase text-[10px] bg-[#221008] border-b border-[#31180d]">
                    <tr>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Items & Cake Writing</th>
                      <th className="p-4">Delivery Slot & Address</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status & Update</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a1308]">
                    {orders
                      .filter((o) => {
                        const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                        const term = orderSearch.toLowerCase();
                        const matchesSearch =
                          !term ||
                          o.order_code.toLowerCase().includes(term) ||
                          o.customer_name.toLowerCase().includes(term) ||
                          o.customer_phone.includes(term);
                        return matchesStatus && matchesSearch;
                      })
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-[#201009]/60">
                          <td className="p-4 align-top">
                            <div className="font-mono font-bold text-sm text-[#e5c158]">{order.order_code}</div>
                            <div className="text-[10px] text-[#8e7666] mt-0.5">{order.created_at}</div>
                            <div className="text-[10px] text-[#a99485] mt-1">{order.payment_method}</div>
                          </td>

                          <td className="p-4 align-top space-y-1">
                            <div className="font-bold text-white text-sm">{order.customer_name}</div>
                            <div className="text-xs text-[#e5c158] font-mono">{order.customer_phone}</div>
                          </td>

                          <td className="p-4 align-top space-y-1.5 max-w-xs">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="p-1.5 rounded bg-[#160b06] border border-[#2e170c]">
                                <div className="font-semibold text-white">
                                  {item.name_en} ({item.selectedSize}) × {item.quantity}
                                </div>
                                {item.cake_message && (
                                  <div className="text-[11px] text-[#c59b27] italic mt-0.5">
                                    Message: "{item.cake_message}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </td>

                          <td className="p-4 align-top space-y-1 max-w-xs">
                            <div className="text-white font-medium">
                              📅 {order.delivery_date} ({order.delivery_time})
                            </div>
                            <div className="text-[11px] text-[#a99485] leading-relaxed">
                              📍 {order.delivery_address} ({order.delivery_area})
                            </div>
                            {order.notes && (
                              <div className="text-[10px] text-[#c59b27] bg-[#221008] p-1 rounded">
                                Note: {order.notes}
                              </div>
                            )}
                          </td>

                          <td className="p-4 align-top">
                            <div className="font-mono font-bold text-sm text-[#f7f2eb] tabular-nums">
                              ৳{order.total?.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-[#8e7666]">
                              Sub: ৳{order.subtotal} | Fee: ৳{order.delivery_fee}
                            </div>
                          </td>

                          <td className="p-4 align-top">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${
                                order.status === 'Pending'
                                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                                  : order.status === 'Confirmed'
                                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                                  : order.status === 'Processing'
                                  ? 'bg-purple-950 border-purple-700 text-purple-300'
                                  : order.status === 'Shipped'
                                  ? 'bg-yellow-950 border-yellow-700 text-yellow-300'
                                  : order.status === 'Delivered'
                                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                                  : 'bg-red-950 border-red-700 text-red-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="p-4 align-top">
                            <a
                              href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${order.customer_name}, this is YUM HUB Bakery regarding your order (${order.order_code}). Status: ${order.status}. Delivery Date: ${order.delivery_date}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM CAKE REQUESTS */}
        {activeTab === 'custom' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-xs text-[#a99485]">
              Review bespoke cake requests from clients. Confirm quote in BDT and communicate with patrons.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customOrders.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#1c0e07] border border-[#381c0f] shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-sm font-bold text-[#e5c158]">{req.request_code}</span>
                        <h4 className="text-base font-serif font-bold text-white mt-0.5">{req.customer_name}</h4>
                        <div className="text-xs text-[#a99485] font-mono">{req.customer_phone}</div>
                      </div>

                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateCustomOrder(req.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-[#251209] border border-[#3e2013] text-xs font-semibold text-[#e5c158]"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Price Quoted">Price Quoted</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Baking">Baking</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#221008] p-2.5 rounded-lg border border-[#31180d]">
                      <div>
                        <span className="text-[#8e7666] block">Flavor:</span>
                        <span className="text-white font-medium">{req.cake_flavor}</span>
                      </div>
                      <div>
                        <span className="text-[#8e7666] block">Size / Weight:</span>
                        <span className="text-white font-medium">{req.cake_weight}</span>
                      </div>
                      <div>
                        <span className="text-[#8e7666] block">Required Date:</span>
                        <span className="text-[#e5c158] font-medium">{req.delivery_date}</span>
                      </div>
                      <div>
                        <span className="text-[#8e7666] block">Slot:</span>
                        <span className="text-white font-medium">{req.delivery_time}</span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-[#8e7666] block">Design & Theme Notes:</span>
                      <p className="text-[#f7f2eb] bg-[#160b06] p-2.5 rounded-lg border border-[#2e170c] leading-relaxed">
                        {req.design_notes}
                      </p>
                    </div>

                    {req.cake_message && (
                      <div className="text-xs text-[#c59b27] italic">
                        Cake Text: "{req.cake_message}"
                      </div>
                    )}

                    <div className="text-xs text-[#a99485]">
                      📍 {req.delivery_address}
                    </div>

                    {req.reference_image && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8e7666]">Reference Design:</span>
                        <button
                          onClick={() => setViewingImage(req.reference_image!)}
                          className="px-2.5 py-1 rounded bg-[#2a140a] hover:bg-[#3d1f10] border border-[#432314] text-xs text-[#e5c158] flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Image</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Quotation & WhatsApp Action */}
                  <div className="pt-3 border-t border-[#31180d] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#a99485]">Quote Price:</span>
                      <input
                        type="number"
                        placeholder="৳ BDT"
                        defaultValue={req.estimated_price || ''}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            handleUpdateCustomOrder(req.id, req.status, val);
                          }
                        }}
                        className="w-24 px-2 py-1 rounded bg-[#251209] border border-[#3e2013] text-xs font-mono text-[#e5c158] focus:outline-none"
                      />
                    </div>

                    <a
                      href={`https://wa.me/${req.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${req.customer_name}! YUM HUB Bakery here regarding your custom cake inquiry (${req.request_code}). Our chef reviewed your design. Estimated price is ৳${req.estimated_price || '___'} BDT. Let us know if you'd like to confirm baking for ${req.delivery_date}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat Quote</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Bakery Products ({products.length})</h3>
                <p className="text-xs text-[#a99485]">Manage product catalog, prices, photos, and size variations</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdForm({
                    name_en: '',
                    name_bn: '',
                    description_en: '',
                    description_bn: '',
                    category: 'Chocolate Cakes',
                    base_price: 950,
                    sizes: [
                      { size: '1 Pound (১ পাউন্ড)', weight: '1 lb', price: 950, serves: '3-4 persons' },
                      { size: '2 Pound (২ পাউন্ড)', weight: '2 lb', price: 1800, serves: '7-9 persons' },
                    ],
                    image_url: '/src/assets/images/hero_chocolate_cake_1792698652472.jpg',
                    in_stock: true,
                    is_bestseller: false,
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#c59b27] hover:bg-[#d4af37] text-[#160b06] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Cake</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl overflow-hidden bg-[#1c0e07] border border-[#381c0f] flex flex-col justify-between shadow-lg"
                >
                  <div className="h-44 relative bg-[#180c07]">
                    <img
                      src={p.image_url}
                      alt={p.name_en}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#160b06]/80 text-[#e5c158] text-[10px] px-2 py-0.5 rounded border border-[#361a0e]">
                      {p.category}
                    </div>
                    {p.is_bestseller && (
                      <div className="absolute top-2 right-2 bg-[#c59b27] text-[#160b06] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Bestseller
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-white">{p.name_en}</h4>
                      <p className="text-xs text-[#e5c158] font-serif">{p.name_bn}</p>
                      <p className="text-xs text-[#a99485] line-clamp-2 mt-1">{p.description_en}</p>
                    </div>

                    <div className="pt-3 border-t border-[#31180d] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8e7666] block">Base Price</span>
                        <span className="font-mono text-sm font-bold text-white tabular-nums">
                          ৳{p.base_price}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm({
                              name_en: p.name_en,
                              name_bn: p.name_bn,
                              description_en: p.description_en,
                              description_bn: p.description_bn,
                              category: p.category,
                              base_price: p.base_price,
                              sizes: p.sizes || [],
                              image_url: p.image_url,
                              in_stock: p.in_stock,
                              is_bestseller: p.is_bestseller,
                            });
                            setShowProductModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] text-[#c4b5a8] hover:text-[#e5c158] cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-[#2e170c] hover:bg-red-950 text-[#c4b5a8] hover:text-red-400 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: INVENTORY QUICK CONTROL */}
        {activeTab === 'inventory' && (
          <div className="rounded-2xl bg-[#1c0e07] border border-[#381c0f] p-6 shadow-xl space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Stock & Batch Availability</h3>
              <p className="text-xs text-[#a99485]">Instantly toggle availability if daily ingredients or baking slots run out</p>
            </div>

            <div className="divide-y divide-[#2a1308]">
              {products.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt={p.name_en}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-[#160b06] border border-[#31180d]"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{p.name_en}</div>
                      <div className="text-xs text-[#a99485]">{p.category} · ৳{p.base_price} BDT</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${p.in_stock ? 'text-emerald-400' : 'text-red-400'}`}>
                      {p.in_stock ? 'In Stock (Accepting Orders)' : 'Sold Out / Disabled'}
                    </span>
                    <button
                      onClick={() => handleToggleStock(p.id, p.in_stock)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        p.in_stock
                          ? 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800'
                      }`}
                    >
                      {p.in_stock ? 'Mark Sold Out' : 'Mark In Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-[#1c0e07] border border-[#381c0f] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-serif font-bold text-white">Bakery Configuration</h3>
              <p className="text-xs text-[#a99485]">Update phone numbers, WhatsApp, delivery fees, and admin password</p>
            </div>

            {settingsSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#c4b5a8] mb-1 font-medium">Bakery Hotline Phone</label>
                  <input
                    type="text"
                    value={settingsForm.store_phone || '+8801608627888'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, store_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#c4b5a8] mb-1 font-medium">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp_number || '+8801608627888'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#c4b5a8] mb-1 font-medium">Balaganj Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={settingsForm.delivery_balaganj_fee || '60'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, delivery_balaganj_fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#c4b5a8] mb-1 font-medium">Sylhet Area Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={settingsForm.delivery_sylhet_fee || '120'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, delivery_sylhet_fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#c4b5a8] mb-1 font-medium">Free Delivery Minimum Threshold (৳)</label>
                <input
                  type="number"
                  value={settingsForm.free_delivery_min || '2500'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_min: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#31180d]">
                <label className="block text-[#c4b5a8] mb-1 font-medium text-[#e5c158]">
                  Change Admin Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new admin password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#251209] border border-[#3e2013] text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#c59b27] hover:bg-[#d4af37] text-[#160b06] font-bold text-xs cursor-pointer shadow-md"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#1c0e07] border border-[#3f2113] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              {editingProduct ? 'Edit Product' : 'Add New Bakery Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c4b5a8] mb-1">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name_en}
                    onChange={(e) => setProdForm({ ...prodForm, name_en: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#c4b5a8] mb-1">Name (Bengali)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name_bn}
                    onChange={(e) => setProdForm({ ...prodForm, name_bn: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c4b5a8] mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white"
                  >
                    <option value="Chocolate Cakes">Chocolate Cakes</option>
                    <option value="Birthday Cakes">Birthday Cakes</option>
                    <option value="Best Sellers">Best Sellers</option>
                    <option value="Wedding Cakes">Wedding Cakes</option>
                    <option value="Cupcakes">Cupcakes</option>
                    <option value="Brownies">Brownies</option>
                    <option value="Special Offers">Special Offers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#c4b5a8] mb-1">Base Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.base_price}
                    onChange={(e) => setProdForm({ ...prodForm, base_price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#c4b5a8] mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={prodForm.description_en}
                  onChange={(e) => setProdForm({ ...prodForm, description_en: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white"
                />
              </div>

              <div>
                <label className="block text-[#c4b5a8] mb-1">Description (Bengali)</label>
                <textarea
                  rows={2}
                  value={prodForm.description_bn}
                  onChange={(e) => setProdForm({ ...prodForm, description_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white"
                />
              </div>

              {/* Image URL & Upload */}
              <div className="space-y-2">
                <label className="block text-[#c4b5a8]">Product Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prodForm.image_url}
                    onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1 px-3 py-2 rounded bg-[#251209] border border-[#3e2013] text-white font-mono text-[11px]"
                  />
                  <label className="px-3 py-2 rounded bg-[#2e170c] hover:bg-[#3d1f10] border border-[#4a2614] text-[#e5c158] flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleAdminImageUpload} className="hidden" />
                  </label>
                </div>
                {prodForm.image_url && (
                  <img src={prodForm.image_url} alt="Preview" className="w-20 h-20 rounded object-cover border border-[#381c0f]" />
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.is_bestseller}
                    onChange={(e) => setProdForm({ ...prodForm, is_bestseller: e.target.checked })}
                    className="accent-[#c59b27]"
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.in_stock}
                    onChange={(e) => setProdForm({ ...prodForm, in_stock: e.target.checked })}
                    className="accent-[#c59b27]"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#31180d]">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded bg-[#251209] text-[#c4b5a8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#c59b27] hover:bg-[#d4af37] text-[#160b06] font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reference Image Lightbox */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-[#1c0e07] border border-[#381c0f] p-2">
            <img src={viewingImage} alt="Reference" className="w-full h-auto max-h-[80vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
};
