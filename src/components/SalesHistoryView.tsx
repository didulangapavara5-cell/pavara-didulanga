import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Filter,
  FileText,
  Printer,
  Receipt,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Sale, Settings } from '../types';

interface SalesHistoryViewProps {
  settings: Settings;
  onOpenReportForDate: (date: string) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  settings,
  onOpenReportForDate,
}) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  const currency = settings.currency || 'Rs.';
  const allSales = storageService.getSales();
  const allProducts = storageService.getProducts(true);

  // Filter sales
  const filteredSales = allSales.filter(s => {
    const saleDate = s.sold_at.split('T')[0];
    if (dateFrom && saleDate < dateFrom) return false;
    if (dateTo && saleDate > dateTo) return false;
    if (selectedProductId !== 'all' && s.product_id !== selectedProductId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = s.sale_code.toLowerCase().includes(q);
      const matchProd = s.product_name.toLowerCase().includes(q);
      const matchSku = s.product_sku.toLowerCase().includes(q);
      const matchUser = s.user_name.toLowerCase().includes(q);
      if (!matchCode && !matchProd && !matchSku && !matchUser) return false;
    }
    return true;
  });

  const totalFilteredRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalFilteredQty = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales History & Transactions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit past transactions, filter by dates and products, and regenerate historical end-of-day reports
        </p>
      </div>

      {/* Filter and Date Range Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Product
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Products</option>
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Code / Staff
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Code, product, or staff..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {(dateFrom || dateTo || selectedProductId !== 'all' || search) && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setSelectedProductId('all');
                setSearch('');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Filtered Total Revenue</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">
              {currency} {totalFilteredRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            {currency}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Units Sold</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">
              {totalFilteredQty.toLocaleString()} items
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Sale Code</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Qty Sold</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Handled By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No transactions match your filter</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const saleDateStr = sale.sold_at.split('T')[0];
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">
                          {sale.sale_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-nowrap">
                        {new Date(sale.sold_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        {new Date(sale.sold_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sale.product_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{sale.product_sku}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full">
                          {sale.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {currency} {sale.unit_price_at_sale.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">
                        {currency} {sale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[120px]">{sale.user_name}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenReportForDate(saleDateStr)}
                            title="Generate Daily Sales & Stock Report for this Date"
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>
                          <button
                            onClick={() => setActiveReceiptSale(sale)}
                            title="View Receipt"
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Transaction Receipt Modal */}
      {activeReceiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-100">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h3 className="font-bold text-slate-900 text-base">{settings.business_name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.business_address}</p>
              <div className="mt-2 inline-block px-2.5 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800">
                {activeReceiptSale.sale_code}
              </div>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-dashed border-slate-300">
              <div className="flex justify-between text-slate-500">
                <span>Date & Time:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(activeReceiptSale.sold_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cashier / Staff:</span>
                <span className="font-semibold text-slate-800">{activeReceiptSale.user_name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-800 uppercase">{activeReceiptSale.payment_method}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div>
                  <div className="font-bold text-slate-900">{activeReceiptSale.product_name}</div>
                  <div className="text-[10px] text-slate-400">
                    {activeReceiptSale.quantity} &times; {currency}{' '}
                    {activeReceiptSale.unit_price_at_sale.toLocaleString()}
                  </div>
                </div>
                <div className="font-bold text-slate-900">
                  {currency} {activeReceiptSale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="pt-3 pb-4 flex justify-between items-center text-sm font-black">
              <span>TOTAL PAID:</span>
              <span className="text-emerald-700">
                {currency} {activeReceiptSale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setActiveReceiptSale(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
