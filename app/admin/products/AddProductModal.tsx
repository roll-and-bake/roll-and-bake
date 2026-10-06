"use client";
import React, { useState, useTransition } from "react";
import { Plus, X, UploadCloud } from "lucide-react";
import { addProduct, uploadImage } from "@/lib/actions";

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("חובה לבחור תמונה!");

    startTransition(async () => {
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const imageUrl = await uploadImage(uploadData);
        
        await addProduct(formData.name, formData.description, Number(formData.price), imageUrl);
        
        setIsOpen(false);
        setFormData({ name: "", description: "", price: "" });
        setFile(null);
      } catch (err) {
        console.error(err);
        alert("שגיאה בהעלאת התמונה.");
      }
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#82220a] hover:bg-[#6a1b08] text-white px-4 py-2 rounded-xl flex items-center shadow-md transition-colors font-medium"
      >
        <Plus className="ml-2" size={20} /> הוסף מוצר חדש
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-[#6a4b44] mb-6">מוצר חדש</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם המוצר</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg" rows={3} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר ליחידה (₪)</label>
              <input required type="number" step="0.1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תמונה (מחשב/פלאפון)</label>
              <label className="w-full flex items-center justify-center p-2 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-50">
                <UploadCloud className="mr-2 text-gray-500" size={20} />
                <span className="text-sm text-gray-600 truncate">{file ? file.name : "בחר תמונה..."}</span>
                <input required type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </div>
          <button disabled={isPending} type="submit" className="w-full bg-[#cf6b22] text-white py-3 rounded-xl font-bold hover:bg-[#b55c1b] transition-colors mt-4">
            {isPending ? "שומר ומעלה..." : "שמור מוצר"}
          </button>
        </form>
      </div>
    </div>
  );
}
