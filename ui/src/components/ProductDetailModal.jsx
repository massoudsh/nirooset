import { getProduct, formatPrice, CATEGORIES } from '../config/products'
import StoreDialog from './StoreDialog'

export default function ProductDetailModal({ productId, onClose, onAddToCart }) {
  const product = productId ? getProduct(productId) : null
  if (!product) return null
  const categoryLabel = CATEGORIES.find((category) => category.id === product.category)?.label ?? product.category

  return (
    <StoreDialog title={product.name} onClose={onClose}>
      <img src={product.image} alt={product.name} className="mb-4 aspect-[4/3] w-full rounded-lg object-cover" />
      <p className="text-sm text-energy-green"><bdi>{product.brand}</bdi></p>
      <p className="mb-2 text-sm text-slate-300">{categoryLabel} · <bdi>{product.capacity}</bdi></p>
      <p className="mb-4 text-sm text-amber-200">محصول آزمایشی است. تصویر، قیمت و مشخصات نمونه‌اند؛ موجودی و ضمانت تأیید نشده‌اند.</p>
      <h3 className="mb-2 font-semibold">مشخصات نمونه سازنده</h3>
      <ul className="mb-6 list-inside list-disc space-y-2 text-sm text-slate-300">
        {product.specs.map((spec) => <li key={spec}><bdi lang="en">{spec}</bdi></li>)}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-4">
        <bdi className="text-xl font-bold">{formatPrice(product.price, product.currency)}</bdi>
        <button type="button" disabled={!product.inStock} onClick={() => { onAddToCart(product.id); onClose() }}
          className="btn-primary px-4 py-2 disabled:opacity-40">
          {product.inStock ? 'افزودن به سبد آزمایشی' : 'در دمو در دسترس نیست'}
        </button>
      </div>
    </StoreDialog>
  )
}
