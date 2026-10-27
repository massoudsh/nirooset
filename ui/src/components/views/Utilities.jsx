import { useEffect, useMemo, useRef, useState } from 'react'
import { useWeb3 } from '../../context/Web3Context'
import { useCart } from '../../context/CartContext'
import { PRODUCTS, CATEGORIES, BRANDS, SORT_OPTIONS, getProduct, formatPrice, formatNumber, filterProducts, estimateRuntime } from '../../config/products'
import ProductDetailModal from '../ProductDetailModal'
import CartDrawer from '../CartDrawer'

function RuntimeEstimator() {
  const [energy, setEnergy] = useState('40')
  const [load, setLoad] = useState('10')
  const [usable, setUsable] = useState('80')
  const hours = estimateRuntime(Number(energy), Number(load), Number(usable))
  return (
    <section aria-label="تخمین زمان پشتیبانی" className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
      <h2 className="font-semibold text-white">تخمین زمان پشتیبانی</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['انرژی باتری (Wh)', energy, setEnergy],
          ['مصرف واقعی دستگاه (W)', load, setLoad],
          ['انرژی قابل‌استفاده (٪)', usable, setUsable, 100],
        ].map(([label, value, setValue, max]) => (
          <label key={label} className="text-sm text-slate-300">
            {label}
            <input type="number" min="0" max={max} step="any" value={value} dir="ltr"
              onChange={(event) => setValue(event.target.value)}
              className="mt-1 w-full rounded bg-slate-700 px-3 py-2 text-white" />
          </label>
        ))}
      </div>
      <p role="status" className="text-energy-green">
        {hours == null ? 'مقادیر مثبت و درصد حداکثر ۱۰۰ وارد کنید.' : `زمان تخمینی: ${formatNumber(hours, { maximumFractionDigits: 2 })} ساعت`}
      </p>
      <p className="text-xs leading-6 text-slate-400">انرژی بر حسب وات‌ساعت × درصد قابل‌استفاده ÷ مصرف واقعی بر حسب وات. مقدار ۸۰٪ فقط یک فرض است، نه نتیجه آزمایش. تلفات، عمر باتری و مصرف بی‌باری مؤثرند. ولتاژ، قطبیت، اتصال‌دهنده و توان خروجی باید جداگانه بررسی شوند. روشن‌بودن مودم، اتصال سرویس‌دهنده اینترنت را تضمین نمی‌کند.</p>
    </section>
  )
}

const DEFAULT_FILTERS = { category: 'all', brand: 'all', priceMin: null, priceMax: null, capacityMin: null, capacityMax: null, sort: SORT_OPTIONS[0].id }

function FilterPanel({ filters, setFilters }) {
  return (
    <aside aria-label="فیلتر محصولات" className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm text-slate-300">دسته‌بندی</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button key={category.id} type="button" aria-pressed={filters.category === category.id}
              onClick={() => setFilters((current) => ({ ...current, category: category.id }))}
              className={`rounded-full px-3 py-2 text-xs ${filters.category === category.id ? 'bg-energy-green text-slate-900' : 'bg-slate-700 text-slate-200'}`}>
              {category.label}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm text-slate-300">برند
        <select value={filters.brand} onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
          className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white">
          <option value="all">همه برندها</option>
          {BRANDS.map((brand) => <option key={brand.id} value={brand.id}>{brand.label}</option>)}
        </select>
      </label>
      {[
        ['قیمت نمونه (دلار آمریکا، USD)', 'priceMin', 'priceMax'],
        ['ظرفیت انرژی (Wh؛ ظرفیت نامشخص حذف می‌شود)', 'capacityMin', 'capacityMax'],
      ].map(([legend, min, max]) => (
        <fieldset key={min}>
          <legend className="mb-2 text-sm text-slate-300">{legend}</legend>
          <div className="grid grid-cols-2 gap-2">
            {[[min, 'حداقل'], [max, 'حداکثر']].map(([field, label]) => (
              <label key={field} className="min-w-0 text-xs text-slate-400">{label}
                <input type="number" min="0" step="any" value={filters[field] ?? ''} dir="ltr"
                  onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value === '' ? null : Number(event.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-2 py-2 text-sm text-white" />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-200">پاک‌کردن فیلترها</button>
    </aside>
  )
}

export default function Utilities() {
  const { account } = useWeb3()
  const { addItem, getLinkedOrders, cartCount } = useCart()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [detailId, setDetailId] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [addedId, setAddedId] = useState(null)
  const addedTimer = useRef(null)
  useEffect(() => () => clearTimeout(addedTimer.current), [])
  const filtered = useMemo(() => filterProducts(PRODUCTS, filters), [filters])
  const linkedOrders = account ? getLinkedOrders(account) : []

  const handleAddToCart = (productId) => {
    addItem(productId, 1)
    setAddedId(productId)
    clearTimeout(addedTimer.current)
    addedTimer.current = setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div dir="rtl" lang="fa" className="min-w-0 space-y-6 text-start">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">فروشگاه تجهیزات انرژی</h1>
          <p role="status" className="mt-1 text-sm text-slate-400">{formatNumber(filtered.length)} محصول پیدا شد</p>
        </div>
        <button type="button" onClick={() => setCartOpen(true)} className="btn-primary">سبد خرید ({formatNumber(cartCount)})</button>
        <label className="flex flex-wrap items-center gap-2 text-sm text-slate-300">مرتب‌سازی
          <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white">
            {SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <p className="rounded-xl border border-amber-500/40 p-4 text-sm leading-7 text-amber-200">این فروشگاه آزمایشی است. محصولات، تصاویر، مشخصات و قیمت‌های دلاری نمونه‌اند؛ موجودی و ضمانت تأیید نشده‌اند. پرداخت، ارسال و اعتبار انرژی واقعی ارائه نمی‌شود. برای مشاهده یا استفاده از سبد، نیازی به کیف پول و ورود ندارید.</p>
      <RuntimeEstimator />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-56"><FilterPanel filters={filters} setFilters={setFilters} /></div>
        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-300">
              <p>محصولی با این فیلترها پیدا نشد.</p>
              <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-3 rounded px-3 py-2 text-energy-green">پاک‌کردن فیلترها</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <article key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                  <button type="button" onClick={() => setDetailId(product.id)} aria-label={`مشاهده جزئیات ${product.name}`}
                    className="block aspect-video w-full overflow-hidden bg-slate-700">
                    <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="text-xs text-energy-green"><bdi>{product.brand}</bdi></p>
                    <h2><button type="button" onClick={() => setDetailId(product.id)} className="text-start text-sm font-medium text-white hover:text-energy-green">{product.name}</button></h2>
                    <p className="text-xs text-slate-400"><bdi>{product.capacity}</bdi></p>
                    <bdi className="mt-auto pt-2 font-bold text-white">{formatPrice(product.price, product.currency)}</bdi>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setDetailId(product.id)} className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200">جزئیات</button>
                      <button type="button" disabled={!product.inStock} onClick={() => handleAddToCart(product.id)}
                        aria-label={`افزودن ${product.name} به سبد آزمایشی`}
                        className="rounded bg-energy-green px-3 py-2 text-xs font-medium text-slate-900 disabled:opacity-40">
                        {!product.inStock ? 'در دمو در دسترس نیست' : addedId === product.id ? 'به سبد اضافه شد' : 'افزودن به سبد'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <p role="status" className="sr-only">{addedId ? `${getProduct(addedId).name} به سبد اضافه شد` : ''}</p>
      {linkedOrders.length > 0 && (
        <section aria-label="سوابق آزمایشی کیف پول" className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
          <h2 className="font-semibold text-white">سوابق آزمایشی مرتبط با کیف پول</h2>
          <p className="text-xs text-slate-400">فقط روی این دستگاه؛ بدون اعتبار انرژی. <bdi>{account.slice(0, 6)}…{account.slice(-4)}</bdi></p>
          {linkedOrders.map((order, index) => (
            <div key={index} className="flex flex-wrap justify-between gap-2 border-t border-slate-700 pt-2 text-sm text-slate-300">
              <span>{(order.productIds ?? []).map((id) => getProduct(id)?.name).filter(Boolean).join('، ')}</span>
              <bdi>{formatPrice(order.total)}</bdi>
            </div>
          ))}
        </section>
      )}
      {detailId && <ProductDetailModal productId={detailId} onClose={() => setDetailId(null)} onAddToCart={handleAddToCart} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
