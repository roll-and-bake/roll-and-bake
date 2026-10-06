"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getBundles, getDiscountTiers } from "@/lib/actions";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type Bundle = {
  id: number;
  name: string;
  capacity: number;
  discount_percent?: number; // legacy, no longer used for pricing
};

export type DiscountTier = {
  id: number;
  min_qty: number;
  discount_percent: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: {id: number, name: string, price: number}) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  total: number;
  baseTotal: number;
  discountPercent: number;
  bundles: Bundle[];
  discountTiers: DiscountTier[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);

  useEffect(() => {
    getBundles().then(b => setBundles(b));
    getDiscountTiers().then(t => setDiscountTiers(t));
  }, []);

  const addToCart = (product: {id: number, name: string, price: number}) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ > 0 ? newQ : 0 };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  // Calculate totals and discounts based on quantity
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const baseTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  let appliedDiscount = 0;
  // Sort tiers descending by min_qty to find the highest applicable tier
  const applicableTiers = [...discountTiers].sort((a, b) => b.min_qty - a.min_qty);
  for (const tier of applicableTiers) {
    if (totalItems >= tier.min_qty) {
      appliedDiscount = tier.discount_percent;
      break;
    }
  }

  const total = Math.round(baseTotal * (1 - appliedDiscount / 100));

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        updateQuantity, 
        clearCart, 
        isCartOpen, 
        setIsCartOpen, 
        total,
        baseTotal,
        discountPercent: appliedDiscount,
        bundles,
        discountTiers
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
