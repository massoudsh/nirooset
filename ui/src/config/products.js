/**
 * Green Energy Utilities product catalog. Used by Utilities view and Cart.
 */
export const PRODUCTS = [
  { id: 'pb-1', category: 'power-banks', name: 'پاوربانک قابل‌حمل ۲۰٬۰۰۰ میلی‌آمپرساعت', brand: 'GridFlow', capacity: '20,000 mAh', specs: ['USB-C PD 22.5W', 'Dual USB-A', 'LED display', 'Solar input optional'], price: 49.99, currency: 'USD', rating: 4.6, reviews: 1240, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop', inStock: true },
  { id: 'pb-2', category: 'power-banks', name: 'پاوربانک کوچک ۱۰٬۰۰۰ میلی‌آمپرساعت', brand: 'EcoCharge', capacity: '10,000 mAh', specs: ['USB-C in/out', '18W fast charge', 'Pocket size', 'Airline safe'], price: 29.99, currency: 'USD', rating: 4.5, reviews: 892, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop', inStock: true },
  { id: 'ps-1', category: 'large-power-stations', name: 'ایستگاه برق قابل‌حمل ۱۰۰۰ وات‌ساعت', brand: 'SunCore', capacity: '1000 Wh', specs: ['AC 1000W output', 'Solar input 200W max', '8 outlets', 'Quiet operation'], price: 799.00, currency: 'USD', rating: 4.7, reviews: 456, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', inStock: true },
  { id: 'ps-2', category: 'large-power-stations', name: 'ایستگاه برق حرفه‌ای ۲۰۰۰ وات‌ساعت', brand: 'GridFlow', capacity: '2000 Wh', specs: ['AC 2000W surge', 'Solar 500W input', 'LiFePO4 3000+ cycles', 'Expandable'], price: 1499.00, currency: 'USD', rating: 4.8, reviews: 312, image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=400&h=300&fit=crop', inStock: true },
  { id: 'bat-1', category: 'batteries', name: 'باتری خانگی ۱۰ کیلووات‌ساعت', brand: 'EcoStore', capacity: '10 kWh', specs: ['LiFePO4', '10-year warranty', 'Wall mount', 'Grid hybrid'], price: 4500.00, currency: 'USD', rating: 4.6, reviews: 178, image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop', inStock: true },
  { id: 'bat-2', category: 'batteries', name: 'باتری LiFePO4 با ولتاژ ۱۲ ولت و ظرفیت ۱۰۰ آمپرساعت', brand: 'PowerCell', capacity: '1.2 kWh', specs: ['2000+ cycles', 'BMS included', 'RV / marine', 'No maintenance'], price: 399.00, currency: 'USD', rating: 4.5, reviews: 534, image: 'https://images.unsplash.com/photo-1625628715193-9bc99dd40d0c?w=400&h=300&fit=crop', inStock: true },
  { id: 'sol-1', category: 'solar-generators', name: 'کیت مولد خورشیدی ۵۰۰ وات', brand: 'SunCore', capacity: '512 Wh', specs: ['100W foldable panel', 'AC/DC/USB', 'Carry case', 'Off-grid ready'], price: 449.00, currency: 'USD', rating: 4.4, reviews: 667, image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop', inStock: true },
  { id: 'sol-2', category: 'solar-generators', name: 'سامانه یکپارچه خورشیدی و ذخیره‌ساز ۲ کیلووات‌ساعت', brand: 'GridFlow', capacity: '2048 Wh', specs: ['Built-in 200W solar', 'Quiet inverter', 'Wheeled', 'Emergency backup'], price: 1899.00, currency: 'USD', rating: 4.7, reviews: 223, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', inStock: true },
  { id: 'cell-1', category: 'cells', name: 'سلول لیتیوم‌یون 21700 با ظرفیت ۵۰۰۰ میلی‌آمپرساعت', brand: 'PowerCell', capacity: '18 Wh/cell', specs: ['High discharge', 'Bulk packs', 'DIY / OEM', 'Tested grade A'], price: 5.99, currency: 'USD', rating: 4.3, reviews: 1204, image: 'https://images.unsplash.com/photo-1625628715193-9bc99dd40d0c?w=400&h=300&fit=crop', inStock: true },
  { id: 'acc-1', category: 'accessories', name: 'پنل خورشیدی قابل‌حمل ۱۰۰ وات', brand: 'SunCore', capacity: '100W', specs: ['Foldable', 'USB + DC', 'Kickstand', 'Water resistant'], price: 199.00, currency: 'USD', rating: 4.5, reviews: 891, image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop', inStock: true },
  { id: 'acc-2', category: 'accessories', name: 'مجموعه کابل و اتصال‌دهنده MC4', brand: 'EcoCharge', capacity: '—', specs: ['10m pair', 'UV resistant', 'Tool-free', '10-year'], price: 34.99, currency: 'USD', rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', inStock: true },
]

export const CATEGORIES = [
  { id: 'all', label: 'همه' },
  { id: 'power-banks', label: 'پاوربانک' },
  { id: 'large-power-stations', label: 'ایستگاه برق' },
  { id: 'batteries', label: 'باتری' },
  { id: 'solar-generators', label: 'مولد خورشیدی' },
  { id: 'cells', label: 'سلول باتری' },
  { id: 'accessories', label: 'لوازم جانبی' },
]

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort().map((id) => ({ id, label: id }))

// Charge (Ah/mAh) needs voltage; panel output (W) is not stored energy.
export function parseCapacity(capacity) {
  const match = String(capacity ?? '').replace(/,/g, '').trim().match(/^(\d+(?:\.\d+)?)\s*(kWh|Wh)$/i)
  if (!match) return null
  const wh = Number(match[1]) * (match[2].toLowerCase() === 'kwh' ? 1000 : 1)
  return Number.isFinite(wh) && wh > 0 ? wh : null
}

export function filterProducts(products, filters) {
  const list = products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) return false
    if (filters.brand !== 'all' && product.brand !== filters.brand) return false
    if (filters.priceMin != null && product.price < filters.priceMin) return false
    if (filters.priceMax != null && product.price > filters.priceMax) return false
    if (filters.capacityMin != null || filters.capacityMax != null) {
      const wh = parseCapacity(product.capacity)
      if (wh == null) return false
      if (filters.capacityMin != null && wh < filters.capacityMin) return false
      if (filters.capacityMax != null && wh > filters.capacityMax) return false
    }
    return true
  })
  if (filters.sort === 'price-asc') list.sort((a, b) => a.price - b.price)
  if (filters.sort === 'price-desc') list.sort((a, b) => b.price - a.price)
  if (filters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
  return list
}

export function estimateRuntime(energyWh, loadWatts, usablePercent) {
  if (![energyWh, loadWatts, usablePercent].every((value) => Number.isFinite(value) && value > 0) || usablePercent > 100) return null
  const hours = energyWh * (usablePercent / 100) / loadWatts
  return Number.isFinite(hours) && hours > 0 ? hours : null
}

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id)
}

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('fa-IR', options).format(value)
}

export function formatPrice(price, currency = 'USD') {
  return formatNumber(price, { style: 'currency', currency, currencyDisplay: 'code' })
}

export const SORT_OPTIONS = [
  { id: 'price-asc', label: 'قیمت: کم به زیاد' },
  { id: 'price-desc', label: 'قیمت: زیاد به کم' },
  { id: 'name', label: 'نام محصول' },
]
