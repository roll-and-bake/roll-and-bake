"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ChevronRight, ChevronLeft } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, setIsCartOpen } = useCart();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const images = product.image_url ? product.image_url.split(',') : ['/logo.png'];
  
  const cartItem = items.find(i => i.id === product.id);
  const isInCart = !!cartItem;

  const handleAdd = () => {
    if (isInCart) {
      setIsCartOpen(true);
    } else {
      addToCart({ id: product.id, name: product.name, price: product.price });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#dac8b8]/50 overflow-hidden flex flex-col transition-all duration-300">
      <div className="relative h-56 w-full group">
        <Image 
          src={images[currentImageIdx]} 
          alt={`${product.name} - ${currentImageIdx + 1}`} 
          fill 
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <ChevronRight size={20} />
            </button>
            <button onClick={nextImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIdx ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow text-center">
        <h3 className="text-xl font-bold text-[#6a4b44] mb-3">{product.name}</h3>
        <p className="text-[#b5895e] mb-6 text-sm sm:text-base flex-grow leading-relaxed">
          {product.description}
        </p>
        <div className="mb-4 text-lg font-bold text-[#82220a]">{product.price} ₪</div>
        <button 
          onClick={handleAdd}
          className={`w-full py-3 rounded-xl font-medium transition-colors text-base shadow-sm ${isInCart ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-[#cf6b22] hover:bg-[#b55c1b] text-white'}`}
        >
          {isInCart ? `✓ נוסף ${cartItem.quantity} לעגלה` : 'הוסף לעגלה'}
        </button>
      </div>
    </div>
  );
}
