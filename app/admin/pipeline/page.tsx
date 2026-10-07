export const dynamic = 'force-dynamic';
import React from "react";
import { ChefHat, Printer, MessageCircle } from "lucide-react";
import { getOrders } from "@/lib/actions";
import OrderCard from "./OrderCard"; // A Client component for the order actions

export default async function PipelinePage() {
  const orders = await getOrders();

  // Helper for Baking Report
  const totalBuns = orders
    .filter(o => o.status !== 'בוטל')
    .reduce((acc, order) => {
      let count = 0;
      for (const item of order.items) {
        if (item.product_name.includes("קלאסי")) count += item.quantity;
        if (item.product_name.includes("שוקולד")) count += item.quantity;
        if (item.product_name.includes("פקאן")) count += item.quantity;
      }
      return acc + count;
    }, 0);

  return (
    <div className="space-y-8">
      
      {/* דוח אפייה מרוכז */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#6a4b44] flex items-center">
            <ChefHat className="ml-2" />
            דוח אפייה מרוכז - יום ה'
          </h2>
          <button className="bg-slate-100 hover:bg-slate-200 text-gray-700 p-2 rounded-lg transition-colors flex items-center text-sm font-medium">
            <Printer size={16} className="ml-2" /> הדפס דוח
          </button>
        </div>
        
        <div className="bg-[#f0dca4]/20 p-4 rounded-xl border border-[#cf6b22]/20">
          <p className="text-lg font-medium text-[#82220a] mb-2">סה״כ נדרש לאפייה למחזור הקרוב:</p>
          <ul className="space-y-1 text-gray-700">
            <li><span className="font-bold">סה״כ פריטים (הערכה):</span> {totalBuns} מוצרים</li>
            <li className="text-sm mt-2 text-gray-500">* ניתן לראות פירוט מדויק של הטעמים בהדפסת דוח או בסיכום שבועי מלא.</li>
          </ul>
        </div>
      </section>

      {/* לוח קאנבן */}
      <section>
        <h2 className="text-2xl font-bold text-[#6a4b44] mb-6">לוח מעקב הזמנות (Kanban)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* עמודה 1 */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[300px]">
            <h3 className="font-bold text-gray-700 mb-4 text-center">
              ממתין לאימות תשלום ({orders.filter(o => o.status === "ממתין לאימות").length})
            </h3>
            {orders.filter(o => o.status === "ממתין לאימות").map(order => (
              <OrderCard key={order.id} order={order} nextStatus="שולם - ממתין לאפייה" nextLabel="אשר תשלום" colorClass="bg-gray-100 text-gray-700" />
            ))}
          </div>

          {/* עמודה 2 */}
          <div className="bg-[#f0dca4]/10 p-4 rounded-xl border border-[#dac8b8] min-h-[300px]">
            <h3 className="font-bold text-[#cf6b22] mb-4 text-center">
              שולם - ממתין לאפייה ({orders.filter(o => o.status === "שולם - ממתין לאפייה").length})
            </h3>
            {orders.filter(o => o.status === "שולם - ממתין לאפייה").map(order => (
              <OrderCard key={order.id} order={order} nextStatus="בתנור" nextLabel="הכנס לתנור" colorClass="bg-[#cf6b22] text-white" />
            ))}
          </div>

          {/* עמודה 3 */}
          <div className="bg-[#cf6b22]/10 p-4 rounded-xl border border-[#cf6b22]/30 min-h-[300px]">
            <h3 className="font-bold text-[#82220a] mb-4 text-center">
              בתנור ({orders.filter(o => o.status === "בתנור").length})
            </h3>
            {orders.filter(o => o.status === "בתנור").map(order => (
              <OrderCard key={order.id} order={order} nextStatus="מוכן לאיסוף" nextLabel="העבר למוכן" colorClass="bg-[#82220a] text-white" />
            ))}
          </div>

          {/* עמודה 4 */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 min-h-[300px]">
            <h3 className="font-bold text-green-700 mb-4 text-center">
              מוכן לאיסוף ({orders.filter(o => o.status === "מוכן לאיסוף").length})
            </h3>
            {orders.filter(o => o.status === "מוכן לאיסוף").map(order => (
              <OrderCard key={order.id} order={order} nextStatus="הושלם" nextLabel="נאסף (סיום)" colorClass="bg-green-600 text-white" />
            ))}
          </div>
          
        </div>
      </section>
    </div>
  );
}
