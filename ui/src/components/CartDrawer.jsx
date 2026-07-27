import { X, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWeb3 } from '../context/Web3Context'
import { getProduct, formatPrice } from '../config/products'
import { useState } from 'react'
import ConfirmActionModal from './ConfirmActionModal'

export default function CartDrawer({ open, onClose }) {
  const { cart, cartCount, removeItem, setQuantity, clearCart, linkOrder } = useCart()
  const { isConnected, account } = useWeb3()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [linkToGridset, setLinkToGridset] = useState(true)

  if (!open) return null

  const lines = cart.map(({ productId, quantity }) => {
    const p = getProduct(productId)
    return p ? { ...p, quantity, lineTotal: p.price * quantity } : null
  }).filter(Boolean)

  const total = lines.reduce((s, l) => s + l.lineTotal, 0)

  const handleCheckoutConfirm = () => {
    if (isConnected && account && linkToGridset) {
      linkOrder(account, cart.map((i) => i.productId), total)
    }
    clearCart()
    setCheckoutOpen(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-800 border-l border-gray-700 shadow-xl z-[95] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cartCount})
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {lines.length === 0 ? (
            <p className="text-gray-400">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((item) => (
                <li key={item.id} className="flex gap-4 p-3 bg-gray-800 rounded-lg">
                  <img src={item.image} alt="" className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-gray-400 text-sm">{formatPrice(item.price)} × {item.quantity}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        −
                      </button>
                      <span className="text-white text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-energy-green font-semibold">{formatPrice(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex justify-between text-lg font-semibold text-white mb-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="w-full btn-primary"
            >
              Proceed to checkout
            </button>
          </div>
        )}
      </div>

      <ConfirmActionModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleCheckoutConfirm}
        title="Checkout"
      >
        <div className="space-y-2 mb-4">
          {lines.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-300">{item.name} × {item.quantity}</span>
              <span className="text-white">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-2">
          <span>Order total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {isConnected && account && (
          <label className="flex items-center gap-2 mt-4 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={linkToGridset}
              onChange={(e) => setLinkToGridset(e.target.checked)}
              className="rounded border-gray-600"
            />
            Link to GRIDSET — associate this purchase with my wallet for future energy-credit eligibility
          </label>
        )}
        <p className="text-gray-500 text-xs mt-2">Checkout is a placeholder; no real payment is processed.</p>
      </ConfirmActionModal>
    </>
  )
}
