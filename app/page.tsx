export const dynamic = 'force-dynamic';
import { getProducts, getSettings } from "@/lib/actions";
import ProductCard from "@/components/store/ProductCard";
import Image from "next/image";
import FloatingCartButton from "@/components/store/FloatingCartButton";

export default async function Storefront() {
  const products = await getProducts();
  const settings = await getSettings();
  
  const storeName = settings.store_name || "Roll & Bake";
  const storeInfo = settings.store_info || "כשר חלבי למהדרין | כל המוצרים בכשרות בד\"ץ";
  const storeSubtitle = settings.store_subtitle || "סינבונים מושחתים בעבודת יד";
  const logoUrl = settings.logo_url || "/logo-transparent.png";
  
  const activeProducts = products;

  return (
    <main className="flex min-h-screen flex-col bg-[#fffdfa] pb-24 font-sans relative">
      <FloatingCartButton />
      {/* סרגל התראות שבועי (Cutoff Deadline) */}
      <div className="bg-[#82220a] text-white text-center py-2 px-4 text-xs sm:text-sm font-medium shadow-sm">
        בס"ד | הזמנות פתוחות כל השבוע עד יום רביעי | איסוף ומשלוחים ביום חמישי
      </div>

      {/* כותרת מותג וניווט */}
      <header className="flex flex-col items-center pt-10 pb-6 px-4 bg-[#f0dca4]/20 border-b border-[#dac8b8]/30 mb-8">
        <div className="relative w-40 h-40 mb-5">
          <Image
            src={logoUrl}
            alt={storeName}
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#6a4b44] mb-2 text-center tracking-tight">
          {storeName}
        </h1>
        <p className="text-[#cf6b22] font-bold text-sm sm:text-base mb-4 text-center">
          {storeInfo}
        </p>
        <p className="text-[#82220a] text-center max-w-lg text-base sm:text-lg leading-relaxed px-4 font-medium">
          {storeSubtitle}
        </p>
      </header>

      {/* רשימת מוצרים (קטלוג) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activeProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
