"use client";
import React, { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function OrderCard({ order, nextStatus, nextLabel, colorClass }: { order: any, nextStatus: string, nextLabel: string, colorClass: string }) {
  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    startTransition(() => {
      updateOrderStatus(order.id, nextStatus);
    });
  };

  const sendWhatsApp = () => {
    const text = `היי ${order.customer_name}, עדכון לגבי הזמנתך מ-Roll & Bake: ההזמנה שלך עכשיו בסטטוס: ${nextStatus}.`;
    window.open(`https://wa.me/972${order.phone.substring(1)}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-3">
      <p className="font-bold text-sm text-[#6a4b44]">{order.customer_name}</p>
      <div className="text-xs text-gray-500 mb-2">
        {order.items.map((item: any) => (
          <div key={item.id}>{item.quantity}x {item.product_name}</div>
        ))}
        {order.delivery_method === 'delivery' && (
          <div className="mt-1 font-medium text-[#cf6b22]">🚚 משלוח: {order.address}</div>
        )}
      </div>
      
      <div className="flex gap-2 mt-3">
        <button 
          onClick={handleNext}
          disabled={isPending}
          className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center font-bold transition-opacity ${colorClass} ${isPending ? 'opacity-50' : 'hover:opacity-80'}`}
        >
          {isPending ? 'מעדכן...' : nextLabel}
          <ArrowLeft size={12} className="mr-1" />
        </button>
        <button 
          onClick={sendWhatsApp}
          className="bg-green-50 text-green-700 p-1.5 rounded hover:bg-green-100"
          title="וואטסאפ ללקוח"
        >
          <MessageCircle size={16} />
        </button>
      </div>
    </div>
  );
}
