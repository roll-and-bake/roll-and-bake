"use client";
import React, { useState, useTransition } from "react";
import { Plus, Upload, Camera } from "lucide-react";
import { addExpense, uploadImage } from "@/lib/actions";

export default function ExpenseForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    category: "חומרי גלם",
    amount: ""
  });
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Client-side image compression to prevent Out of Memory errors on mobile
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          }, "image/jpeg", 0.6); // 60% quality compression
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress file to prevent memory crash
      const compressedFile = await compressImage(file);
      const uploadData = new FormData();
      uploadData.append("file", compressedFile);
      const imageUrl = await uploadImage(uploadData);
      setReceiptUrl(imageUrl);
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאת התמונה. אם האפליקציה קורסת מצילום - נסה לצלם קודם למכשיר ורק אז לבחור את התמונה מהגלריה.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier || !formData.amount) return;
    
    startTransition(() => {
      addExpense({
        ...formData,
        amount: Number(formData.amount),
        receipt_image_url: receiptUrl
      });
      setIsOpen(false);
      setFormData({ ...formData, supplier: "", amount: "" });
      setReceiptUrl(null);
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white p-6 rounded-2xl shadow-sm border border-[#dac8b8] flex flex-col items-center justify-center border-dashed border-2 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="bg-[#f0dca4]/40 p-4 rounded-full text-[#cf6b22] mb-3">
          <Upload size={32} />
        </div>
        <h3 className="font-bold text-[#6a4b44] mb-1">הזנת הוצאה חדשה וצילום קבלה</h3>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-[#dac8b8]">
      <h3 className="font-bold text-[#6a4b44] mb-4">הוספת הוצאה חדשה</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">תאריך</label>
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">ספק / חנות</label>
          <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="למשל: סופרמרקט" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">קטגוריה</label>
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-lg">
            <option>חומרי גלם</option>
            <option>אריזות ומיתוג</option>
            <option>חשמל ומיסים</option>
            <option>שיווק</option>
            <option>אחר</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">סכום (₪)</label>
          <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 border rounded-lg" required />
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded-xl bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
        <label className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-white text-gray-500 transition-colors">
          <Camera size={24} className="mb-2" />
          <span className="text-sm font-medium text-center">{uploading ? 'מעלה קבלה...' : 'צלם או בחר קבלה מהגלריה'}</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isPending || uploading} />
        </label>
        {receiptUrl && (
          <div className="shrink-0 w-full sm:w-24 h-24 relative rounded-lg overflow-hidden border shadow-sm mt-4 sm:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptUrl} alt="קבלה" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isPending || uploading} className="bg-[#cf6b22] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b55c1b] flex items-center disabled:opacity-50">
          {isPending ? "שומר..." : <><Plus size={18} className="ml-1" /> הוסף הוצאה וקבלה</>}
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200">
          ביטול
        </button>
      </div>
    </form>
  );
}
