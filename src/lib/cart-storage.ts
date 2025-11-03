// Simple localStorage-backed guest cart for unauthenticated users
// Stores minimal data needed to sync on login

export type GuestCartItem = {
  menuItemId: string;
  quantity: number;
};

export type GuestCart = {
  items: GuestCartItem[];
  updatedAt: number;
};

const STORAGE_KEY = 'guest_cart_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getGuestCart(): GuestCart {
  if (!isBrowser()) return { items: [], updatedAt: Date.now() };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], updatedAt: Date.now() };
    const parsed = JSON.parse(raw) as GuestCart;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [], updatedAt: Date.now() };
    return parsed;
  } catch {
    return { items: [], updatedAt: Date.now() };
  }
}

export function saveGuestCart(cart: GuestCart): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cart, updatedAt: Date.now() }));
  } catch {
    // ignore storage errors
  }
}

export function clearGuestCart(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function addItemToGuestCart(item: GuestCartItem): GuestCart {
  const cart = getGuestCart();
  const existingIndex = cart.items.findIndex((it) => it.menuItemId === item.menuItemId);
  if (existingIndex >= 0) {
    cart.items[existingIndex] = {
      ...cart.items[existingIndex],
      quantity: (cart.items[existingIndex].quantity || 0) + (item.quantity || 0),
    };
  } else {
    cart.items.push({ menuItemId: item.menuItemId, quantity: item.quantity || 1 });
  }
  const updated = { ...cart, updatedAt: Date.now() };
  saveGuestCart(updated);
  return updated;
}

export function removeItemFromGuestCart(menuItemId: string): GuestCart {
  const cart = getGuestCart();
  const updated: GuestCart = {
    items: cart.items.filter((it) => it.menuItemId !== menuItemId),
    updatedAt: Date.now(),
  };
  saveGuestCart(updated);
  return updated;
}


