import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Receipt,
  Printer,
  Sparkles,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Product, Sale, Settings } from '../types';

interface RecordSalesViewProps {
  settings: Settings;
  onViewReport: () => void;
}

export const RecordSalesView: React.FC<RecordSalesViewProps> = ({
  settings,
  onViewReport,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantitySold, setQuantitySold] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');
  const [lastSavedSale, setLastSavedSale] = useState<Sale | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [todayDateStr, setTodayDateStr] = useState('');

  const currency = settings.currency || 'Rs.';

  useEffect(() => {
    loadProducts();
    const now = new Date();
    setTodayDateStr(now.toISOString().split('T')[0]);
  }, []);

  const loadProducts = () => {
    const list = storageService.getProducts(false);
    setProducts(list);
    if (list.length > 0 && selectedProductId === '') {
      // Pick the first available product with stock > 0 if possible
      const available = list.find(p => p.current_stock > 0) || list[0];
      setSelectedProductId(available.id);
    }
  };

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const availableStock = selectedProduct ? selectedProduct.current_stock : 0;
  const unitPrice = selectedProduct ? selectedProduct.selling_price : 0;
  const safeQty = Math.max(0, quantitySold);
  const calculatedTotal = safeQty * unitPrice;
  const isStockInsufficient = selectedProduct ? safeQty > availableStock : false;

  const handleQtyChange = (delta: number) => {
    setQuantitySold(prev => {
      const next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLastSavedSale(null);

    if (!selectedProductId || !selectedProduct) {
      setErrorMsg('Please select a product.');
      return;
    }

    if (quantitySold <= 0) {
      setErrorMsg('Quantity sold must be at least 1 unit.');
      return;
    }

    if (quantitySold > availableStock) {
      setErrorMsg(
        `Cannot sell ${quantitySold} units! Only ${availableStock} units are available in inventory.`
      );
      return;
    }

    const res = storageService.recordSale({
      productId: Number(selectedProductId),
      quantity: quantitySold,
      unitPrice,
      paymentMethod,
      notes: notes.trim(),
    });

    if (res.success && res.sale) {
      setLastSavedSale(res.sale);
      setQuantitySold(1);
      setNotes('');
      loadProducts();
    } else {
      setErrorMsg(res.error || 'Failed to record sale.');
    }
  };

  // Today's summary stats
  const todaySummary = storageService.getDailyReport(todayDateStr || new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      {/* Header with Today's Live Sales Counters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              POS Terminal
            </span>
            <span className="text-xs text-slate-400">Date: {todayDateStr}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Record Daily Sales</h2>
          <p className="text-xs text-slate-500">
            Instant sale entry with automatic stock deduction and locked transaction price
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Revenue</span>
            <span className="text-base font-black text-emerald-600">
              {currency} {todaySummary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Units Sold</span>
            <span className="text-base font-black text-slate-800">{todaySummary.total_qty_sold} items</span>
          </div>
        </div>
      </div>

      {/* Success Receipt Banner */}
      {lastSavedSale && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                  {lastSavedSale.sale_code}
                </span>
                <span className="font-bold text-slate-900 text-sm">Sale Completed Successfully!</span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Sold <strong>{lastSavedSale.quantity} &times; {lastSavedSale.product_name}</strong> for{' '}
                <strong className="text-emerald-900">
                  {currency} {lastSavedSale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
                . Remaining Stock: <strong>{selectedProduct?.current_stock} units</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-300 transition flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Sales Entry Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSaveSale} className="space-y-4">
            {/* Product selection dropdown with search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="">-- Choose Product to Sell --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.current_stock <= 0}>
                    {p.name} ({p.sku}) &bull; Stock: {p.current_stock} units &bull; Price: {currency}{' '}
                    {p.selling_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    {p.current_stock <= 0 ? ' [OUT OF STOCK]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Specifications Badges */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Product SKU</span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {selectedProduct?.sku || '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Stock</span>
                <span
                  className={`text-xs font-black ${
                    availableStock === 0
                      ? 'text-red-600'
                      : availableStock <= (selectedProduct?.low_stock_threshold || 10)
                      ? 'text-amber-600'
                      : 'text-slate-800'
                  }`}
                >
                  {availableStock} units
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Selling Price</span>
                <span className="text-xs font-black text-blue-600">
                  {currency} {unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Quantity Sold with +/- Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity Sold <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-l-xl text-slate-600 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={availableStock > 0 ? availableStock : 1}
                    required
                    value={quantitySold}
                    onChange={e => setQuantitySold(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center py-2.5 bg-slate-50 border-y border-slate-200 text-sm font-black text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-r-xl text-slate-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isStockInsufficient && (
                  <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Exceeds available stock ({availableStock} units)!</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                      paymentMethod === 'cash'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                      paymentMethod === 'card'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    QR / Bank
                  </button>
                </div>
              </div>
            </div>

            {/* Automatically Calculated Sale Total Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Automatically Calculated Sale Total
                </span>
                <span className="text-xs text-blue-700 font-medium">
                  {safeQty} units &times; {currency} {unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-700 tracking-tight">
                  {currency} {calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order Notes / Customer Name (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Counter 1 Walk-in Customer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isStockInsufficient || availableStock <= 0}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition shadow-md flex items-center justify-center gap-2 ${
                isStockInsufficient || availableStock <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Save Sale & Deduct Stock Immediately</span>
            </button>
          </form>
        </div>

        {/* Right side: Today's Recent Sales Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Today's Sales Ledger</span>
            </h3>
            <button
              onClick={onViewReport}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Daily Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-slate-100">
            {todaySummary.rows.filter(r => r.qty_sold > 0).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No sales recorded yet for today</p>
                <p className="text-[11px] mt-0.5">Record your first sale using the form on the left.</p>
              </div>
            ) : (
              storageService
                .getSales()
                .filter(s => s.sold_at.startsWith(todayDateStr))
                .map(sale => (
                  <div key={sale.id} className="p-3.5 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                            {sale.sale_code}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{sale.product_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {sale.quantity} units &times; {currency} {sale.unit_price_at_sale.toLocaleString()}
                          <span className="ml-2 font-mono uppercase text-[9px] px-1 py-0.2 bg-slate-100 rounded text-slate-600">
                            {sale.payment_method}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-600 text-xs">
                          {currency} {sale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(sale.sold_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
