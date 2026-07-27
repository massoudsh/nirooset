/**
 * Green Energy Utilities product catalog. Used by Utilities view and Cart.
 */
export const PRODUCTS = [
  { id: 'pb-1', category: 'power-banks', name: 'Portable Power Bank 20,000 mAh', brand: 'GridFlow', capacity: '20,000 mAh', specs: ['USB-C PD 22.5W', 'Dual USB-A', 'LED display', 'Solar input optional'], price: 49.99, currency: 'USD', rating: 4.6, reviews: 1240, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop', inStock: true },
  { id: 'pb-2', category: 'power-banks', name: 'Compact 10,000 mAh Power Bank', brand: 'EcoCharge', capacity: '10,000 mAh', specs: ['USB-C in/out', '18W fast charge', 'Pocket size', 'Airline safe'], price: 29.99, currency: 'USD', rating: 4.5, reviews: 892, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop', inStock: true },
  { id: 'ps-1', category: 'large-power-stations', name: 'Portable Power Station 1000Wh', brand: 'SunCore', capacity: '1000 Wh', specs: ['AC 1000W output', 'Solar input 200W max', '8 outlets', 'Quiet operation'], price: 799.00, currency: 'USD', rating: 4.7, reviews: 456, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', inStock: true },
  { id: 'ps-2', category: 'large-power-stations', name: 'Power Station 2000Wh Pro', brand: 'GridFlow', capacity: '2000 Wh', specs: ['AC 2000W surge', 'Solar 500W input', 'LiFePO4 3000+ cycles', 'Expandable'], price: 1499.00, currency: 'USD', rating: 4.8, reviews: 312, image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=400&h=300&fit=crop', inStock: true },
  { id: 'bat-1', category: 'batteries', name: 'Home Battery 10 kWh', brand: 'EcoStore', capacity: '10 kWh', specs: ['LiFePO4', '10-year warranty', 'Wall mount', 'Grid hybrid'], price: 4500.00, currency: 'USD', rating: 4.6, reviews: 178, image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop', inStock: true },
  { id: 'bat-2', category: 'batteries', name: '12V 100Ah LiFePO4 Battery', brand: 'PowerCell', capacity: '1.2 kWh', specs: ['2000+ cycles', 'BMS included', 'RV / marine', 'No maintenance'], price: 399.00, currency: 'USD', rating: 4.5, reviews: 534, image: 'https://images.unsplash.com/photo-1625628715193-9bc99dd40d0c?w=400&h=300&fit=crop', inStock: true },
  { id: 'sol-1', category: 'solar-generators', name: 'Solar Generator Kit 500W', brand: 'SunCore', capacity: '512 Wh', specs: ['100W foldable panel', 'AC/DC/USB', 'Carry case', 'Off-grid ready'], price: 449.00, currency: 'USD', rating: 4.4, reviews: 667, image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop', inStock: true },
  { id: 'sol-2', category: 'solar-generators', name: 'All-in-One Solar + Storage 2kWh', brand: 'GridFlow', capacity: '2048 Wh', specs: ['Built-in 200W solar', 'Quiet inverter', 'Wheeled', 'Emergency backup'], price: 1899.00, currency: 'USD', rating: 4.7, reviews: 223, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', inStock: true },
  { id: 'cell-1', category: 'cells', name: '21700 Li-ion Cell 5000mAh', brand: 'PowerCell', capacity: '18 Wh/cell', specs: ['High discharge', 'Bulk packs', 'DIY / OEM', 'Tested grade A'], price: 5.99, currency: 'USD', rating: 4.3, reviews: 1204, image: 'https://images.unsplash.com/photo-1625628715193-9bc99dd40d0c?w=400&h=300&fit=crop', inStock: true },
  { id: 'acc-1', category: 'accessories', name: '100W Portable Solar Panel', brand: 'SunCore', capacity: '100W', specs: ['Foldable', 'USB + DC', 'Kickstand', 'Water resistant'], price: 199.00, currency: 'USD', rating: 4.5, reviews: 891, image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop', inStock: true },
  { id: 'acc-2', category: 'accessories', name: 'MC4 Cable Set & Connectors', brand: 'EcoCharge', capacity: '—', specs: ['10m pair', 'UV resistant', 'Tool-free', '10-year'], price: 34.99, currency: 'USD', rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', inStock: true },
]

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'power-banks', label: 'Power Banks' },
  { id: 'large-power-stations', label: 'Power Stations' },
  { id: 'batteries', label: 'Batteries' },
  { id: 'solar-generators', label: 'Solar Generators' },
  { id: 'cells', label: 'Cells' },
  { id: 'accessories', label: 'Accessories' },
]

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort().map((id) => ({ id, label: id }))

/** Parse capacity string to a number for filtering/sorting (mAh, Wh, kWh, W). Returns 0 if unparseable. */
export function parseCapacity(capacity) {
  if (!capacity || capacity === '—') return 0
  const s = String(capacity).replace(/,/g, '').trim()
  const match = s.match(/^([\d.]+)\s*(mAh|Ah|Wh|kWh|W|W\/cell)?$/i)
  if (!match) return 0
  let n = parseFloat(match[1])
  const unit = (match[2] || '').toLowerCase()
  if (unit === 'kwh') n *= 1000
  if (unit === 'ah') n *= 1000 // treat Ah as mAh for comparison
  return n
}

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id)
}

export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

export const SORT_OPTIONS = [
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Rating' },
  { id: 'newest', label: 'Newest' },
]
