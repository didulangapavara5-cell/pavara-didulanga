import { User, Product, Sale, StockMovement, Settings, DailyReportSummary, DailyReportRow } from '../types';

const STORAGE_KEYS = {
  USERS: 'sis_users',
  PRODUCTS: 'sis_products',
  SALES: 'sis_sales',
  MOVEMENTS: 'sis_movements',
  SETTINGS: 'sis_settings',
  AUTH_USER: 'sis_auth_user',
};

// Default Settings
export const DEFAULT_SETTINGS: Settings = {
  business_name: 'Apex Retail & Mart',
  currency: 'Rs.',
  currency_code: 'LKR',
  timezone: 'Asia/Colombo',
  business_address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  contact_number: '+94 11 234 5678',
  email: 'info@apexretail.lk',
  tax_registration_no: 'VAT-LK-982341-B',
};

// Default Users (admin & staff)
export const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: 'Ruwan Perera',
    email: 'admin@retail.com',
    role: 'admin',
    created_at: '2026-01-01T08:00:00Z',
    is_active: true,
  },
  {
    id: 2,
    name: 'Kasun Jayasuriya',
    email: 'staff@retail.com',
    role: 'staff',
    created_at: '2026-01-10T09:00:00Z',
    is_active: true,
  },
];

// Helper to get today's date in YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Initial Products
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'TSH-001',
    name: 'T-Shirt (Crew Neck Cotton)',
    category: 'Men Apparel',
    description: '100% combed cotton soft premium regular fit t-shirt',
    selling_price: 1500,
    current_stock: 88, // 100 initial - 12 sold = 88
    low_stock_threshold: 15,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T08:00:00Z',
    archived_at: null,
  },
  {
    id: 2,
    sku: 'JNS-002',
    name: 'Slim Fit Denim Jeans',
    category: 'Men Apparel',
    description: 'Stretchable heavy denim fabric with reinforced stitching',
    selling_price: 3000,
    current_stock: 45, // 50 initial - 5 sold = 45
    low_stock_threshold: 10,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-02T08:00:00Z',
    archived_at: null,
  },
  {
    id: 3,
    sku: 'DRS-003',
    name: 'Floral Casual Summer Dress',
    category: 'Women Apparel',
    description: 'Lightweight breathable rayon floral printed midi dress',
    selling_price: 4500,
    current_stock: 27, // 30 initial - 3 sold = 27
    low_stock_threshold: 8,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-03T08:00:00Z',
    archived_at: null,
  },
  {
    id: 4,
    sku: 'SHT-004',
    name: 'Cotton Casual Button Shirt',
    category: 'Men Apparel',
    description: 'Long-sleeve formal and casual crisp oxford cotton shirt',
    selling_price: 2800,
    current_stock: 42,
    low_stock_threshold: 10,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-04T08:00:00Z',
    archived_at: null,
  },
  {
    id: 5,
    sku: 'BLT-005',
    name: 'Genuine Leather Dress Belt',
    category: 'Accessories',
    description: 'Full-grain brown leather belt with brass buckle',
    selling_price: 1200,
    current_stock: 6, // Low stock! Threshold 10
    low_stock_threshold: 10,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-05T08:00:00Z',
    archived_at: null,
  },
  {
    id: 6,
    sku: 'SNK-006',
    name: 'Classic Urban Canvas Sneakers',
    category: 'Footwear',
    description: 'All-day comfort low-top vulcanized rubber sneakers',
    selling_price: 6500,
    current_stock: 0, // Out of stock!
    low_stock_threshold: 5,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-06T08:00:00Z',
    archived_at: null,
  },
  {
    id: 7,
    sku: 'PLO-007',
    name: 'Pique Polo T-Shirt',
    category: 'Men Apparel',
    description: 'Sporty knit polo with rib collar and pearl buttons',
    selling_price: 2200,
    current_stock: 35,
    low_stock_threshold: 8,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-07T08:00:00Z',
    archived_at: null,
  },
  {
    id: 8,
    sku: 'JKT-008',
    name: 'Vintage Denim Trucker Jacket',
    category: 'Outerwear',
    description: 'Classic western cut vintage wash denim jacket',
    selling_price: 5800,
    current_stock: 15,
    low_stock_threshold: 5,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&auto=format&fit=crop&q=80',
    created_at: '2026-01-08T08:00:00Z',
    archived_at: null,
  },
];

// Helper to seed initial stock movements and sales matching prompt exact scenario:
// T-Shirt: 100 opening, 12 sold -> 88 remaining
// Jeans: 50 opening, 5 sold -> 45 remaining
// Dress: 30 opening, 3 sold -> 27 remaining
// Total revenue: 18,000 + 15,000 + 13,500 = 46,500
function generateSeedData() {
  const today = getTodayDateString();
  const timeNow = new Date().toISOString();

  const seedSales: Sale[] = [
    {
      id: 101,
      sale_code: 'SL-26001',
      product_id: 1,
      product_name: 'T-Shirt (Crew Neck Cotton)',
      product_sku: 'TSH-001',
      user_id: 2,
      user_name: 'Kasun Jayasuriya',
      quantity: 12,
      unit_price_at_sale: 1500,
      total_amount: 18000,
      payment_method: 'cash',
      sold_at: `${today}T10:15:00Z`,
      notes: 'Customer order #1001 - Counter 1',
    },
    {
      id: 102,
      sale_code: 'SL-26002',
      product_id: 2,
      product_name: 'Slim Fit Denim Jeans',
      product_sku: 'JNS-002',
      user_id: 2,
      user_name: 'Kasun Jayasuriya',
      quantity: 5,
      unit_price_at_sale: 3000,
      total_amount: 15000,
      payment_method: 'card',
      sold_at: `${today}T11:45:00Z`,
      notes: 'Customer order #1002 - Counter 1',
    },
    {
      id: 103,
      sale_code: 'SL-26003',
      product_id: 3,
      product_name: 'Floral Casual Summer Dress',
      product_sku: 'DRS-003',
      user_id: 1,
      user_name: 'Ruwan Perera',
      quantity: 3,
      unit_price_at_sale: 4500,
      total_amount: 13500,
      payment_method: 'cash',
      sold_at: `${today}T14:20:00Z`,
      notes: 'Walk-in customer sale',
    },
  ];

  const seedMovements: StockMovement[] = [
    // Initial stock setup movements
    {
      id: 1,
      product_id: 1,
      product_name: 'T-Shirt (Crew Neck Cotton)',
      product_sku: 'TSH-001',
      movement_type: 'initial',
      quantity: 100,
      stock_before: 0,
      stock_after: 100,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-001',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-01T08:00:00Z',
    },
    {
      id: 2,
      product_id: 2,
      product_name: 'Slim Fit Denim Jeans',
      product_sku: 'JNS-002',
      movement_type: 'initial',
      quantity: 50,
      stock_before: 0,
      stock_after: 50,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-002',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-02T08:00:00Z',
    },
    {
      id: 3,
      product_id: 3,
      product_name: 'Floral Casual Summer Dress',
      product_sku: 'DRS-003',
      movement_type: 'initial',
      quantity: 30,
      stock_before: 0,
      stock_after: 30,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-003',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-03T08:00:00Z',
    },
    {
      id: 4,
      product_id: 4,
      product_name: 'Cotton Casual Button Shirt',
      product_sku: 'SHT-004',
      movement_type: 'initial',
      quantity: 42,
      stock_before: 0,
      stock_after: 42,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-004',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-04T08:00:00Z',
    },
    {
      id: 5,
      product_id: 5,
      product_name: 'Genuine Leather Dress Belt',
      product_sku: 'BLT-005',
      movement_type: 'initial',
      quantity: 6,
      stock_before: 0,
      stock_after: 6,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-005',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-05T08:00:00Z',
    },
    {
      id: 6,
      product_id: 7,
      product_name: 'Pique Polo T-Shirt',
      product_sku: 'PLO-007',
      movement_type: 'initial',
      quantity: 35,
      stock_before: 0,
      stock_after: 35,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-007',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-07T08:00:00Z',
    },
    {
      id: 7,
      product_id: 8,
      product_name: 'Vintage Denim Trucker Jacket',
      product_sku: 'JKT-008',
      movement_type: 'initial',
      quantity: 15,
      stock_before: 0,
      stock_after: 15,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'INIT-008',
      notes: 'Initial inventory stock load',
      created_at: '2026-01-08T08:00:00Z',
    },
    // Today's sales movements
    {
      id: 8,
      product_id: 1,
      product_name: 'T-Shirt (Crew Neck Cotton)',
      product_sku: 'TSH-001',
      movement_type: 'sale',
      quantity: -12,
      stock_before: 100,
      stock_after: 88,
      user_id: 2,
      user_name: 'Kasun Jayasuriya',
      reference_id: 'SL-26001',
      notes: 'Sale of 12 units',
      created_at: `${today}T10:15:00Z`,
    },
    {
      id: 9,
      product_id: 2,
      product_name: 'Slim Fit Denim Jeans',
      product_sku: 'JNS-002',
      movement_type: 'sale',
      quantity: -5,
      stock_before: 50,
      stock_after: 45,
      user_id: 2,
      user_name: 'Kasun Jayasuriya',
      reference_id: 'SL-26002',
      notes: 'Sale of 5 units',
      created_at: `${today}T11:45:00Z`,
    },
    {
      id: 10,
      product_id: 3,
      product_name: 'Floral Casual Summer Dress',
      product_sku: 'DRS-003',
      movement_type: 'sale',
      quantity: -3,
      stock_before: 30,
      stock_after: 27,
      user_id: 1,
      user_name: 'Ruwan Perera',
      reference_id: 'SL-26003',
      notes: 'Sale of 3 units',
      created_at: `${today}T14:20:00Z`,
    },
  ];

  return { seedSales, seedMovements };
}

class StorageService {
  private users: User[] = [];
  private products: Product[] = [];
  private sales: Sale[] = [];
  private movements: StockMovement[] = [];
  private settings: Settings = DEFAULT_SETTINGS;
  private currentUser: User | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedSales = localStorage.getItem(STORAGE_KEYS.SALES);
      const storedMovements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_USER);

      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...DEFAULT_USERS];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      }

      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      }

      if (storedProducts && storedSales && storedMovements) {
        this.products = JSON.parse(storedProducts);
        this.sales = JSON.parse(storedSales);
        this.movements = JSON.parse(storedMovements);
      } else {
        this.products = [...DEFAULT_PRODUCTS];
        const { seedSales, seedMovements } = generateSeedData();
        this.sales = seedSales;
        this.movements = seedMovements;
        this.saveAll();
      }

      if (storedAuth) {
        this.currentUser = JSON.parse(storedAuth);
      } else {
        // Default to logged-in admin for instant live demo experience
        this.currentUser = this.users[0] || DEFAULT_USERS[0];
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
      }
    } catch (e) {
      console.error('Failed to initialize storage', e);
      this.resetDefaults();
    }
  }

  public resetDefaults() {
    this.users = [...DEFAULT_USERS];
    this.products = [...DEFAULT_PRODUCTS];
    this.settings = { ...DEFAULT_SETTINGS };
    const { seedSales, seedMovements } = generateSeedData();
    this.sales = seedSales;
    this.movements = seedMovements;
    this.currentUser = this.users[0];
    this.saveAll();
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
  }

  private saveAll() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.sales));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(this.movements));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  // Auth
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public login(email: string, role?: 'admin' | 'staff'): User | null {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.is_active !== false) {
      this.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      return user;
    }
    // If not found by email, allow direct login with role
    if (role) {
      const roleUser = this.users.find(u => u.role === role);
      if (roleUser) {
        this.currentUser = roleUser;
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(roleUser));
        return roleUser;
      }
    }
    return null;
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  public switchUser(userId: number): User | null {
    const u = this.users.find(user => user.id === userId);
    if (u) {
      this.currentUser = u;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(u));
      return u;
    }
    return null;
  }

  // Users Management
  public getUsers(): User[] {
    return [...this.users];
  }

  public addUser(name: string, email: string, role: 'admin' | 'staff'): User {
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    this.users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    return newUser;
  }

  public toggleUserActive(userId: number): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.is_active = user.is_active === false ? true : false;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      return true;
    }
    return false;
  }

  // Settings
  public getSettings(): Settings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<Settings>): Settings {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    return { ...this.settings };
  }

  // Products
  public getProducts(includeArchived = false): Product[] {
    if (includeArchived) return [...this.products];
    return this.products.filter(p => !p.archived_at);
  }

  public getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public addProduct(productData: {
    sku: string;
    name: string;
    category: string;
    description?: string;
    selling_price: number;
    initial_stock: number;
    low_stock_threshold: number;
    image?: string;
  }): { success: boolean; product?: Product; error?: string } {
    const skuClean = productData.sku.trim().toUpperCase();
    if (this.products.some(p => p.sku.toUpperCase() === skuClean)) {
      return { success: false, error: `SKU '${skuClean}' is already assigned to another product.` };
    }
    if (productData.initial_stock < 0) {
      return { success: false, error: 'Initial stock quantity cannot be negative.' };
    }
    if (productData.selling_price < 0) {
      return { success: false, error: 'Selling price cannot be negative.' };
    }

    const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    const now = new Date().toISOString();

    const product: Product = {
      id: newId,
      sku: skuClean,
      name: productData.name.trim(),
      category: productData.category.trim(),
      description: productData.description?.trim() || '',
      selling_price: productData.selling_price,
      current_stock: productData.initial_stock,
      low_stock_threshold: productData.low_stock_threshold || 10,
      image: productData.image || '',
      created_at: now,
      archived_at: null,
    };

    this.products.unshift(product);

    // Record initial stock movement
    if (productData.initial_stock > 0) {
      const movement: StockMovement = {
        id: Date.now(),
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        movement_type: 'initial',
        quantity: productData.initial_stock,
        stock_before: 0,
        stock_after: productData.initial_stock,
        user_id: this.currentUser?.id || 1,
        user_name: this.currentUser?.name || 'Administrator',
        reference_id: `INIT-${product.id}`,
        notes: 'Initial stock recorded on product creation',
        created_at: now,
      };
      this.movements.unshift(movement);
    }

    this.saveAll();
    return { success: true, product };
  }

  public updateProduct(id: number, updates: Partial<Product>): { success: boolean; error?: string } {
    const product = this.products.find(p => p.id === id);
    if (!product) return { success: false, error: 'Product not found.' };

    if (updates.sku && updates.sku.toUpperCase() !== product.sku.toUpperCase()) {
      if (this.products.some(p => p.id !== id && p.sku.toUpperCase() === updates.sku!.toUpperCase())) {
        return { success: false, error: `SKU '${updates.sku}' is already taken.` };
      }
    }

    if (updates.selling_price !== undefined && updates.selling_price < 0) {
      return { success: false, error: 'Selling price cannot be negative.' };
    }

    Object.assign(product, updates);
    this.saveAll();
    return { success: true };
  }

  public archiveProduct(id: number): boolean {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.archived_at = new Date().toISOString();
      this.saveAll();
      return true;
    }
    return false;
  }

  public restoreProduct(id: number): boolean {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.archived_at = null;
      this.saveAll();
      return true;
    }
    return false;
  }

  // Stock Management (Restocking / Manual Adjustment)
  public addStock(data: {
    productId: number;
    quantity: number;
    movementType: 'restock' | 'adjustment' | 'return';
    notes?: string;
  }): { success: boolean; error?: string; stockMovement?: StockMovement } {
    const product = this.products.find(p => p.id === data.productId);
    if (!product) return { success: false, error: 'Product not found.' };

    if (data.quantity <= 0) {
      return { success: false, error: 'Stock addition quantity must be greater than zero.' };
    }

    const previousStock = product.current_stock;
    const newStock = previousStock + data.quantity;
    product.current_stock = newStock;

    const movement: StockMovement = {
      id: Date.now(),
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      movement_type: data.movementType,
      quantity: data.quantity,
      stock_before: previousStock,
      stock_after: newStock,
      user_id: this.currentUser?.id || 1,
      user_name: this.currentUser?.name || 'Administrator',
      reference_id: `STK-${Date.now().toString().slice(-6)}`,
      notes: data.notes || `Stock added: +${data.quantity} units`,
      created_at: new Date().toISOString(),
    };

    this.movements.unshift(movement);
    this.saveAll();
    return { success: true, stockMovement: movement };
  }

  // Sales Management - Atomic Validation & Stock Deduction
  public recordSale(saleData: {
    productId: number;
    quantity: number;
    unitPrice?: number;
    paymentMethod?: 'cash' | 'card' | 'bank_transfer';
    notes?: string;
    customDate?: string;
  }): { success: boolean; sale?: Sale; error?: string } {
    const product = this.products.find(p => p.id === saleData.productId);
    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    if (saleData.quantity <= 0) {
      return { success: false, error: 'Quantity sold must be at least 1.' };
    }

    if (saleData.quantity > product.current_stock) {
      return {
        success: false,
        error: `Insufficient stock! Requested ${saleData.quantity} units, but only ${product.current_stock} units available in stock.`,
      };
    }

    const price = saleData.unitPrice !== undefined ? saleData.unitPrice : product.selling_price;
    if (price < 0) {
      return { success: false, error: 'Unit price cannot be negative.' };
    }

    const totalAmount = saleData.quantity * price;
    const previousStock = product.current_stock;
    const newStock = previousStock - saleData.quantity;

    // Immediately update remaining stock
    product.current_stock = newStock;

    const saleDate = saleData.customDate ? `${saleData.customDate}T${new Date().toISOString().split('T')[1]}` : new Date().toISOString();
    const saleCode = `SL-${Date.now().toString().slice(-6)}`;

    const newSale: Sale = {
      id: Date.now(),
      sale_code: saleCode,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      user_id: this.currentUser?.id || 1,
      user_name: this.currentUser?.name || 'Staff Member',
      quantity: saleData.quantity,
      unit_price_at_sale: price,
      total_amount: totalAmount,
      payment_method: saleData.paymentMethod || 'cash',
      sold_at: saleDate,
      notes: saleData.notes || '',
    };

    this.sales.unshift(newSale);

    // Record stock movement for the sale
    const movement: StockMovement = {
      id: Date.now() + 1,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      movement_type: 'sale',
      quantity: -saleData.quantity,
      stock_before: previousStock,
      stock_after: newStock,
      user_id: this.currentUser?.id || 1,
      user_name: this.currentUser?.name || 'Staff Member',
      reference_id: saleCode,
      notes: `Sale completed: -${saleData.quantity} units`,
      created_at: saleDate,
    };

    this.movements.unshift(movement);
    this.saveAll();

    return { success: true, sale: newSale };
  }

  // Get all sales
  public getSales(): Sale[] {
    return [...this.sales];
  }

  // Get all stock movements
  public getMovements(): StockMovement[] {
    return [...this.movements];
  }

  // Historical Daily Sales & Stock Report Calculation
  public getDailyReport(targetDateStr: string): DailyReportSummary {
    // targetDateStr format: YYYY-MM-DD
    // Filter sales on this specific day
    const daySales = this.sales.filter(s => s.sold_at.startsWith(targetDateStr));

    // Aggregate sales by product
    const productSalesMap = new Map<number, { qty: number; revenue: number; price: number }>();
    daySales.forEach(s => {
      const existing = productSalesMap.get(s.product_id) || { qty: 0, revenue: 0, price: s.unit_price_at_sale };
      existing.qty += s.quantity;
      existing.revenue += s.total_amount;
      existing.price = s.unit_price_at_sale; // Use transaction price
      productSalesMap.set(s.product_id, existing);
    });

    // Stock movements on this day
    const dayMovements = this.movements.filter(m => m.created_at.startsWith(targetDateStr));
    const stockAddedMap = new Map<number, number>();
    dayMovements.forEach(m => {
      if (m.movement_type === 'restock' || m.movement_type === 'return' || (m.movement_type === 'initial' && m.quantity > 0)) {
        const added = stockAddedMap.get(m.product_id) || 0;
        stockAddedMap.set(m.product_id, added + Math.abs(m.quantity));
      }
    });

    // For historical stock: calculate remaining stock at the end of that day
    // And calculate opening stock: Opening = Closing - Added + Sold
    const rows: DailyReportRow[] = [];
    let totalRevenue = 0;
    let totalQtySold = 0;
    let totalStockAdded = 0;
    let totalOpeningStock = 0;
    let totalClosingStock = 0;

    // Evaluate all registered products (including those with 0 sales)
    this.products.forEach(p => {
      const saleInfo = productSalesMap.get(p.id) || { qty: 0, revenue: 0, price: p.selling_price };
      const stockAdded = stockAddedMap.get(p.id) || 0;

      // Calculate closing stock at the end of targetDateStr:
      // Start with current_stock, and reverse any movements that happened AFTER the end of targetDateStr
      const dayEndISO = `${targetDateStr}T23:59:59.999Z`;
      const movementsAfterDay = this.movements.filter(m => m.product_id === p.id && m.created_at > dayEndISO);

      let historicalClosingStock = p.current_stock;
      movementsAfterDay.forEach(m => {
        // Reverse movement: if it was a sale (-qty), add it back. If it was restock (+qty), subtract it.
        historicalClosingStock -= m.quantity;
      });

      // Opening Stock = Closing Stock - Stock Added + Qty Sold
      const openingStock = Math.max(0, historicalClosingStock - stockAdded + saleInfo.qty);

      totalRevenue += saleInfo.revenue;
      totalQtySold += saleInfo.qty;
      totalStockAdded += stockAdded;
      totalOpeningStock += openingStock;
      totalClosingStock += historicalClosingStock;

      rows.push({
        product_id: p.id,
        product_name: p.name,
        product_sku: p.sku,
        category: p.category,
        opening_stock: openingStock,
        stock_added: stockAdded,
        qty_sold: saleInfo.qty,
        remaining_stock: historicalClosingStock,
        unit_price: saleInfo.price || p.selling_price,
        total_revenue: saleInfo.revenue,
      });
    });

    // Sort rows: first products that had sales, then alphabetical
    rows.sort((a, b) => {
      if (b.qty_sold !== a.qty_sold) return b.qty_sold - a.qty_sold;
      return a.product_name.localeCompare(b.product_name);
    });

    const nowFormatted = new Date().toLocaleString('en-US', {
      timeZone: this.settings.timezone || 'Asia/Colombo',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    return {
      report_date: targetDateStr,
      generated_at: nowFormatted,
      generated_by: `${this.currentUser?.name || 'Administrator'} (${this.currentUser?.role || 'admin'})`,
      total_revenue: totalRevenue,
      total_qty_sold: totalQtySold,
      total_stock_added: totalStockAdded,
      total_opening_stock: totalOpeningStock,
      total_closing_stock: totalClosingStock,
      rows,
    };
  }

  // Dashboard Stats
  public getDashboardStats() {
    const today = getTodayDateString();
    const activeProducts = this.products.filter(p => !p.archived_at);

    const totalProducts = activeProducts.length;
    const totalAvailableStock = activeProducts.reduce((sum, p) => sum + p.current_stock, 0);

    const todaySales = this.sales.filter(s => s.sold_at.startsWith(today));
    const totalSoldToday = todaySales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenueToday = todaySales.reduce((sum, s) => sum + s.total_amount, 0);

    const lowStockProducts = activeProducts.filter(p => p.current_stock > 0 && p.current_stock <= p.low_stock_threshold);
    const outOfStockProducts = activeProducts.filter(p => p.current_stock === 0);

    // Last 7 days sales for charts
    const last7Days: { date: string; label: string; revenue: number; quantity: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const daySales = this.sales.filter(s => s.sold_at.startsWith(dStr));
      const rev = daySales.reduce((sum, s) => sum + s.total_amount, 0);
      const qty = daySales.reduce((sum, s) => sum + s.quantity, 0);

      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      last7Days.push({ date: dStr, label, revenue: rev, quantity: qty });
    }

    const recentSales = this.sales.slice(0, 8);

    return {
      totalProducts,
      totalAvailableStock,
      totalSoldToday,
      totalRevenueToday,
      lowStockProducts,
      outOfStockProducts,
      last7Days,
      recentSales,
    };
  }
}

export const storageService = new StorageService();
