import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'yumhub_secure_bakery_jwt_secret_key_sylhet_2026';
const ADMIN_DEFAULT_EMAIL = process.env.ADMIN_EMAIL || 'mnonly357@gmail.com';
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'YumHub@2026!';

// Ensure data & upload directories exist
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize SQLite database
const db = new DatabaseSync(path.join(dataDir, 'yumhub.db'));

// Database Schemas
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'superadmin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_bn TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price INTEGER NOT NULL,
    sizes_json TEXT NOT NULL,
    image_url TEXT NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 1,
    is_bestseller INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_area TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    delivery_time TEXT NOT NULL,
    notes TEXT,
    cake_message TEXT,
    items_json TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS custom_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    cake_flavor TEXT NOT NULL,
    cake_weight TEXT NOT NULL,
    design_notes TEXT NOT NULL,
    cake_message TEXT,
    reference_image TEXT,
    delivery_date TEXT NOT NULL,
    delivery_time TEXT NOT NULL,
    estimated_price INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending Review',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed Admin if not exists
const existingAdmin = db.prepare('SELECT id, email FROM admins WHERE email = ?').get(ADMIN_DEFAULT_EMAIL);
if (!existingAdmin) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(ADMIN_DEFAULT_PASSWORD, salt);
  db.prepare('INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    ADMIN_DEFAULT_EMAIL,
    hash,
    'YUM HUB Owner',
    'superadmin'
  );
  console.log(`[Database] Initial admin user initialized for ${ADMIN_DEFAULT_EMAIL}`);
}

// Seed Store Settings
const storeSettingsDefaults = [
  ['store_name', 'YUM HUB — Premium Chocolate Bakery'],
  ['store_phone', '+8801608627888'],
  ['whatsapp_number', '+8801608627888'],
  ['location_en', 'Balaganj Bazar Road, Balaganj, Sylhet, Bangladesh'],
  ['location_bn', 'বালাগঞ্জ বাজার রোড, বালাগঞ্জ, সিলেট, বাংলাদেশ'],
  ['opening_hours_en', 'Open Daily: 9:00 AM – 10:00 PM'],
  ['opening_hours_bn', 'প্রতিদিন সকাল ৯:০০ – রাত ১০:০০'],
  ['delivery_balaganj_fee', '60'],
  ['delivery_sylhet_fee', '120'],
  ['free_delivery_min', '2500'],
  ['currency', 'BDT (৳)'],
];

for (const [key, val] of storeSettingsDefaults) {
  const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
  if (!existing) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, val);
  }
}

// Seed Initial Products
const productCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
if (productCount === 0) {
  const seedProducts = [
    {
      name_en: 'Belgian Dark Truffle Cake',
      name_bn: 'বেলজিয়ান ডার্ক ট্রাফল কেক',
      description_en: 'Layers of moist Belgian dark chocolate sponge drenched in 70% dark chocolate ganache, finished with artisan hand-rolled cocoa truffles and gold dust.',
      description_bn: '৭০% খাঁটি ডার্ক চকোলেট গানাশ এবং হস্তনির্মিত কোকো ট্রাফল দিয়ে তৈরি বিলাসবহুল বেলজিয়ান চকোলেট কেক।',
      category: 'Chocolate Cakes',
      base_price: 950,
      sizes_json: JSON.stringify([
        { size: '1 Pound (1 পাউন্ড)', weight: '1 lb', price: 950, serves: '3-4 persons' },
        { size: '1.5 Pound (১.৫ পাউন্ড)', weight: '1.5 lb', price: 1400, serves: '5-6 persons' },
        { size: '2 Pound (২ পাউন্ড)', weight: '2 lb', price: 1850, serves: '7-9 persons' },
        { size: '3 Pound (৩ পাউন্ড)', weight: '3 lb', price: 2700, serves: '12-15 persons' },
      ]),
      image_url: '/src/assets/images/belgian_truffle_cake_1792698653524.jpg',
      in_stock: 1,
      is_bestseller: 1,
    },
    {
      name_en: 'Signature Celebration Birthday Cake',
      name_bn: 'সিগনেচার সেলিব্রেশন বার্থডে কেক',
      description_en: 'Our award-winning chocolate cake decorated with velvety chocolate rosettes, dark chocolate crisps, chocolate pearls, and custom edible message plaque.',
      description_bn: 'সমৃদ্ধ চকোলেট বাটারক্রিম এবং চকোলেট পার্লস সহযোগে প্রতিটি জন্মদিন ও উৎসবের সেরা পছন্দ।',
      category: 'Birthday Cakes',
      base_price: 1100,
      sizes_json: JSON.stringify([
        { size: '1.5 Pound (১.৫ পাউন্ড)', weight: '1.5 lb', price: 1100, serves: '5-6 persons' },
        { size: '2 Pound (২ পাউন্ড)', weight: '2 lb', price: 1450, serves: '7-9 persons' },
        { size: '3 Pound (৩ পাউন্ড)', weight: '3 lb', price: 2150, serves: '12-15 persons' },
        { size: '4 Pound (৪ পাউন্ড)', weight: '4 lb', price: 2850, serves: '16-20 persons' },
      ]),
      image_url: '/src/assets/images/chocolate_birthday_cake_1792698654021.jpg',
      in_stock: 1,
      is_bestseller: 1,
    },
    {
      name_en: 'Royal Grand Chocolate Drip Cake',
      name_bn: 'রয়্যাল গ্র্যান্ড চকোলেট ড্রিপ কেক',
      description_en: 'Showstopping chocolate drip cake topped with fresh blackberries, raspberries, rich fudge frosting, and genuine 24K edible gold leaf flakes.',
      description_bn: 'চকচকে চকোলেট ড্রিপ, তাজা বেরি এবং ভক্ষণযোগ্য স্বর্ণের গুঁড়া সম্বলিত রাজকীয় চকোলেট ফাজ কেক।',
      category: 'Best Sellers',
      base_price: 1350,
      sizes_json: JSON.stringify([
        { size: '1.5 Pound (১.৫ পাউন্ড)', weight: '1.5 lb', price: 1350, serves: '5-6 persons' },
        { size: '2 Pound (২ পাউন্ড)', weight: '2 lb', price: 1750, serves: '7-9 persons' },
        { size: '3 Pound (৩ পাউন্ড)', weight: '3 lb', price: 2550, serves: '12-15 persons' },
      ]),
      image_url: '/src/assets/images/hero_chocolate_cake_1792698652472.jpg',
      in_stock: 1,
      is_bestseller: 1,
    },
    {
      name_en: 'Dark Chocolate Fudge Cupcakes (Box of 6)',
      name_bn: 'ডার্ক চকোলেট ফাজ কাপকেক (৬ পিসের বক্স)',
      description_en: 'Six ultra-moist dark chocolate cupcakes crowned with towering swirls of silky chocolate frosting and delicate chocolate drizzle.',
      description_bn: 'নরম ডার্ক চকোলেট কাপকেক এবং সিল্কি বাটারক্রিম টপিং এর ৬ পিসের আনন্দদায়ক উপহার বক্স।',
      category: 'Cupcakes',
      base_price: 650,
      sizes_json: JSON.stringify([
        { size: 'Box of 6 (৬ পিস)', weight: 'Box of 6', price: 650, serves: '6 cupcakes' },
        { size: 'Box of 12 (১২ পিস)', weight: 'Box of 12', price: 1250, serves: '12 cupcakes' },
      ]),
      image_url: '/src/assets/images/chocolate_cupcakes_1792698654410.jpg',
      in_stock: 1,
      is_bestseller: 0,
    },
    {
      name_en: 'Gourmet Sea Salt Fudge Brownies (Box of 6)',
      name_bn: 'গুরমে সী-সল্ট ফাজ ব্রাউনি (৬ পিসের বক্স)',
      description_en: 'Gooey, ultra-fudgy dark chocolate brownies with crackly shiny tops, melted chocolate pockets, and coarse flaky sea salt.',
      description_bn: 'ভেতরে গলে যাওয়া চকোলেট এবং ক্রাঞ্চি উপরের স্তর সম্বলিত প্রিমিয়াম সী-সল্ট ফাজ ব্রাউনি।',
      category: 'Brownies',
      base_price: 580,
      sizes_json: JSON.stringify([
        { size: 'Box of 6 (৬ পিস)', weight: 'Box of 6', price: 580, serves: '6 brownies' },
        { size: 'Box of 9 (৯ পিস)', weight: 'Box of 9', price: 850, serves: '9 brownies' },
        { size: 'Box of 12 (১২ পিস)', weight: 'Box of 12', price: 1100, serves: '12 brownies' },
      ]),
      image_url: '/src/assets/images/fudge_brownies_box_1792698654629.jpg',
      in_stock: 1,
      is_bestseller: 1,
    },
    {
      name_en: 'Royal Golden Chocolate Wedding Tier Cake',
      name_bn: 'রয়্যাল গোল্ডেন চকোলেট ওয়েডিং টিয়ার কেক',
      description_en: 'Spectacular multi-tiered chocolate celebration masterpiece crafted with premium Swiss chocolate, golden textures, and cascading handcrafted sugar blooms.',
      description_bn: 'বিয়ে ও সংবর্ধনা অনুষ্ঠানের জন্য বিশেষ বিলাসবহুল বহুস্তর বিশিষ্ট সুইজারল্যান্ড চকোলেট কেক।',
      category: 'Wedding Cakes',
      base_price: 3800,
      sizes_json: JSON.stringify([
        { size: '4 Pound (২ স্তর)', weight: '4 lb (2-tier)', price: 3800, serves: '20 persons' },
        { size: '6 Pound (২ স্তর)', weight: '6 lb (2-tier)', price: 5600, serves: '30 persons' },
        { size: '8 Pound (৩ স্তর)', weight: '8 lb (3-tier)', price: 7400, serves: '45 persons' },
      ]),
      image_url: '/src/assets/images/hero_chocolate_cake_1792698652472.jpg',
      in_stock: 1,
      is_bestseller: 0,
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO products (name_en, name_bn, description_en, description_bn, category, base_price, sizes_json, image_url, in_stock, is_bestseller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of seedProducts) {
    insertStmt.run(
      p.name_en,
      p.name_bn,
      p.description_en,
      p.description_bn,
      p.category,
      p.base_price,
      p.sizes_json,
      p.image_url,
      p.in_stock,
      p.is_bestseller
    );
  }
  console.log(`[Database] Seeded ${seedProducts.length} initial bakery products`);
}

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads, images, and dist assets
app.use('/uploads', express.static(uploadsDir));
app.use('/src/assets/images', express.static(path.resolve(__dirname, 'src', 'assets', 'images')));
app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets')));
app.use(express.static(path.resolve(__dirname, 'dist')));

// Authentication Helper
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    const admin = db.prepare('SELECT id, email, name, role FROM admins WHERE id = ?').get(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Admin user not found.' });
    }
    (req as any).admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

// =================== PUBLIC API ROUTES ===================

// Public Store Information
app.get('/api/store-info', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  res.json({
    brand: 'YUM HUB',
    tagline_en: 'Every Celebration Deserves a Beautiful Cake.',
    tagline_bn: 'প্রতিটি আনন্দের মুহূর্তে থাকুক মিষ্টি ছোঁয়া।',
    phone: settings.store_phone || '+8801608627888',
    whatsapp: settings.whatsapp_number || '+8801608627888',
    location_en: settings.location_en || 'Balaganj, Sylhet, Bangladesh',
    location_bn: settings.location_bn || 'বালাগঞ্জ, সিলেট, বাংলাদেশ',
    hours_en: settings.opening_hours_en || 'Open Daily: 9:00 AM – 10:00 PM',
    hours_bn: settings.opening_hours_bn || 'প্রতিদিন সকাল ৯:০০ – রাত ১০:০০',
    delivery_balaganj_fee: parseInt(settings.delivery_balaganj_fee || '60', 10),
    delivery_sylhet_fee: parseInt(settings.delivery_sylhet_fee || '120', 10),
    free_delivery_min: parseInt(settings.free_delivery_min || '2500', 10),
    currency: '৳',
  });
});

// Products List
app.get('/api/products', (req, res) => {
  const { category, q, sort } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'All' && category !== 'সবগুলো') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (q && typeof q === 'string' && q.trim().length > 0) {
    query += ' AND (name_en LIKE ? OR name_bn LIKE ? OR description_en LIKE ? OR description_bn LIKE ?)';
    const term = `%${q.trim()}%`;
    params.push(term, term, term, term);
  }

  if (sort === 'price_asc') {
    query += ' ORDER BY base_price ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY base_price DESC';
  } else {
    query += ' ORDER BY is_bestseller DESC, id ASC';
  }

  const rows = db.prepare(query).all(...params) as any[];
  const products = rows.map((r) => ({
    ...r,
    sizes: JSON.parse(r.sizes_json || '[]'),
    in_stock: Boolean(r.in_stock),
    is_bestseller: Boolean(r.is_bestseller),
  }));

  res.json({ products });
});

// Single Product Detail
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({
    product: {
      ...row,
      sizes: JSON.parse(row.sizes_json || '[]'),
      in_stock: Boolean(row.in_stock),
      is_bestseller: Boolean(row.is_bestseller),
    },
  });
});

// Place Customer Order
app.post('/api/orders', (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      delivery_address,
      delivery_area,
      delivery_date,
      delivery_time,
      notes,
      cake_message,
      items,
      payment_method = 'Cash on Delivery',
    } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!customer_phone || !customer_phone.trim() || customer_phone.trim().length < 9) {
      return res.status(400).json({ error: 'A valid Bangladeshi phone number is required (e.g. 017xxxxxxxx)' });
    }
    if (!delivery_address || !delivery_address.trim()) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }
    if (!delivery_date) {
      return res.status(400).json({ error: 'Delivery date is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one item' });
    }

    // Verify items and calculate subtotal securely against database
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = db.prepare('SELECT id, name_en, name_bn, base_price, sizes_json, in_stock FROM products WHERE id = ?').get(item.id) as any;
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.id} does not exist.` });
      }
      if (!product.in_stock) {
        return res.status(400).json({ error: `"${product.name_en}" is currently sold out.` });
      }

      const sizes = JSON.parse(product.sizes_json || '[]');
      let itemUnitPrice = product.base_price;
      let selectedSizeLabel = 'Default';

      if (item.selectedSize) {
        const foundSize = sizes.find((s: any) => s.size === item.selectedSize || s.weight === item.selectedSize);
        if (foundSize) {
          itemUnitPrice = foundSize.price;
          selectedSizeLabel = foundSize.size;
        }
      }

      const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
      const lineTotal = itemUnitPrice * quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        id: product.id,
        name_en: product.name_en,
        name_bn: product.name_bn,
        selectedSize: selectedSizeLabel,
        unitPrice: itemUnitPrice,
        quantity,
        lineTotal,
        cake_message: item.cake_message || '',
      });
    }

    // Calculate delivery fee
    const isBalaganj = !delivery_area || delivery_area.toLowerCase().includes('balaganj');
    const freeMin = 2500;
    let delivery_fee = subtotal >= freeMin ? 0 : (isBalaganj ? 60 : 120);

    const total = subtotal + delivery_fee;
    const order_code = `YH-${Math.floor(10000 + Math.random() * 90000)}`;

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_code, customer_name, customer_phone, delivery_address, delivery_area,
        delivery_date, delivery_time, notes, cake_message, items_json,
        subtotal, delivery_fee, total, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      order_code,
      customer_name.trim(),
      customer_phone.trim(),
      delivery_address.trim(),
      delivery_area || 'Balaganj',
      delivery_date,
      delivery_time || 'Anytime during bakery hours',
      notes || '',
      cake_message || '',
      JSON.stringify(verifiedItems),
      subtotal,
      delivery_fee,
      total,
      payment_method,
      'Pending'
    );

    // Return safe confirmation (no public phone/address leak)
    res.json({
      success: true,
      order: {
        order_code,
        customer_name: customer_name.trim(),
        total,
        subtotal,
        delivery_fee,
        delivery_date,
        delivery_time: delivery_time || 'Regular slot',
        item_count: verifiedItems.length,
        status: 'Pending',
        payment_method,
      },
    });
  } catch (err: any) {
    console.error('[Orders API Error]', err);
    res.status(500).json({ error: 'Failed to process order. Please try again or WhatsApp us at +8801608627888.' });
  }
});

// Order Lookup by Customer
app.get('/api/orders/lookup', (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: 'Order code is required.' });
  }

  const order = db.prepare(`
    SELECT order_code, customer_name, delivery_date, delivery_time,
           subtotal, delivery_fee, total, status, created_at, items_json
    FROM orders WHERE order_code = ?
  `).get(code.trim().toUpperCase()) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please check your Order ID (e.g. YH-12345).' });
  }

  const items = JSON.parse(order.items_json || '[]').map((i: any) => ({
    name_en: i.name_en,
    name_bn: i.name_bn,
    selectedSize: i.selectedSize,
    quantity: i.quantity,
  }));

  res.json({
    order: {
      order_code: order.order_code,
      customer_name: order.customer_name,
      delivery_date: order.delivery_date,
      delivery_time: order.delivery_time,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      items,
    },
  });
});

// Place Custom Cake Order Request
app.post('/api/custom-orders', (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      delivery_address,
      cake_flavor,
      cake_weight,
      design_notes,
      cake_message,
      reference_image,
      delivery_date,
      delivery_time,
    } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }
    if (!customer_phone || !customer_phone.trim() || customer_phone.trim().length < 9) {
      return res.status(400).json({ error: 'Valid phone number is required.' });
    }
    if (!delivery_address || !delivery_address.trim()) {
      return res.status(400).json({ error: 'Delivery address is required.' });
    }
    if (!cake_flavor) {
      return res.status(400).json({ error: 'Please specify cake flavor.' });
    }
    if (!cake_weight) {
      return res.status(400).json({ error: 'Please choose expected cake weight/size.' });
    }
    if (!design_notes || !design_notes.trim()) {
      return res.status(400).json({ error: 'Please provide design notes or celebration theme.' });
    }
    if (!delivery_date) {
      return res.status(400).json({ error: 'Required delivery date is required.' });
    }

    const request_code = `CC-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertCustom = db.prepare(`
      INSERT INTO custom_orders (
        request_code, customer_name, customer_phone, delivery_address,
        cake_flavor, cake_weight, design_notes, cake_message,
        reference_image, delivery_date, delivery_time, estimated_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCustom.run(
      request_code,
      customer_name.trim(),
      customer_phone.trim(),
      delivery_address.trim(),
      cake_flavor,
      cake_weight,
      design_notes.trim(),
      cake_message ? cake_message.trim() : '',
      reference_image || '',
      delivery_date,
      delivery_time || 'Afternoon (3 PM - 6 PM)',
      0,
      'Pending Review'
    );

    res.json({
      success: true,
      requestCode: request_code,
      message_en: 'Your custom cake request has been submitted! Our master chef will review your design and confirm price & slot shortly.',
      message_bn: 'আপনার কাস্টম কেক রিকোয়েস্ট জমা হয়েছে! আমাদের মাস্টার শেফ ডিজাইনটি দেখে শীঘ্রই কনফার্ম করবেন।',
      status: 'Awaiting Price Confirmation',
    });
  } catch (err: any) {
    console.error('[Custom Order Error]', err);
    res.status(500).json({ error: 'Failed to submit custom cake request.' });
  }
});

// Custom Order Lookup
app.get('/api/custom-orders/lookup', (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: 'Request code is required.' });
  }

  const row = db.prepare(`
    SELECT request_code, customer_name, cake_flavor, cake_weight,
           delivery_date, delivery_time, estimated_price, status, created_at, admin_notes
    FROM custom_orders WHERE request_code = ?
  `).get(code.trim().toUpperCase()) as any;

  if (!row) {
    return res.status(404).json({ error: 'Custom cake request not found.' });
  }

  res.json({ customOrder: row });
});

// =================== ADMIN AUTHENTICATION ===================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.trim().toLowerCase()) as any;
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const validPassword = bcrypt.compareSync(password, admin.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

// Admin Verify Endpoint (Mandatory per requirement 6)
app.post('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.body.token;

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = db.prepare('SELECT id, email, name, role FROM admins WHERE id = ?').get(decoded.id) as any;
    if (!admin) {
      return res.status(401).json({ valid: false, error: 'Admin account not found' });
    }
    res.json({
      valid: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// =================== PROTECTED ADMIN ENDPOINTS ===================

// Admin Dashboard Overview Statistics
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  try {
    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != "Cancelled"').get() as any;
    const pendingOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "Pending"').get() as any;
    const pendingCustomRow = db.prepare('SELECT COUNT(*) as count FROM custom_orders WHERE status = "Pending Review"').get() as any;
    const totalProductsRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
    const outOfStockRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE in_stock = 0').get() as any;

    const recentOrders = db.prepare(`
      SELECT id, order_code, customer_name, total, status, created_at, delivery_date
      FROM orders ORDER BY id DESC LIMIT 5
    `).all();

    res.json({
      stats: {
        total_orders: totalOrdersRow.count,
        total_revenue: totalOrdersRow.revenue,
        pending_orders: pendingOrdersRow.count,
        pending_custom_cakes: pendingCustomRow.count,
        total_products: totalProductsRow.count,
        out_of_stock_products: outOfStockRow.count,
      },
      recent_orders: recentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Admin View Customer Orders
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as any[];
    const parsedOrders = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
    }));
    res.json({ orders: parsedOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin Update Order Status
app.put('/api/admin/orders/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin View Custom Cake Requests
app.get('/api/admin/custom-orders', authenticateAdmin, (req, res) => {
  try {
    const customOrders = db.prepare('SELECT * FROM custom_orders ORDER BY id DESC').all();
    res.json({ customOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch custom orders' });
  }
});

// Admin Update Custom Cake (Price quote, status, notes)
app.put('/api/admin/custom-orders/:id', authenticateAdmin, (req, res) => {
  try {
    const { status, estimated_price, admin_notes } = req.body;
    const existing = db.prepare('SELECT id FROM custom_orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Custom cake request not found' });
    }

    db.prepare(`
      UPDATE custom_orders
      SET status = COALESCE(?, status),
          estimated_price = COALESCE(?, estimated_price),
          admin_notes = COALESCE(?, admin_notes)
      WHERE id = ?
    `).run(
      status ?? null,
      estimated_price !== undefined ? parseInt(estimated_price, 10) : null,
      admin_notes ?? null,
      req.params.id
    );

    res.json({ success: true, message: 'Custom cake request updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update custom order' });
  }
});

// Admin Add Product
app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  try {
    const {
      name_en,
      name_bn,
      description_en,
      description_bn,
      category,
      base_price,
      sizes,
      image_url,
      in_stock = 1,
      is_bestseller = 0,
    } = req.body;

    if (!name_en || !name_bn || !category || !base_price) {
      return res.status(400).json({ error: 'English name, Bengali name, category, and base price are required' });
    }

    const sizesJson = JSON.stringify(Array.isArray(sizes) && sizes.length > 0 ? sizes : [
      { size: '1 Pound (১ পাউন্ড)', weight: '1 lb', price: parseInt(base_price, 10), serves: '3-4 persons' },
      { size: '2 Pound (২ পাউন্ড)', weight: '2 lb', price: Math.round(parseInt(base_price, 10) * 1.8), serves: '7-9 persons' },
    ]);

    const result = db.prepare(`
      INSERT INTO products (name_en, name_bn, description_en, description_bn, category, base_price, sizes_json, image_url, in_stock, is_bestseller)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name_en.trim(),
      name_bn.trim(),
      description_en ? description_en.trim() : '',
      description_bn ? description_bn.trim() : '',
      category.trim(),
      parseInt(base_price, 10),
      sizesJson,
      image_url || '/src/assets/images/hero_chocolate_cake_1792698652472.jpg',
      in_stock ? 1 : 0,
      is_bestseller ? 1 : 0
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin Update Product
app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  try {
    const {
      name_en,
      name_bn,
      description_en,
      description_bn,
      category,
      base_price,
      sizes,
      image_url,
      in_stock,
      is_bestseller,
    } = req.body;

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let sizesJson: string | null = null;
    if (sizes) {
      sizesJson = typeof sizes === 'string' ? sizes : JSON.stringify(sizes);
    }

    db.prepare(`
      UPDATE products
      SET name_en = COALESCE(?, name_en),
          name_bn = COALESCE(?, name_bn),
          description_en = COALESCE(?, description_en),
          description_bn = COALESCE(?, description_bn),
          category = COALESCE(?, category),
          base_price = COALESCE(?, base_price),
          sizes_json = COALESCE(?, sizes_json),
          image_url = COALESCE(?, image_url),
          in_stock = COALESCE(?, in_stock),
          is_bestseller = COALESCE(?, is_bestseller)
      WHERE id = ?
    `).run(
      name_en ?? null,
      name_bn ?? null,
      description_en ?? null,
      description_bn ?? null,
      category ?? null,
      base_price !== undefined ? parseInt(base_price, 10) : null,
      sizesJson,
      image_url ?? null,
      in_stock !== undefined ? (in_stock ? 1 : 0) : null,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : null,
      req.params.id
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin Delete Product
app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Admin Quick Inventory Stock Toggle
app.put('/api/admin/inventory/:id', authenticateAdmin, (req, res) => {
  try {
    const { in_stock } = req.body;
    db.prepare('UPDATE products SET in_stock = ? WHERE id = ?').run(in_stock ? 1 : 0, req.params.id);
    res.json({ success: true, in_stock: Boolean(in_stock) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// Admin Image Upload
app.post('/api/upload', authenticateAdmin, (req, res) => {
  try {
    const { dataUrl, filename = 'cake_image.jpg' } = req.body;
    if (!dataUrl || !dataUrl.includes('base64,')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 payload' });
    }

    const ext = matches[1].includes('png') ? 'png' : 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `cake_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const targetPath = path.join(uploadsDir, safeName);

    fs.writeFileSync(targetPath, buffer);
    res.json({
      success: true,
      url: `/uploads/${safeName}`,
    });
  } catch (err) {
    console.error('[Upload error]', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// Admin Settings
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  res.json({ settings });
});

app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  try {
    const { settings, new_password } = req.body;

    if (settings && typeof settings === 'object') {
      const upsert = db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      for (const [k, v] of Object.entries(settings)) {
        upsert.run(k, String(v));
      }
    }

    if (new_password && typeof new_password === 'string' && new_password.trim().length >= 6) {
      const adminId = (req as any).admin.id;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(new_password.trim(), salt);
      db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, adminId);
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// =================== SERVE FRONTEND (DEV & PROD) ===================

async function startServer() {
  const distHtml = path.resolve(__dirname, 'dist', 'index.html');
  const hasDist = fs.existsSync(distHtml);

  if (hasDist) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(distHtml);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YUM HUB Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[YUM HUB Server] Fatal error starting server:', err);
});
