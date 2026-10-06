"use client";
import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FloatingCartButton() {
  const { items, setIsCartOpen, isCartOpen } = useCart();
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (totalItems === 0 || isCartOpen) return null;

  return (
    <button 
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 left-6 z-40 bg-[#82220a] text-white p-4 rounded-full shadow-lg hover:bg-[#6a1b08] hover:scale-105 transition-all flex items-center justify-center"
      style={{ boxShadow: '0 4px 14px 0 rgba(130, 34, 10, 0.39)' }}
    >
      <div className="relative">
        <ShoppingBag size={28} />
        <span className="absolute -top-2 -right-2 bg-[#cf6b22] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      </div>
    </button>
  );
}
