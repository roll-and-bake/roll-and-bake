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
    let text = "��� " + order.customer_name + ", ����� ���� ������ �-Roll & Bake: ����� ������ ��� ����� �: " + nextStatus + ".";
    
    const receiptMatch = order.notes?.match(/\[���� �����: (https:\/\/[^\]]+)\]/);
    if (receiptMatch && receiptMatch[1] && order.receipt_preference === "whatsapp") {
      text = "��� " + order.customer_name + ", ���� ������ �-Roll & Bake!\n����� ��� ������ ���:\n" + receiptMatch[1];
    }

    const phone = order.phone.startsWith("0") ? "972" + order.phone.substring(1) : order.phone;
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(text), "_blank");
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
          className="bg-green-50 text-green-700 p-1.5 rounded hover:bg-green-100 relative"
          title="������� �����"
        >
          <MessageCircle size={16} />
          {order.receipt_preference === "whatsapp" && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
