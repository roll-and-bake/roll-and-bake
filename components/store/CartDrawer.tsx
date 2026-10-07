"use client";
import React from "react";
import { X, Plus, Minus, ShoppingBag, Gift } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, updateQuantity, isCartOpen, setIsCartOpen, total, baseTotal, discountPercent } = useCart();
  
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const hasDiscount = discountPercent > 0;

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-r border-[#dac8b8]/30">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#dac8b8]/30 bg-[#fffdfa]">
          <h2 className="text-xl font-bold text-[#6a4b44] flex items-center">
            <ShoppingBag className="ml-2" /> עגלת קניות
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-[#82220a] hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* פריטים בעגלה */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p>העגלה שלך ריקה עדיין.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <h3 className="font-bold text-[#6a4b44] text-sm">{item.name}</h3>
                    <p className="text-[#cf6b22] font-medium text-sm flex items-center justify-end" dir="ltr">
                      {item.price} ₪
                    </p>
                  </div>
                  <div className="flex items-center bg-white border border-[#dac8b8] rounded-lg overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1.5 hover:bg-slate-100 text-gray-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 font-medium text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1.5 hover:bg-slate-100 text-gray-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#dac8b8]/30 bg-[#fffdfa] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            
            <div className="flex justify-between items-end mb-4 px-1">
              <span className="text-gray-600 font-medium">סה״כ לתשלום:</span>
              <div className="flex items-center gap-3" dir="ltr">
                {hasDiscount && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                    <span className="text-sm text-gray-400 line-through font-sans">
                      {baseTotal} ₪
                    </span>
                  </div>
                )}
                <span className="text-2xl font-bold text-[#82220a] font-sans">{total} ₪</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-[#82220a] hover:bg-[#6a1b08] text-white text-center py-4 rounded-xl font-bold text-lg transition-colors shadow-md"
            >
              מעבר לקופה
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
