export const dynamic = 'force-dynamic';
import React from "react";
import { TrendingUp, Package, Users, Receipt } from "lucide-react";
import { getDashboardStats, getSettings, getOrders } from "@/lib/actions";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const settings = await getSettings();
  const orders = await getOrders();
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#6a4b44]">סקירה כללית</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">הכנסות כוללות</p>
            <h3 className="text-2xl font-bold text-[#82220a]">₪{stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-[#f0dca4]/40 p-3 rounded-full text-[#cf6b22]">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">הזמנות פתוחות</p>
            <h3 className="text-2xl font-bold text-[#82220a]">{stats.openOrders}</h3>
          </div>
          <div className="bg-[#f0dca4]/40 p-3 rounded-full text-[#cf6b22]">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">לקוחות (ייחודיים)</p>
            <h3 className="text-2xl font-bold text-[#82220a]">{stats.totalCustomers}</h3>
          </div>
          <div className="bg-[#f0dca4]/40 p-3 rounded-full text-[#cf6b22]">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">קבלות YPAY</p>
            <h3 className="text-2xl font-bold text-[#82220a]">-</h3>
          </div>
          <div className="bg-[#f0dca4]/40 p-3 rounded-full text-[#cf6b22]">
            <Receipt size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* פעילויות אחרונות */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-xl font-bold text-[#6a4b44] mb-4">הזמנות אחרונות</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">אין עדיין הזמנות במערכת.</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">{order.customer_name}</span>
                  <span className="text-[#cf6b22] font-bold">{order.total_amount} ₪</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{order.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
