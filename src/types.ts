export type Language = 'en' | 'bn';

export interface CakeSize {
  size: string;
  weight: string;
  price: number;
  serves?: string;
}

export interface Product {
  id: number;
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  category: string;
  base_price: number;
  sizes_json?: string;
  sizes: CakeSize[];
  image_url: string;
  in_stock: boolean;
  is_bestseller: boolean;
  created_at?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  selectedSize: CakeSize;
  quantity: number;
  cake_message?: string;
}

export interface OrderItemSummary {
  id: number;
  name_en: string;
  name_bn: string;
  selectedSize: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  cake_message?: string;
}

export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_area: string;
  delivery_date: string;
  delivery_time: string;
  notes?: string;
  cake_message?: string;
  items: OrderItemSummary[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
}

export interface CustomOrder {
  id: number;
  request_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  cake_flavor: string;
  cake_weight: string;
  design_notes: string;
  cake_message?: string;
  reference_image?: string;
  delivery_date: string;
  delivery_time: string;
  estimated_price: number;
  status: 'Pending Review' | 'Price Quoted' | 'Confirmed' | 'Baking' | 'Completed' | 'Cancelled';
  admin_notes?: string;
  created_at: string;
}

export interface StoreInfo {
  brand: string;
  tagline_en: string;
  tagline_bn: string;
  phone: string;
  whatsapp: string;
  location_en: string;
  location_bn: string;
  hours_en: string;
  hours_bn: string;
  delivery_balaganj_fee: number;
  delivery_sylhet_fee: number;
  free_delivery_min: number;
  currency: string;
}
