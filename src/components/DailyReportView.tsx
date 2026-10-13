import React, { useState } from 'react';
import {
  Printer,
  Calendar,
  Download,
  Share2,
  FileText,
  DollarSign,
  Boxes,
  ShoppingCart,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { storageService, getTodayDateString } from '../services/storageService';
import { Settings, DailyReportSummary } from '../types';

interface DailyReportViewProps {
  settings: Settings;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({ settings }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const currency = settings.currency || 'Rs.';

  const reportData: DailyReportSummary = storageService.getDailyReport(selectedDate);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'SKU',
      'Opening Stock',
      'Stock Added',
      'Qty Sold',
      'Remaining Stock',
      'Unit Price',
      'Total Revenue',
    ];

    const rows = reportData.rows.map(r => [
      `"${r.product_name}"`,
      `"${r.product_sku}"`,
      r.opening_stock,
      r.stock_added,
      r.qty_sold,
      r.remaining_stock,
      r.unit_price,
      r.total_revenue,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `DAILY SALES & STOCK REPORT - ${selectedDate}`,
        `Business: ${settings.business_name}`,
        headers.join(','),
        ...rows.map(e => e.join(',')),
        `TOTAL REVENUE,,,,,,,"${currency} ${reportData.total_revenue}"`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `daily_sales_report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (hidden on print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Select Report Date:</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 print-include"
          >
            <Printer className="w-4 h-4" />
            <span>Print Daily Report (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="print-container bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs">
        {/* Report Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.business_name}</h1>
              <p className="text-xs text-slate-600 mt-1">
                {settings.business_address} &bull; Tel: {settings.contact_number}
              </p>
              <h2 className="text-lg font-black text-blue-700 uppercase tracking-widest mt-3">
                DAILY SALES &amp; STOCK REPORT
              </h2>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200 text-xs text-slate-600 space-y-1">
              <div>
                <strong>Selected Report Date:</strong>{' '}
                <span className="font-semibold text-slate-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <strong>Report Generated Time:</strong> {reportData.generated_at}
              </div>
              <div>
                <strong>Generated By:</strong> {reportData.generated_by}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print-avoid-break">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Opening Stock</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{reportData.total_opening_stock}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Stock Added</span>
            <span className="text-lg font-black text-emerald-600 mt-0.5 block">+{reportData.total_stock_added}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Quantity Sold</span>
            <span className="text-lg font-black text-blue-600 mt-0.5 block">{reportData.total_qty_sold}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Closing Remaining Stock</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{reportData.total_closing_stock}</span>
          </div>
        </div>

        {/* Product-Wise Daily Sales & Stock Report Table */}
        <div className="overflow-x-auto">
          <table className="report-table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-y-2 border-slate-900">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Opening Stock</th>
                <th className="py-2.5 px-3 text-right">Stock Added</th>
                <th className="py-2.5 px-3 text-right">Qty Sold</th>
                <th className="py-2.5 px-3 text-right">Remaining Stock</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No products cataloged for this date.
                  </td>
                </tr>
              ) : (
                reportData.rows.map(row => (
                  <tr key={row.product_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{row.product_name}</div>
                      <span className="font-mono text-[10px] text-slate-500">[{row.product_sku}]</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">{row.opening_stock}</td>
                    <td className="py-2.5 px-3 text-right">
                      {row.stock_added > 0 ? (
                        <span className="font-bold text-emerald-600">+{row.stock_added}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.qty_sold > 0 ? (
                        <span className="font-black text-blue-700 text-sm">{row.qty_sold}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{row.remaining_stock}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      {row.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {row.total_revenue > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          {row.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-400">0.00</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-900">
                <td className="py-3 px-3 uppercase">TOTAL SUMMARY</td>
                <td className="py-3 px-3 text-right">{reportData.total_opening_stock}</td>
                <td className="py-3 px-3 text-right text-emerald-700">+{reportData.total_stock_added}</td>
                <td className="py-3 px-3 text-right text-blue-700">{reportData.total_qty_sold}</td>
                <td className="py-3 px-3 text-right">{reportData.total_closing_stock}</td>
                <td className="py-3 px-3 text-right text-slate-400">-</td>
                <td className="py-3 px-3 text-right text-emerald-700 text-sm">
                  {currency} {reportData.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Grand Total Revenue Banner matching prompt */}
        <div className="mt-6 p-4 rounded-xl border-2 border-slate-900 bg-slate-50 flex items-center justify-between print-avoid-break">
          <div>
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider block">
              End-of-Day Gross Sales
            </span>
            <span className="text-base font-black text-slate-900">TOTAL DAILY REVENUE:</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {currency} {reportData.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Printable Signature Area */}
        <div className="mt-14 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center print-signature-area">
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2"></div>
            <p className="text-xs font-bold text-slate-900 uppercase">Prepared By</p>
            <p className="text-[11px] text-slate-500">{reportData.generated_by}</p>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2"></div>
            <p className="text-xs font-bold text-slate-900 uppercase">Stock Controller Verification</p>
            <p className="text-[11px] text-slate-500">Sign &amp; Timestamp</p>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2"></div>
            <p className="text-xs font-bold text-slate-900 uppercase">Authorized Manager</p>
            <p className="text-[11px] text-slate-500">Signature &amp; Official Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
