/**
 * Utilities.jsx — Green-energy utilities store
 *
 * Issue #26: Utilities product detail page and filters
 * Issue #14: Utilities cart, checkout, and GRID credit linking
 *
 * Features:
 *  - Category, brand, price-range, and capacity-range filters
 *  - Sort by price / rating / newest
 *  - Product card grid with Add-to-Cart and detail buttons
 *  - ProductDetailModal on click
 *  - "My linked purchases" section when wallet is connected
 *  - Cart state persisted in CartContext (localStorage)
 */

import { useState, useMemo } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useCart } from '../../context/CartContext';
import {
  PRODUCTS,
  CATEGORIES,
  BRANDS,
  SORT_OPTIONS,
  getProduct,
  formatPrice,
  parseCapacity,
} from '../../config/products';
import ProductDetailModal from '../ProductDetailModal';

// ---------------------------------------------------------------------------
// Star rating helper
// ---------------------------------------------------------------------------
function Stars({ rating }) {
  return (
    <span className="text-yellow-400 text-xs">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Filter sidebar
// ---------------------------------------------------------------------------
function FilterPanel({ filters, setFilters, onReset }) {
  return (
    <aside className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters((f) => ({ ...f, category: cat }))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.category === cat
                  ? 'bg-energy-green text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand</h3>
        <select
          value={filters.brand}
          onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="All">All Brands</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Price Range (USD)
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.priceMin ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value === '' ? null : Number(e.target.value) }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"
          />
          <span className="text-slate-500 text-sm">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.priceMax ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value === '' ? null : Number(e.target.value) }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"
          />
        </div>
      </div>

      {/* Capacity range */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Capacity
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            placeholder="Min Wh"
            value={filters.capacityMin ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, capacityMin: e.target.value === '' ? null : Number(e.target.value) }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"
          />
          <span className="text-slate-500 text-sm">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max Wh"
            value={filters.capacityMax ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, capacityMax: e.target.value === '' ? null : Number(e.target.value) }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"
          />
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-400 transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Default filter state
// ---------------------------------------------------------------------------
const DEFAULT_FILTERS = {
  category: 'All',
  brand: 'All',
  priceMin: null,
  priceMax: null,
  capacityMin: null,
  capacityMax: null,
  sort: SORT_OPTIONS[0].value,
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Utilities() {
  const { account, isConnected } = useWeb3();
  const { addItem, getLinkedOrders } = useCart();

  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [detailId, setDetailId]     = useState(null);
  const [addedId, setAddedId]       = useState(null);

  // --- Filtered + sorted product list ---
  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    // Category
    if (filters.category !== 'All') {
      list = list.filter((p) => p.category === filters.category);
    }

    // Brand
    if (filters.brand !== 'All') {
      list = list.filter((p) => p.brand === filters.brand);
    }

    // Price range
    if (filters.priceMin != null) {
      list = list.filter((p) => p.price >= filters.priceMin);
    }
    if (filters.priceMax != null) {
      list = list.filter((p) => p.price <= filters.priceMax);
    }

    // Capacity range (parse capacity string to numeric Wh)
    if (filters.capacityMin != null) {
      list = list.filter((p) => parseCapacity(p.capacity) >= filters.capacityMin);
    }
    if (filters.capacityMax != null) {
      list = list.filter((p) => parseCapacity(p.capacity) <= filters.capacityMax);
    }

    // Sort
    const opt = SORT_OPTIONS.find((s) => s.value === filters.sort);
    if (opt?.compareFn) {
      list = list.sort(opt.compareFn);
    }

    return list;
  }, [filters]);

  // --- Add to cart with brief confirmation flash ---
  const handleAddToCart = (productId) => {
    addItem(productId, 1);
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1200);
  };

  // --- Linked purchases for connected wallet ---
  const linkedOrders = account ? getLinkedOrders(account) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilities Store</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Sort by</label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Wallet CTA */}
      {!isConnected && !account && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔗</span>
          <div>
            <p className="text-sm font-medium text-white">Connect your wallet</p>
            <p className="text-xs text-slate-400">
              Link purchases to your GRIDSET account and earn energy credits.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <div className="w-56 flex-shrink-0">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {/* Product grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm">No products match your filters.</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-3 text-energy-green text-sm hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col hover:border-slate-500 transition-colors"
                >
                  {/* Product image */}
                  <button
                    onClick={() => setDetailId(product.id)}
                    className="relative aspect-video bg-slate-700 overflow-hidden block w-full"
                    title="View details"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </button>

                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs text-energy-green font-medium">{product.brand}</p>
                    <button
                      onClick={() => setDetailId(product.id)}
                      className="text-sm font-medium text-white text-left hover:text-energy-green transition-colors line-clamp-2 mt-0.5"
                    >
                      {product.name}
                    </button>
                    <p className="text-xs text-slate-500 mt-0.5">{product.capacity}</p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Stars rating={product.rating} />
                      <span className="text-xs text-slate-500">({product.reviews})</span>
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="text-base font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setDetailId(product.id)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={!product.inStock}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            addedId === product.id
                              ? 'bg-energy-green text-slate-900'
                              : 'bg-slate-600 hover:bg-energy-green hover:text-slate-900 text-slate-300'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {addedId === product.id ? '✓ Added' : '+ Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linked purchases */}
      {(isConnected || account) && linkedOrders.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            My Linked Purchases
            <span className="ml-2 text-xs text-slate-400">wallet: {account?.slice(0, 6)}…{account?.slice(-4)}</span>
          </h2>
          <div className="space-y-2">
            {linkedOrders.map((order, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/50 pb-2">
                <div className="flex gap-2">
                  {(order.productIds ?? []).map((pid) => {
                    const p = getProduct(pid);
                    return p ? (
                      <span key={pid} className="bg-slate-700 rounded px-2 py-0.5">{p.name}</span>
                    ) : null;
                  })}
                </div>
                <span className="text-energy-green">{formatPrice(order.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product detail modal */}
      {detailId && (
        <ProductDetailModal
          productId={detailId}
          onClose={() => setDetailId(null)}
          onAddToCart={(id) => { handleAddToCart(id); setDetailId(null); }}
        />
      )}
    </div>
  );
}
