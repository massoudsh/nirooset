import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS, CATEGORIES, BRANDS, SORT_OPTIONS, parseCapacity, filterProducts, estimateRuntime, formatNumber, formatPrice } from './products.js'

test('shop labels and currency stay Persian without inventing local prices', () => {
  for (const item of [...CATEGORIES, ...SORT_OPTIONS]) assert.match(item.label, /[\u0600-\u06ff]/)
  for (const product of PRODUCTS) assert.match(product.name, /[\u0600-\u06ff]/)
  assert.equal(formatNumber(1234), '۱٬۲۳۴')
  assert.equal(formatNumber(3.2, { maximumFractionDigits: 2 }), '۳٫۲')
  assert.match(formatPrice(49.99), /USD/)
  assert.match(formatPrice(49.99), /۴۹٫۹۹/)
})

const defaults = { category: 'all', brand: 'all', sort: 'price-asc' }

test('catalog IDs and selectable fields are consistent', () => {
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length)
  for (const product of PRODUCTS) {
    assert.ok(CATEGORIES.some((c) => c.id === product.category))
    assert.ok(BRANDS.some((b) => b.id === product.brand))
  }
  assert.deepEqual(SORT_OPTIONS.map((o) => o.id), ['price-asc', 'price-desc', 'name'])
})

test('capacity normalizes only explicit stored energy', () => {
  for (const [input, expected] of [['1.2 kWh', 1200], ['1,000 Wh', 1000], [' 512 wh ', 512]]) {
    assert.equal(parseCapacity(input), expected)
  }
  for (const input of ['20,000 mAh', '100 Ah', '100W', '18 Wh/cell', '0 Wh', '-2 Wh', 'Infinity Wh', '400', '', null, undefined]) {
    assert.equal(parseCapacity(input), null)
  }
})

test('category, brand and inclusive price bounds combine', () => {
  const result = filterProducts(PRODUCTS, { ...defaults, category: 'power-banks', brand: 'GridFlow', priceMin: 49.99, priceMax: 49.99 })
  assert.deepEqual(result.map((p) => p.id), ['pb-1'])
  assert.equal(filterProducts(PRODUCTS, defaults).length, PRODUCTS.length)
  assert.deepEqual(filterProducts(PRODUCTS, { ...defaults, priceMin: 100, priceMax: 10 }), [])
})

test('capacity bounds exclude unknown units even when zero is allowed', () => {
  const result = filterProducts(PRODUCTS, { ...defaults, capacityMin: 1000, capacityMax: 1200 })
  assert.deepEqual(new Set(result.map((p) => p.id)), new Set(['ps-1', 'bat-2']))
  assert.ok(filterProducts(PRODUCTS, { ...defaults, capacityMin: 0 }).every((p) => parseCapacity(p.capacity) != null))
  assert.deepEqual(filterProducts(PRODUCTS, { ...defaults, capacityMax: 100 }), [])
})

test('all supported sort orders work without mutating the catalog', () => {
  const before = structuredClone(PRODUCTS)
  for (const sort of ['price-asc', 'price-desc', 'name']) {
    const result = filterProducts(PRODUCTS, { ...defaults, sort })
    for (let i = 1; i < result.length; i++) {
      if (sort === 'name') assert.ok(result[i - 1].name.localeCompare(result[i].name, 'fa') <= 0)
      else if (sort === 'price-asc') assert.ok(result[i - 1].price <= result[i].price)
      else assert.ok(result[i - 1].price >= result[i].price)
    }
  }
  assert.deepEqual(PRODUCTS, before)
})

test('runtime calculation uses declared usable energy and actual load', () => {
  assert.equal(estimateRuntime(40, 10, 80), 3.2)
  assert.equal(estimateRuntime(100, 25, 100), 4)
  assert.equal(estimateRuntime(100, 25, 50), 2)
})

test('runtime rejects invalid inputs, overflow and underflow', () => {
  for (const invalid of [0, -1, NaN, Infinity, '', null, undefined]) {
    assert.equal(estimateRuntime(invalid, 10, 80), null)
    assert.equal(estimateRuntime(40, invalid, 80), null)
    assert.equal(estimateRuntime(40, 10, invalid), null)
  }
  assert.equal(estimateRuntime(40, 10, 101), null)
  assert.equal(estimateRuntime(Number.MAX_VALUE, Number.MIN_VALUE, 100), null)
  assert.equal(estimateRuntime(Number.MIN_VALUE, Number.MAX_VALUE, 1), null)
})
