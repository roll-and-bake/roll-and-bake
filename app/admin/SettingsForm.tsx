"use client";
import React, { useState, useTransition } from "react";
import { updateSetting, uploadImage } from "@/lib/actions";
import { UploadCloud } from "lucide-react";
import Image from "next/image";

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState({
    sumit_company_id: initialSettings.sumit_company_id || "",
    sumit_api_key: initialSettings.sumit_api_key || "",
    store_name: initialSettings.store_name || "Roll & Bake",
    store_info: initialSettings.store_info || 'כשר חלבי למהדרין | כל המוצרים בכשרות בד"ץ',
    store_subtitle: initialSettings.store_subtitle || "סינבונים מושחתים בעבודת יד",
    logo_url: initialSettings.logo_url || "/logo-transparent.png"
  });
  
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(() => {
      updateSetting("sumit_company_id", settings.sumit_company_id);
      updateSetting("sumit_api_key", settings.sumit_api_key);
      updateSetting("store_name", settings.store_name);
      updateSetting("store_info", settings.store_info);
      updateSetting("store_subtitle", settings.store_subtitle);
      updateSetting("logo_url", settings.logo_url);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const imageUrl = await uploadImage(uploadData);
        setSettings(prev => ({ ...prev, logo_url: imageUrl }));
      } catch (err) {
        console.error(err);
        alert("שגיאה בהעלאת התמונה.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#6a4b44] mb-4">הגדרות קבלות אוטומטיות (סאמיט)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מזהה עסק (CompanyID)</label>
            <input 
              type="text" 
              value={settings.sumit_company_id} 
              onChange={(e) => setSettings({...settings, sumit_company_id: e.target.value})} 
              placeholder="לדוגמה: 2422708697"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-left focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" 
              dir="ltr" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מפתח פרטי (API Key)</label>
            <input 
              type="text" 
              value={settings.sumit_api_key} 
              onChange={(e) => setSettings({...settings, sumit_api_key: e.target.value})} 
              placeholder="הדבק את המפתח הפרטי מסאמיט..."
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-left focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" 
              dir="ltr" 
            />
            <p className="text-xs text-gray-500 mt-1">אוטומציה מלאה להנפקת קבלות דיגיטליות עם חתימה.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#6a4b44] mb-4">הגדרות חנות (מיתוג)</h2>
        <div className="space-y-4">
          <div className="flex gap-6 items-center">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
              {settings.logo_url ? (
                <Image src={settings.logo_url} alt="Logo" fill className="object-contain p-2" />
              ) : (
                <UploadCloud className="text-gray-400" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">לוגו החנות</label>
              <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors">
                העלה לוגו חדש
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isPending} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם החנות (כותרת ראשית, אותיות גדולות חום כהה)</label>
            <input 
              type="text" 
              value={settings.store_name} 
              onChange={(e) => setSettings({...settings, store_name: e.target.value})} 
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מידע חשוב (הטקסט הכתום - למשל כשרות)</label>
            <input 
              type="text" 
              value={settings.store_info} 
              onChange={(e) => setSettings({...settings, store_info: e.target.value})} 
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">משפט מחץ (טקסט משני תחתון)</label>
            <input 
              type="text" 
              value={settings.store_subtitle} 
              onChange={(e) => setSettings({...settings, store_subtitle: e.target.value})} 
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" 
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={isPending}
        className="w-full bg-[#cf6b22] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#b55c1b] transition-colors disabled:opacity-50"
      >
        {isPending ? "שומר..." : saved ? "נשמר בהצלחה!" : "שמור את כל ההגדרות"}
      </button>
    </div>
  );
}
