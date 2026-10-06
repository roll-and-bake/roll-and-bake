"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Calendar, ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

export default function ArchiveView({ 
  archiveNames, 
  selectedName, 
  data 
}: { 
  archiveNames: string[], 
  selectedName: string, 
  data: any 
}) {
  const router = useRouter();
  
  if (!data) return null;

  const orders = data.orders || [];
  const expenses = data.expenses || [];

  const completedOrders = orders.filter((o:any) => o.status !== "בוטל");
  const totalRevenue = completedOrders.reduce((acc: number, o: any) => acc + o.total_amount, 0);
  const totalExpenses = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Selector & Print Button - hidden when printing */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-4">
          <label className="font-bold text-[#6a4b44]">בחר ארכיון:</label>
          <select 
            value={selectedName}
            onChange={(e) => router.push(`/admin/archives?name=${e.target.value}`)}
            className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#cf6b22] bg-gray-50"
          >
            {archiveNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Printer size={18} /> הדפס דוח מרוכז
        </button>
      </div>

      {/* Printable Report Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-10 border-b pb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">דוח סיכום תקופה</h2>
          <p className="text-xl text-gray-600 font-medium">ארכיון: {selectedName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <div className="flex items-center text-green-700 mb-2">
              <ArrowUpRight size={24} className="mr-2 ml-2" />
              <h3 className="text-lg font-bold">סה"כ הכנסות</h3>
            </div>
            <p className="text-4xl font-black text-green-800">{totalRevenue.toLocaleString()} ₪</p>
            <p className="text-sm text-green-600 mt-2">מתוך {completedOrders.length} הזמנות שהושלמו</p>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <div className="flex items-center text-red-700 mb-2">
              <ArrowDownRight size={24} className="mr-2 ml-2" />
              <h3 className="text-lg font-bold">סה"כ הוצאות מוכרות</h3>
            </div>
            <p className="text-4xl font-black text-red-800">{totalExpenses.toLocaleString()} ₪</p>
            <p className="text-sm text-red-600 mt-2">מתוך {expenses.length} רשומות הוצאה</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center text-blue-700 mb-2">
              <TrendingUp size={24} className="mr-2 ml-2" />
              <h3 className="text-lg font-bold">רווח נקי</h3>
            </div>
            <p className="text-4xl font-black text-blue-800">{netProfit.toLocaleString()} ₪</p>
            <p className="text-sm text-blue-600 mt-2">לפני מס</p>
          </div>
        </div>

        {/* Print Styles helper */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .print\\:hidden { display: none !important; }
            .bg-white.p-8.rounded-2xl { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
            .bg-white.p-8.rounded-2xl * { visibility: visible; }
            aside { display: none !important; }
          }
        `}} />
      </div>
    </div>
  );
}
