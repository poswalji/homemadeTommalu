"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
}

interface AppState {
  cart: CartItem[];
  user: User | null;
  isAuthenticated: boolean;
}

interface AppContextType {
  state: AppState;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    cart: [],
    user: null,
    isAuthenticated: false,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tommalu_app_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setState((prev) => ({ ...prev, cart: parsed }));
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem("tommalu_app_cart", JSON.stringify(state.cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [state.cart]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setState((prev) => {
      const existingItem = prev.cart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return {
          ...prev,
          cart: prev.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { ...item, quantity: 1 }],
      };
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.id !== id),
    }));
  }, []);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [] }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  const cartTotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = state.cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setUser,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export const useAppContext = useApp;

