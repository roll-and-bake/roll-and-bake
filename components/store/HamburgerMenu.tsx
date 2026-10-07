"use client";
import React, { useState } from 'react';
import { Menu, X, Info, Star } from 'lucide-react';
import Link from 'next/link';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 p-2 text-[#6a4b44] hover:bg-[#f0dca4]/30 rounded-full transition-colors z-40"
      >
        <Menu size={28} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-[#fffdfa] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#dac8b8]/30 bg-[#f0dca4]/20">
          <h2 className="font-bold text-[#6a4b44] text-lg">תפריט</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-500 hover:text-black rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col space-y-2">
          <Link 
            href="/kashrut" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-[#6a4b44] font-medium transition-colors"
          >
            <Info size={20} className="text-[#cf6b22]" />
            כשרות
          </Link>

          <Link 
            href="/feedback" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-[#6a4b44] font-medium transition-colors"
          >
            <Star size={20} className="text-[#cf6b22]" />
            משוב לקוחות
          </Link>
        </nav>
      </div>
    </>
  );
}
