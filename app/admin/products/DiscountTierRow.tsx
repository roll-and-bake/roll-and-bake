"use client";
import React, { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDiscountTier } from "@/lib/actions";

export default function DiscountTierRow({ tier }: { tier: any }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if(confirm("האם למחוק מדרגת הנחה זו?")) {
      startTransition(() => {
        deleteDiscountTier(tier.id);
      });
    }
  };

  return (
    <li className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-gray-200 transition-colors">
      <div>
        <span className="font-bold text-[#6a4b44]">החל מ-{tier.min_qty} יח'</span>
        <div className="text-sm text-green-600 font-bold mt-1">
          הנחה: {tier.discount_percent}%
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={handleDelete} disabled={isPending} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
