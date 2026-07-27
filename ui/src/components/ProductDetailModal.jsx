import { X, ShoppingCart, Star } from 'lucide-react'
import { getProduct, formatPrice, CATEGORIES } from '../config/products'

export default function ProductDetailModal({ productId, onClose, onAddToCart }) {
  const product = productId ? getProduct(productId) : null
  if (!product) return null

  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 border border-gray-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex justify-end p-2 bg-slate-800/95 z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 pt-0">
          <div className="aspect-[4/3] bg-slate-700 rounded-lg overflow-hidden mb-4">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <p className="text-energy-green/90 text-xs font-medium uppercase tracking-wide">{product.brand}</p>
          <h2 className="text-xl font-bold text-white mt-1 mb-1">{product.name}</h2>
          <p className="text-sm text-gray-400 mb-2">{categoryLabel} · {product.capacity}</p>
          <div className="flex items-center gap-2 text-energy-yellow mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-white font-medium">{product.rating}</span>
            <span className="text-gray-500 text-sm">{product.reviews} reviews</span>
          </div>
          <ul className="text-sm text-gray-300 space-y-2 mb-6">
            {product.specs.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <span className="text-2xl font-bold text-white">{formatPrice(product.price, product.currency)}</span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary py-2 px-4">
                Close
              </button>
              <button
                type="button"
                onClick={() => { onAddToCart(product.id); onClose(); }}
                className="btn-primary flex items-center gap-2 py-2 px-4"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
