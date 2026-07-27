/**
 * CartContext.jsx — Shopping cart state management
 *
 * Issue #14: Utilities cart, checkout, and GRID credit linking
 *
 * Features:
 *  - Cart items persisted in localStorage (survive page navigation)
 *  - addItem / removeItem / setQuantity / clearCart operations
 *  - linkOrder: associate a completed order with a wallet address
 *  - getLinkedOrders: retrieve orders for a connected wallet
 *  - cartCount and cartTotal computed values for UI badges
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { getProduct } from '../config/products';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const CART_KEY   = 'nirooset_cart_v1';
const ORDERS_KEY = 'nirooset_linked_orders_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or private-browsing restriction — silently ignore.
  }
}

function loadLinkedOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLinkedOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]             = useState(loadCart);
  const [linkedOrders, setLinkedOrders] = useState(loadLinkedOrders);

  // Persist cart to localStorage on every change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Persist linked orders on every change
  useEffect(() => {
    saveLinkedOrders(linkedOrders);
  }, [linkedOrders]);

  // -------------------------------------------------------------------------
  // Cart operations
  // -------------------------------------------------------------------------

  /** Add `quantity` of a product. If already in cart, increment quantity. */
  const addItem = useCallback((productId, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  /** Remove a product from the cart entirely. */
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  /** Set an explicit quantity. Removes the item if quantity <= 0. */
  const setQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      );
    }
  }, []);

  /** Empty the entire cart. */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // -------------------------------------------------------------------------
  // Computed values
  // -------------------------------------------------------------------------

  /** Total number of individual units in the cart (for badge display). */
  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  /** Total price of all cart items. */
  const cartTotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const product = getProduct(i.productId);
      return sum + (product?.price ?? 0) * i.quantity;
    }, 0);
  }, [items]);

  // -------------------------------------------------------------------------
  // Linked orders (GRID credit association)
  // -------------------------------------------------------------------------

  /**
   * Record a completed order against a wallet address.
   * @param {string} account  - Ethereum address
   * @param {string[]} productIds - Product IDs purchased
   * @param {number} total        - Order total in USD
   */
  const linkOrder = useCallback((account, productIds, total) => {
    if (!account) return;
    const key = account.toLowerCase();
    const entry = {
      productIds,
      total,
      linkedAt: Date.now(),
    };
    setLinkedOrders((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), entry],
    }));
  }, []);

  /**
   * Returns all linked orders for a given wallet address.
   * @param {string} account
   * @returns {Array}
   */
  const getLinkedOrders = useCallback(
    (account) => {
      if (!account) return [];
      return linkedOrders[account.toLowerCase()] ?? [];
    },
    [linkedOrders],
  );

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------

  const value = useMemo(
    () => ({
      items,
      cartCount,
      cartTotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      linkOrder,
      getLinkedOrders,
    }),
    [
      items,
      cartCount,
      cartTotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      linkOrder,
      getLinkedOrders,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook to consume the CartContext. Must be used inside <CartProvider>. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
