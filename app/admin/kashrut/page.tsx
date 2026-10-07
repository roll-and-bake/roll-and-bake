"use client";
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/actions';

export default function AdminKashrutPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  async function loadImages() {
    setLoading(true);
    const { data } = await supabase.from('kashrut_images').select('*').order('created_at', { ascending: false });
    if (data) setImages(data);
    setLoading(false);
  }

  useEffect(() => {
    loadImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt("הכנס שם/תיאור קצר לחומר הגלם (למשל: 'קמח חיטה מנופה'):");
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const imageUrl = await uploadImage(formData);
      
      await supabase.from('kashrut_images').insert({
        image_url: imageUrl,
        title: title || ''
      });
      
      await loadImages();
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאת התמונה. ודא שדלי ה-images מוגדר ציבורי ב-Supabase.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('למחוק תמונה זו?')) return;
    await supabase.from('kashrut_images').delete().eq('id', id);
    await loadImages();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center">
          <ShieldCheck className="ml-3" size={32} />
          ניהול כשרות
        </h1>
        
        <div>
          <input 
            type="file" 
            id="kashrut-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <label 
            htmlFor="kashrut-upload"
            className="bg-[#cf6b22] hover:bg-[#b55c1b] text-white px-4 py-2 rounded-lg font-bold flex items-center cursor-pointer transition-colors"
          >
            {isUploading ? <Loader2 size={20} className="ml-2 animate-spin" /> : <Plus size={20} className="ml-2" />}
            הוסף תמונת כשרות
          </label>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-[#cf6b22]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.length === 0 && (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-gray-100 text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
              <p>לא הועלו עדיין תמונות כשרות.</p>
            </div>
          )}
          
          {images.map(img => (
            <div key={img.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group">
              <div className="aspect-[4/3] bg-gray-100">
                <img src={img.image_url} className="w-full h-full object-cover" alt="כשרות" />
              </div>
              <div className="p-4 flex justify-between items-center">
                <p className="font-medium text-gray-800">{img.title || 'ללא תיאור'}</p>
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="מחק תמונה"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
