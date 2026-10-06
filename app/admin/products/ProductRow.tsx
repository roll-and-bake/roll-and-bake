"use client";
import React, { useState, useTransition } from "react";
import { Edit, Save, Trash2, CheckCircle, XCircle, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { toggleProductActive, updateProductDetails, deleteProduct, uploadImage } from "@/lib/actions";

export default function ProductRow({ product }: { product: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.image_url ? product.image_url.split(',') : []
  });
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      toggleProductActive(product.id, product.active);
    });
  };

  const handleSave = () => {
    startTransition(() => {
      updateProductDetails(product.id, formData.name, formData.description, formData.price, formData.images.join(','));
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את "${product.name}"?`)) {
      startTransition(() => {
        deleteProduct(product.id);
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const imageUrl = await uploadImage(uploadData);
        setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
      } catch (err) {
        console.error(err);
        alert("שגיאה בהעלאת התמונה.");
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const firstImage = formData.images[0] || '/logo.png';

  return (
    <tr className={`transition-colors ${product.active === 0 ? 'bg-gray-50 opacity-60' : 'hover:bg-slate-50'}`}>
      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full">
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-1 border rounded"
              placeholder="שם המוצר"
            />
            <div className="flex flex-wrap gap-2 mt-2 border-t pt-2">
              {formData.images.map((img: string, idx: number) => (
                <div key={idx} className="relative w-12 h-12 rounded border overflow-hidden">
                  <Image src={img} alt="Thumb" fill className="object-cover" />
                  <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500/80 text-white rounded-bl p-0.5 hover:bg-red-600">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-12 h-12 flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:bg-gray-50 text-gray-400">
                <UploadCloud size={16} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isPending} />
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border shadow-sm shrink-0">
              <Image src={firstImage} alt={product.name} fill className="object-cover" />
            </div>
            {product.name}
          </>
        )}
      </td>
      <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
        {isEditing ? (
          <input 
            type="text" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-1 border rounded"
          />
        ) : (
          product.description
        )}
      </td>
      <td className="p-4 text-[#82220a] font-bold">
        {isEditing ? (
          <input 
            type="number" 
            value={formData.price} 
            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            className="w-16 p-1 border rounded"
          />
        ) : (
          `${product.price} ₪`
        )}
      </td>
      <td className="p-4 cursor-pointer" onClick={handleToggle}>
        {product.active === 1 ? (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center w-fit gap-1">
            <CheckCircle size={12} /> פעיל
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center w-fit gap-1">
            <XCircle size={12} /> מוסתר
          </span>
        )}
      </td>
      <td className="p-4 flex justify-center space-x-2 space-x-reverse">
        {isEditing ? (
          <button onClick={handleSave} disabled={isPending} className="text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"><Save size={16} /></button>
        ) : (
          <button onClick={() => setIsEditing(true)} disabled={isPending} className="text-[#cf6b22] p-2 hover:bg-[#f0dca4]/30 rounded-lg transition-colors"><Edit size={16} /></button>
        )}
        <button onClick={handleDelete} disabled={isPending} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
      </td>
    </tr>
  );
}
