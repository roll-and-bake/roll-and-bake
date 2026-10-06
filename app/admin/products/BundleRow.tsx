"use client";
import React, { useState, useTransition } from "react";
import { Edit2, Trash2, X, Check } from "lucide-react";
import { updateBundle, deleteBundle } from "@/lib/actions";

export default function BundleRow({ bundle }: { bundle: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: bundle.name, capacity: bundle.capacity.toString() });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(() => {
      updateBundle(bundle.id, formData.name, Number(formData.capacity), 0);
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    if(confirm("האם למחוק מארז זה?")) {
      startTransition(() => {
        deleteBundle(bundle.id);
      });
    }
  };

  if (isEditing) {
    return (
      <li className="flex flex-col gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex gap-2">
          <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-1/2 p-2 border rounded-lg text-sm" placeholder="שם" />
          <input type="number" value={formData.capacity} onChange={e=>setFormData({...formData, capacity: e.target.value})} className="w-1/2 p-2 border rounded-lg text-sm" placeholder="קיבולת" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={handleSave} disabled={isPending} className="p-2 text-green-600 hover:bg-green-100 rounded-lg"><Check size={18}/></button>
          <button onClick={() => setIsEditing(false)} disabled={isPending} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><X size={18}/></button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-gray-200 transition-colors">
      <div>
        <span className="font-bold text-[#6a4b44]">{bundle.name}</span>
        <div className="text-sm text-gray-500 mt-1">
          <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs ml-2">קיבולת: {bundle.capacity} יח'</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
