import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { act, create } from 'react-test-renderer'
import { CartProvider, useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'
import ProductDetailModal from './ProductDetailModal'
import Utilities from './views/Utilities'

const text = (node) => typeof node === 'string' ? node : (node.children ?? []).map(text).join('')
const button = (view, label) => view.root.findAllByType('button').find((node) => text(node) === label)

function mount(element, { items = [], wallet = { account: null, isConnected: false } } = {}) {
  const storage = new Map([['nirooset_cart_v1', JSON.stringify(items)]])
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
  globalThis.storefrontWallet = wallet
  let context
  const lifecycle = { opened: 0, closed: 0 }
  function Probe() { context = useCart(); return element }
  let view
  act(() => {
    view = create(<CartProvider><Probe /></CartProvider>, {
      createNodeMock: (node) => node.type === 'dialog' ? {
        showModal: () => { lifecycle.opened += 1 },
        close: () => { lifecycle.closed += 1 },
      } : null,
    })
  })
  return { view, get cart() { return context }, lifecycle }
}

const unmount = (fixture) => act(() => fixture.view.unmount())

test('closed and empty guest carts render without missing context fields', () => {
  const closed = mount(<CartDrawer open={false} onClose={() => {}} />)
  assert.equal(closed.view.toJSON(), null)
  unmount(closed)
  const empty = mount(<CartDrawer open onClose={() => {}} />)
  assert.match(text(empty.view.toJSON()), /سبد خرید شما خالی است/)
  assert.equal(empty.view.root.findByType('dialog').props.dir, 'rtl')
  assert.equal(empty.lifecycle.opened, 1)
  assert.equal(button(empty.view, 'ادامه خرید آزمایشی بدون ورود'), undefined)
  unmount(empty)
  assert.equal(empty.lifecycle.closed, 1)
})

test('guest cart supports increment, decrement, removal and persistence', () => {
  const fixture = mount(<CartDrawer open onClose={() => {}} />, { items: [{ productId: 'pb-1', quantity: 1 }] })
  const byLabel = (prefix) => fixture.view.root.findAllByType('button').find((node) => node.props['aria-label']?.startsWith(prefix))
  act(() => byLabel('افزایش تعداد').props.onClick())
  assert.equal(fixture.cart.items[0].quantity, 2)
  assert.equal(fixture.cart.cartTotal, 99.98)
  assert.equal(JSON.parse(localStorage.getItem('nirooset_cart_v1'))[0].quantity, 2)
  act(() => byLabel('کاهش تعداد').props.onClick())
  assert.equal(fixture.cart.items[0].quantity, 1)
  act(() => byLabel('حذف').props.onClick())
  assert.deepEqual(fixture.cart.items, [])
  unmount(fixture)
})

test('guest checkout confirms without authentication, payment or wallet linking', () => {
  let closed = 0
  const fixture = mount(<CartDrawer open onClose={() => { closed += 1 }} />, { items: [{ productId: 'pb-1', quantity: 1 }] })
  act(() => button(fixture.view, 'ادامه خرید آزمایشی بدون ورود').props.onClick())
  assert.match(text(fixture.view.toJSON()), /سفارش واقعی، پرداخت، رزرو موجودی یا ارسال ثبت نمی‌شود/)
  assert.equal(fixture.view.root.findAllByType('input').length, 0)
  assert.doesNotMatch(text(fixture.view.toJSON()), /Google|Verification|Sign in|Send code/)
  act(() => button(fixture.view, 'بازگشت به سبد').props.onClick())
  assert.ok(button(fixture.view, 'ادامه خرید آزمایشی بدون ورود'))
  act(() => button(fixture.view, 'ادامه خرید آزمایشی بدون ورود').props.onClick())
  act(() => button(fixture.view, 'تأیید آزمایشی و پاک‌کردن سبد').props.onClick())
  assert.deepEqual(fixture.cart.items, [])
  assert.equal(closed, 1)
  assert.equal(localStorage.getItem('nirooset_linked_orders_v1'), '{}')
  unmount(fixture)
})

test('wallet-linked demo records require an explicit opt-in', () => {
  for (const optIn of [false, true]) {
    const fixture = mount(<CartDrawer open onClose={() => {}} />, {
      items: [{ productId: 'pb-2', quantity: 2 }], wallet: { account: '0xABC', isConnected: true },
    })
    act(() => button(fixture.view, 'ادامه خرید آزمایشی بدون ورود').props.onClick())
    const checkbox = fixture.view.root.findByType('input')
    assert.equal(checkbox.props.checked, false)
    if (optIn) act(() => checkbox.props.onChange({ target: { checked: true } }))
    act(() => button(fixture.view, 'تأیید آزمایشی و پاک‌کردن سبد').props.onClick())
    const records = fixture.cart.getLinkedOrders('0xABC')
    assert.equal(records.length, optIn ? 1 : 0)
    if (optIn) {
      assert.equal(records[0].total, 59.98)
      assert.deepEqual(records[0].productIds, ['pb-2'])
    }
    unmount(fixture)
  }
})

test('product dialog has native modal lifecycle, close controls and add action', () => {
  let closed = 0
  const added = []
  const fixture = mount(<ProductDetailModal productId="pb-1" onClose={() => { closed += 1 }} onAddToCart={(id) => added.push(id)} />)
  const dialog = fixture.view.root.findByType('dialog')
  assert.ok(dialog.props['aria-labelledby'])
  assert.equal(dialog.props.lang, 'fa')
  let prevented = false
  act(() => dialog.props.onCancel({ preventDefault: () => { prevented = true } }))
  assert.equal(prevented, true)
  assert.equal(closed, 1)
  act(() => button(fixture.view, 'افزودن به سبد آزمایشی').props.onClick())
  assert.deepEqual(added, ['pb-1'])
  assert.equal(closed, 2)
  unmount(fixture)
  assert.equal(fixture.lifecycle.closed, 1)
  const missing = mount(<ProductDetailModal productId="missing" />)
  assert.equal(missing.view.toJSON(), null)
  unmount(missing)
})

test('Persian shop filters, empty/reset states, sorting and runtime controls work', () => {
  const fixture = mount(<Utilities />)
  const { view } = fixture
  assert.equal(view.root.findAllByType('article').length, 11)
  assert.equal(view.toJSON().props.dir, 'rtl')
  assert.match(text(view.toJSON()), /نیازی به کیف پول و ورود ندارید/)
  act(() => button(view, 'باتری').props.onClick())
  assert.equal(view.root.findAllByType('article').length, 2)
  const brand = view.root.findAllByType('select').find((node) => node.props.value === 'all')
  act(() => brand.props.onChange({ target: { value: 'EcoCharge' } }))
  assert.equal(view.root.findAllByType('article').length, 0)
  assert.match(text(view.toJSON()), /محصولی با این فیلترها پیدا نشد/)
  act(() => button(view, 'پاک‌کردن فیلترها').props.onClick())
  assert.equal(view.root.findAllByType('article').length, 11)
  const sort = view.root.findAllByType('select').find((node) => node.props.value === 'price-asc')
  act(() => sort.props.onChange({ target: { value: 'price-desc' } }))
  assert.match(text(view.root.findAllByType('article')[0]), /باتری خانگی/)
  assert.match(text(view.toJSON()), /۳٫۲ ساعت/)
  const load = view.root.findAllByType('input').find((node) => node.props.value === '10')
  act(() => load.props.onChange({ target: { value: '' } }))
  assert.match(text(view.toJSON()), /مقادیر مثبت و درصد حداکثر ۱۰۰ وارد کنید/)
  unmount(fixture)
})

test('shop cart entry, add controls and product details remain usable as guest', () => {
  const fixture = mount(<Utilities />)
  const { view } = fixture
  const add = view.root.findAllByType('button').find((node) => node.props['aria-label']?.startsWith('افزودن'))
  act(() => add.props.onClick())
  assert.equal(fixture.cart.cartCount, 1)
  act(() => button(view, 'سبد خرید (۱)').props.onClick())
  assert.ok(button(view, 'ادامه خرید آزمایشی بدون ورود'))
  act(() => button(view, 'بستن').props.onClick())
  assert.equal(view.root.findAllByType('dialog').length, 0)
  act(() => button(view, 'جزئیات').props.onClick())
  assert.equal(view.root.findAllByType('dialog').length, 1)
  act(() => button(view, 'افزودن به سبد آزمایشی').props.onClick())
  assert.equal(fixture.cart.cartCount, 2)
  assert.equal(view.root.findAllByType('dialog').length, 0)
  unmount(fixture)
})
