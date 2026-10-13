import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  ArrowRight,
  History,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Product, StockMovement, Settings } from '../types';

interface StockManagementViewProps {
  initialProductId?: number | null;
  settings: Settings;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  initialProductId,
  settings,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>(initialProductId || '');
  const [addQuantity, setAddQuantity] = useState<number | ''>(20);
  const [movementType, setMovementType] = useState<'restock' | 'adjustment' | 'return'>('restock');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [filterProductId, setFilterProductId] = useState<number | 'all'>('all');
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    loadData();
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    }
  }, [initialProductId]);

  const loadData = () => {
    const prods = storageService.getProducts(false);
    setProducts(prods);
    setMovements(storageService.getMovements());
  };

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));

  const previousStock = selectedProduct ? selectedProduct.current_stock : 0;
  const addedQtyNumber = Number(addQuantity) || 0;
  const newStockCalculated = previousStock + addedQtyNumber;

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedProductId) {
      setErrorMsg('Please select a product to update stock.');
      return;
    }
    if (addedQtyNumber <= 0) {
      setErrorMsg('Quantity added must be greater than zero.');
      return;
    }

    const res = storageService.addStock({
      productId: Number(selectedProductId),
      quantity: addedQtyNumber,
      movementType,
      notes: notes.trim(),
    });

    if (res.success && res.stockMovement) {
      setSuccessMsg(
        `Added +${addedQtyNumber} units to ${res.stockMovement.product_name}! New Available Stock: ${res.stockMovement.stock_after} units.`
      );
      setNotes('');
      loadData();
    } else {
      setErrorMsg(res.error || 'Failed to update stock.');
    }
  };

  const filteredMovements = movements.filter(m => {
    if (filterProductId === 'all') return true;
    return m.product_id === filterProductId;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stock Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Restock inventory, record returns/adjustments, and maintain strict inventory tracking
        </p>
      </div>

      {/* Formula Explainer Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-blue-900">Inventory Calculation Formula:</span>
            <span className="text-blue-800 ml-1 font-mono font-semibold">
              Remaining Stock = Previous Available Stock + Newly Added Stock - Quantity Sold
            </span>
          </div>
        </div>
        <div className="text-[11px] text-blue-700 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200">
          Example: 100 + 20 - 15 = <strong>105 units</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stock Addition Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Add Stock / Restock Product</h3>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="">-- Choose a Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) &bull; Current: {p.current_stock} units
                  </option>
                ))}
              </select>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Previous Available Stock:</span>
                <span className="font-bold text-slate-800">{previousStock} units</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>+ Newly Added Stock:</span>
                <span className="font-bold">+{addedQtyNumber} units</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                <span>New Available Stock:</span>
                <span className="text-sm font-black text-blue-600">{newStockCalculated} units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Add <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addQuantity}
                  onChange={e => setAddQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Movement Reason
                </label>
                <select
                  value={movementType}
                  onChange={e => setMovementType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="restock">Supplier Restock</option>
                  <option value="return">Customer Return</option>
                  <option value="adjustment">Manual Adjustment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference / Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Supplier PO #4092 or shelf audit correction"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Confirm & Update Stock Level</span>
            </button>
          </form>
        </div>

        {/* Permanent Movement History Audit Log */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Stock Movement History Audit Log</span>
              </h3>
              <p className="text-xs text-slate-400">Complete record of purchases, sales, restocking, and adjustments</p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold">Filter:</span>
              <select
                value={filterProductId}
                onChange={e => setFilterProductId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Products</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Qty Change</th>
                  <th className="py-2.5 px-3 text-center">Stock Path</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No stock movements recorded.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-400 text-nowrap">
                        {new Date(m.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(m.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800">{m.product_name}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">{m.product_sku}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.movement_type === 'sale'
                              ? 'bg-rose-100 text-rose-700'
                              : m.movement_type === 'restock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.movement_type === 'initial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-black ${
                          m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-center text-nowrap">
                        <span className="text-slate-400">{m.stock_before}</span>
                        <span className="text-slate-300 mx-1">&rarr;</span>
                        <span className="font-bold text-slate-800">{m.stock_after}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[100px]">
                        {m.user_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
