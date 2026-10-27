import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWeb3 } from '../context/Web3Context'
import { getProduct, formatNumber, formatPrice } from '../config/products'
import StoreDialog from './StoreDialog'

function CartContent({ onClose }) {
  const { items, cartCount, removeItem, setQuantity, clearCart, linkOrder } = useCart()
  const { isConnected, account } = useWeb3()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [linkToNirooset, setLinkToNirooset] = useState(false)
  const lines = items.flatMap(({ productId, quantity }) => {
    const product = getProduct(productId)
    return product ? [{ ...product, quantity, lineTotal: product.price * quantity }] : []
  })
  const total = lines.reduce((sum, item) => sum + item.lineTotal, 0)

  const confirmDemoCheckout = () => {
    if (isConnected && account && linkToNirooset) {
      linkOrder(account, lines.map((item) => item.id), total)
    }
    clearCart()
    onClose()
  }

  return (
    <StoreDialog title={`سبد خرید آزمایشی (${formatNumber(cartCount)})`} onClose={onClose}>
      <p className="mb-4 text-sm text-amber-200">قیمت‌ها نمونه و به دلار آمریکا (USD) هستند؛ پرداخت یا ارسال واقعی انجام نمی‌شود. نیازی به کیف پول یا ورود نیست.</p>
      {lines.length === 0 ? <p className="py-8 text-slate-300">سبد خرید شما خالی است.</p> : (
        <>
          <ul className="space-y-4">
            {lines.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-lg bg-slate-900 p-3">
                <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="break-words font-medium">{item.name}</p>
                  <p className="text-sm text-slate-300"><bdi>{formatPrice(item.price, item.currency)}</bdi> × {formatNumber(item.quantity)}</p>
                  {!checkoutOpen && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label={`کاهش تعداد ${item.name}`} className="rounded bg-slate-700 px-3 py-2">−</button>
                      <span aria-label="تعداد">{formatNumber(item.quantity)}</span>
                      <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label={`افزایش تعداد ${item.name}`} className="rounded bg-slate-700 px-3 py-2">+</button>
                      <button type="button" onClick={() => removeItem(item.id)} aria-label={`حذف ${item.name}`}
                        className="rounded px-3 py-2 text-red-300">حذف</button>
                    </div>
                  )}
                  <p className="text-energy-green"><bdi>{formatPrice(item.lineTotal, item.currency)}</bdi></p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-700 pt-4 font-semibold">
            <span>مجموع آزمایشی</span><bdi>{formatPrice(total)}</bdi>
          </div>
          {checkoutOpen ? (
            <section aria-label="تأیید خرید آزمایشی" className="mt-4 space-y-4">
              <p className="text-sm text-amber-200">با تأیید، سبد پاک می‌شود. سفارش واقعی، پرداخت، رزرو موجودی یا ارسال ثبت نمی‌شود.</p>
              {isConnected && account && (
                <label className="flex items-start gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={linkToNirooset} onChange={(event) => setLinkToNirooset(event.target.checked)} className="mt-1" />
                  ذخیره اختیاری سابقه آزمایشی مرتبط با کیف پول روی این دستگاه؛ بدون اعتبار انرژی
                </label>
              )}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setCheckoutOpen(false)} className="btn-secondary flex-1">بازگشت به سبد</button>
                <button type="button" onClick={confirmDemoCheckout} className="btn-primary flex-1">تأیید آزمایشی و پاک‌کردن سبد</button>
              </div>
            </section>
          ) : (
            <button type="button" onClick={() => setCheckoutOpen(true)} className="btn-primary mt-4 w-full">ادامه خرید آزمایشی بدون ورود</button>
          )}
        </>
      )}
    </StoreDialog>
  )
}

export default function CartDrawer({ open, onClose }) {
  return open ? <CartContent onClose={onClose} /> : null
}
