export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  is_active?: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description?: string;
  selling_price: number;
  current_stock: number;
  low_stock_threshold: number;
  image?: string;
  created_at: string;
  archived_at?: string | null;
}

export interface Sale {
  id: number;
  sale_code: string;
  product_id: number;
  product_name: string;
  product_sku: string;
  user_id: number;
  user_name: string;
  quantity: number;
  unit_price_at_sale: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  sold_at: string; // ISO date-time string
  notes?: string;
}

export type MovementType = 'initial' | 'restock' | 'sale' | 'adjustment' | 'return';

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  movement_type: MovementType;
  quantity: number; // positive or negative
  stock_before: number;
  stock_after: number;
  user_id: number;
  user_name: string;
  reference_id?: string;
  notes?: string;
  created_at: string; // ISO date-time string
}

export interface Settings {
  business_name: string;
  currency: string;
  currency_code: string;
  timezone: string;
  business_address: string;
  contact_number: string;
  email: string;
  tax_registration_no?: string;
}

export interface DailyReportRow {
  product_id: number;
  product_name: string;
  product_sku: string;
  category: string;
  opening_stock: number;
  stock_added: number;
  qty_sold: number;
  remaining_stock: number;
  unit_price: number;
  total_revenue: number;
}

export interface DailyReportSummary {
  report_date: string;
  generated_at: string;
  generated_by: string;
  total_revenue: number;
  total_qty_sold: number;
  total_stock_added: number;
  total_opening_stock: number;
  total_closing_stock: number;
  rows: DailyReportRow[];
}
