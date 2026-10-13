import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
  currency: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
  currency,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Men Apparel');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>(1500);
  const [initialStock, setInitialStock] = useState<number | ''>(50);
  const [threshold, setThreshold] = useState<number | ''>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sku.trim()) {
      setError('Product SKU is required.');
      return;
    }
    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (sellingPrice === '' || Number(sellingPrice) < 0) {
      setError('Selling price cannot be empty or negative.');
      return;
    }
    if (initialStock === '' || Number(initialStock) < 0) {
      setError('Initial stock cannot be empty or negative.');
      return;
    }

    const res = storageService.addProduct({
      sku: sku.trim(),
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      selling_price: Number(sellingPrice),
      initial_stock: Number(initialStock),
      low_stock_threshold: Number(threshold) || 10,
      image: imageUrl.trim(),
    });

    if (res.success && res.product) {
      onProductCreated(res.product);
      onClose();
      // Reset form
      setSku('');
      setName('');
      setDescription('');
      setSellingPrice(1500);
      setInitialStock(50);
      setImageUrl('');
    } else {
      setError(res.error || 'Failed to save product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Product</h3>
            <p className="text-xs text-slate-500">Register new item into catalog with initial inventory stock</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Slim Denim Jeans"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. JNS-102"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="Men Apparel">Men Apparel</option>
                <option value="Women Apparel">Women Apparel</option>
                <option value="Kids & Baby">Kids & Baby</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Outerwear">Outerwear</option>
                <option value="General Merch">General Merch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Selling Price ({currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={initialStock}
                onChange={e => setInitialStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Logs initial stock movement automatically</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low-Stock Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                value={threshold}
                onChange={e => setThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Warns when stock &le; threshold</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Fabric details, sizing, manufacturer or shelf code..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
