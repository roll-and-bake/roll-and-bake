"use client";
import React, { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addDiscountTier } from "@/lib/actions";

export default function AddDiscountTierModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ min_qty: "", discount_percent: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      addDiscountTier(Number(formData.min_qty), Number(formData.discount_percent));
      setIsOpen(false);
      setFormData({ min_qty: "", discount_percent: "" });
    });
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center transition-colors font-medium">
        <Plus size={16} className="ml-1" /> הוסף מדרגת הנחה
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-[#6a4b44] mb-4">הוסף מדרגת הנחה</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm text-gray-700 mb-1">כמות מינימלית בעגלה (ממנה תתחיל ההנחה)</label>
            <input required type="number" min="1" value={formData.min_qty} onChange={e => setFormData({...formData, min_qty: e.target.value})} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">אחוז הנחה (%) שיחול על כל העגלה</label>
            <input required type="number" min="1" max="100" value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: e.target.value})} className="w-full p-2 border rounded-lg" />
          </div>
          <button disabled={isPending} type="submit" className="w-full bg-[#cf6b22] text-white py-2 rounded-xl font-bold hover:bg-[#b55c1b] transition-colors mt-2">
            שמור
          </button>
        </form>
      </div>
    </div>
  );
}
