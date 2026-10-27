import test from 'node:test';
import assert from 'node:assert/strict';
import { subscribeWalletEvents } from './wallet-events.js';

const handlers = { accountsChanged() {}, chainChanged() {} };

test('absent wallet leaves the guest app usable', () => {
  const cleanup = subscribeWalletEvents(() => undefined, handlers, assert.fail);
  assert.doesNotThrow(cleanup);
});

test('catches the exact read-only proxy invariant failure from the screenshot', () => {
  const target = {};
  Object.defineProperty(target, 'on', { value() {}, configurable: false, writable: false });
  const provider = new Proxy(target, { get() { return () => {}; } });
  const errors = [];
  const cleanup = subscribeWalletEvents(() => provider, handlers, (error) => errors.push(error));
  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof TypeError);
  assert.doesNotThrow(cleanup);
});

test('handles provider getter failures and missing event methods', () => {
  for (const getProvider of [() => { throw new Error('extension unavailable'); }, () => ({ request() {} })]) {
    const errors = [];
    const cleanup = subscribeWalletEvents(getProvider, handlers, (error) => errors.push(error));
    assert.equal(errors.length, 1);
    assert.doesNotThrow(cleanup);
  }
});

test('preserves method receiver and balances StrictMode setup/cleanup cycles', () => {
  const listeners = new Map();
  const provider = {
    on(event, handler) { assert.equal(this, provider); listeners.set(event, handler); },
    removeListener(event, handler) {
      assert.equal(this, provider);
      assert.equal(listeners.get(event), handler);
      listeners.delete(event);
    },
  };
  for (let cycle = 0; cycle < 2; cycle++) {
    const cleanup = subscribeWalletEvents(() => provider, handlers, assert.fail);
    assert.equal(listeners.size, 2);
    cleanup();
    cleanup();
    assert.equal(listeners.size, 0);
  }
});

test('rolls back partial subscriptions even if registration throws after adding', () => {
  const listeners = new Map();
  const errors = [];
  const provider = {
    on(event, handler) {
      listeners.set(event, handler);
      if (event === 'chainChanged') throw new Error('registration failed');
    },
    removeListener(event) { listeners.delete(event); },
  };
  const cleanup = subscribeWalletEvents(() => provider, handlers, (error) => errors.push(error));
  assert.equal(errors.length, 1);
  assert.equal(listeners.size, 0);
  cleanup();
});

test('cleanup attempts all removals even when the wallet throws', () => {
  const removed = [];
  const errors = [];
  const provider = {
    on() {},
    removeListener(event) { removed.push(event); throw new Error('wallet unavailable'); },
  };
  const cleanup = subscribeWalletEvents(() => provider, handlers, (error) => errors.push(error));
  assert.doesNotThrow(cleanup);
  assert.deepEqual(removed, Object.keys(handlers));
  assert.equal(errors.length, 2);
  cleanup();
  assert.equal(removed.length, 2);
});
