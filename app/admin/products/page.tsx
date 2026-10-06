import React from "react";
import { Package, Percent } from "lucide-react";
import { getProducts, getBundles, getDiscountTiers } from "@/lib/actions";
import ProductRow from "./ProductRow";
import AddProductModal from "./AddProductModal";
import BundleRow from "./BundleRow";
import AddBundleModal from "./AddBundleModal";
import DiscountTierRow from "./DiscountTierRow";
import AddDiscountTierModal from "./AddDiscountTierModal";

export default async function AdminProductsPage() {
  const products = await getProducts();
  const bundles = await getBundles();
  const discountTiers = await getDiscountTiers();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center">
          <Package className="ml-3" size={32} />
          ניהול קטלוג, הנחות ומארזים
        </h1>
        <AddProductModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* טבלת מוצרים */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-[#f0dca4]/20 flex justify-between items-center">
            <h2 className="font-bold text-[#6a4b44]">מוצרים בקטלוג</h2>
          </div>
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-bold">שם המוצר</th>
                <th className="p-4 font-bold">תיאור</th>
                <th className="p-4 font-bold">מחיר</th>
                <th className="p-4 font-bold">סטטוס</th>
                <th className="p-4 font-bold text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {/* ניהול מדרגות הנחה */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="font-bold text-[#6a4b44] flex items-center"><Percent size={18} className="ml-2 text-green-600"/> מדרגות הנחה</h2>
              <AddDiscountTierModal />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              הגדר הנחות המוחלות אוטומטית לפי סך כל יחידות הסינבונים שבעגלה.
            </p>
            <ul className="space-y-3">
              {discountTiers.map(tier => (
                <DiscountTierRow key={tier.id} tier={tier} />
              ))}
              {discountTiers.length === 0 && (
                <li className="text-center text-sm text-gray-400 py-4">אין מדרגות הנחה</li>
              )}
            </ul>
          </div>

          {/* ניהול מארזים (פיזית) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="font-bold text-[#6a4b44] flex items-center"><Package size={18} className="ml-2 text-[#cf6b22]"/> קופסאות אריזה</h2>
              <AddBundleModal />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              הגדר את גדלי הקופסאות (מארזים) לבחירת הלקוח בקופה (לא משפיע על מחיר).
            </p>
            <ul className="space-y-3">
              {bundles.map(bundle => (
                <BundleRow key={bundle.id} bundle={bundle} />
              ))}
              {bundles.length === 0 && (
                <li className="text-center text-sm text-gray-400 py-4">אין מארזים</li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
