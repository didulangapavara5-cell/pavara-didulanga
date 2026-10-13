import React from 'react';
import {
  Boxes,
  Package,
  ShoppingCart,
  Banknote,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Settings } from '../types';
import { NavigationTab } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onRestockProduct: (productId: number) => void;
  settings: Settings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onRestockProduct,
  settings,
}) => {
  const stats = storageService.getDashboardStats();
  const currency = settings.currency || 'Rs.';

  const formatMoney = (val: number) => {
    return `${currency} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Find max revenue in 7 days for chart scaling
  const maxRevenue = Math.max(...stats.last7Days.map(d => d.revenue), 1000);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wider uppercase">
              Retail Operations Hub
            </span>
            <span className="text-blue-100 text-xs">Asia/Colombo</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Smart Inventory & Daily Sales</h2>
          <p className="text-blue-100 text-xs mt-1 max-w-xl">
            Real-time stock deduction, inventory movements, and automated daily revenue calculation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('sales')}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span>Record Daily Sale</span>
          </button>
          <button
            onClick={() => onNavigate('stock')}
            className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs transition border border-white/10 flex items-center gap-1.5"
          >
            <Boxes className="w-4 h-4 text-blue-200" />
            <span>Manage Stock</span>
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs transition border border-white/10 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>End-of-Day Report</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Products</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalProducts}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active in catalog</span>
            </div>
          </div>
        </div>

        {/* Total Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Available Stock</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {stats.totalAvailableStock} <span className="text-sm font-normal text-slate-400">units</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Across all categories & shelves
            </div>
          </div>
        </div>

        {/* Sold Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity Sold Today</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {stats.totalSoldToday} <span className="text-sm font-normal text-slate-400">items</span>
            </div>
            <div className="mt-1 text-xs text-amber-600 font-semibold">
              Real-time daily deduction
            </div>
          </div>
        </div>

        {/* Total Daily Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md shadow-emerald-600/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Total Daily Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{formatMoney(stats.totalRevenueToday)}</div>
            <div className="mt-1 text-xs text-emerald-100 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gross daily retail sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Stock Alert Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Sales & Revenue Trend</h3>
              <p className="text-xs text-slate-400">Daily gross revenue in Sri Lankan Rupees ({currency})</p>
            </div>
            <button
              onClick={() => onNavigate('report')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Daily Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {stats.last7Days.map((day, idx) => {
              const heightPct = Math.max(6, Math.round((day.revenue / maxRevenue) * 100));
              const isToday = idx === stats.last7Days.length - 1;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {formatMoney(day.revenue)}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg relative flex items-end justify-center overflow-hidden h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-700 to-blue-500 shadow-sm'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-blue-500 group-hover:to-blue-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold truncate ${
                      isToday ? 'text-blue-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {day.label}
                  </span>
                  <span className="text-[9px] text-slate-400">{day.quantity} sold</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Formula: SUM(Quantity Sold &times; Unit Selling Price)</span>
            <span className="font-semibold text-slate-700">7-Day Total: {formatMoney(stats.last7Days.reduce((a, b) => a + b.revenue, 0))}</span>
          </div>
        </div>

        {/* Stock Alerts Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Warnings</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
              {stats.lowStockProducts.length + stats.outOfStockProducts.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-80">
            {stats.outOfStockProducts.length === 0 && stats.lowStockProducts.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <Boxes className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-slate-600">All stock levels healthy!</p>
                <p className="text-[11px]">No items at or below threshold.</p>
              </div>
            ) : null}

            {/* Out of stock list */}
            {stats.outOfStockProducts.map(p => (
              <div
                key={p.id}
                className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-bold uppercase">
                      Out of Stock
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{p.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    SKU: <span className="font-mono font-semibold">{p.sku}</span> &bull; 0 remaining
                  </div>
                </div>
                <button
                  onClick={() => onRestockProduct(p.id)}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}

            {/* Low stock list */}
            {stats.lowStockProducts.map(p => (
              <div
                key={p.id}
                className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[9px] font-bold uppercase">
                      Low Stock
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{p.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Current: <strong className="text-amber-800 font-bold">{p.current_stock}</strong> (Threshold: {p.low_stock_threshold})
                  </div>
                </div>
                <button
                  onClick={() => onRestockProduct(p.id)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                  Add Stock
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('stock')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <span>Go to Stock Management</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sales Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Sales Transactions</h3>
            <p className="text-xs text-slate-400">Latest counter & walk-in sales recorded today</p>
          </div>
          <button
            onClick={() => onNavigate('sales_history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Sales History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Sale Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Qty Sold</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Handled By</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transactions recorded yet today.
                  </td>
                </tr>
              ) : (
                stats.recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {sale.sale_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{sale.product_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{sale.product_sku}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                        {sale.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatMoney(sale.unit_price_at_sale)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatMoney(sale.total_amount)}</td>
                    <td className="py-3 px-4 text-slate-600">{sale.user_name}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(sale.sold_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
