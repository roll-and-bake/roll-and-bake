import Link from "next/link";
import { Settings, LayoutDashboard, Utensils, Receipt, Package, Archive, Calculator, Star, ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#422e20] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-[#f0dca4]">Roll & Bake Admin</h2>
          <p className="text-sm text-white/70 mt-1">פאנל ניהול, ברוך השם</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span>סקירה כללית</span>
          </Link>
          <Link href="/admin/products" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Package size={20} />
            <span>ניהול קטלוג ומארזים</span>
          </Link>
          <Link href="/admin/pipeline" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Utensils size={20} />
            <span>דוח אפייה ומעקב</span>
          </Link>
          <Link href="/admin/expenses" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Receipt size={20} />
            <span>הוצאות מוכרות</span>
          </Link>
          <Link href="/admin/reports" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Calculator size={20} />
            <span>דוחות מס (דו-חודשי)</span>
          </Link>
          <Link href="/admin/feedback" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Star size={20} />
            <span>משוב לקוחות</span>
          </Link>
          <Link href="/admin/kashrut" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <ShieldCheck size={20} />
            <span>ניהול כשרות</span>
          </Link>
          <Link href="/admin/archives" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Archive size={20} />
            <span>ארכיונים ודוחות</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/admin/settings" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors w-full">
            <Settings size={20} />
            <span>הגדרות</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
