"use client";
import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShoppingBag, AlertCircle, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/actions";
import PackagingSelector from "@/components/store/PackagingSelector";

export default function CheckoutPage() {
  const { items, total, bundles, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  
  const [isPackagingComplete, setIsPackagingComplete] = useState(false);
  const [packagingData, setPackagingData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [paymentRedirect, setPaymentRedirect] = useState<{app: string, phone: string, total: number} | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    deliveryMethod: "pickup",
    address: "",
    receiptPreference: "whatsapp",
    notes: ""
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("rollAndBake_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed, notes: "" }));
      } catch (e) {}
    }
  }, []);

  const merchantPhone = "055-9195456";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg("");
  };

  const fallbackCopy = (text: string) => {
    try {
      // Modern secure context
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS local IP on mobile
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const handlePaymentClick = async (paymentApp: 'bit' | 'paybox') => {
    if (items.length === 0) return setErrorMsg("העגלה ריקה");
    if (!isPackagingComplete) return setErrorMsg("אנא סיים לארוז את כל הסינבונים במארזים (ראה למעלה) לפני המעבר לתשלום.");
    
    const cleanPhone = merchantPhone.replace(/\D/g, '');
    // SYNC COPY: Must happen immediately on click before any await!
    fallbackCopy(cleanPhone);
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    let packagingNotes = "--- פירוט מארזים ---\n";
    packagingData.forEach((box, i) => {
      packagingNotes += `מארז ${i + 1} (${box.name}): `;
      const contents = Object.entries(box.items).map(([id, qty]) => {
        const name = items.find(item => item.id === Number(id))?.name;
        return `${qty}x ${name}`;
      }).join(", ");
      packagingNotes += contents + "\n";
    });
    
    const finalNotes = formData.notes ? `${formData.notes}\n\n${packagingNotes}` : packagingNotes;

    try {
      const res = await createOrder({
        ...formData,
        notes: finalNotes,
        totalAmount: total,
        items: items
      });

      if (res.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("rollAndBake_user", JSON.stringify({
            customerName: formData.customerName,
            phone: formData.phone,
            email: formData.email,
            deliveryMethod: formData.deliveryMethod,
            address: formData.address,
            receiptPreference: formData.receiptPreference
          }));
        }

        setFinalTotal(total);
        clearCart();
        setPaymentRedirect({ app: paymentApp, phone: cleanPhone, total });
        
        // Redirect after a short delay so they can read the copy message
        setTimeout(() => {
          if (paymentApp === 'bit') {
            window.location.href = `https://bitpay.co.il/app/pay?phone=${cleanPhone}&amount=${total}`;
          } else {
            window.location.href = `https://payboxapp.page.link/?link=https://www.payboxapp.com?amount=${total}&phone=${cleanPhone}`;
          }
          // After redirecting, show success screen
          setTimeout(() => setIsSuccess(true), 1000);
        }, 3500);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("אירעה שגיאה בשמירת ההזמנה. אנא נסה שנית.");
      setIsSubmitting(false);
    }
  };

  if (paymentRedirect && !isSuccess) {
    return (
      <div className="min-h-screen bg-[#fffdfa] flex flex-col items-center justify-center p-6 text-center z-50">
        <Loader2 size={64} className="text-[#cf6b22] animate-spin mb-6" />
        <h1 className="text-3xl font-bold text-[#6a4b44] mb-4">
          מעביר אותך לתשלום ב-{paymentRedirect.app === 'bit' ? 'Bit' : 'PayBox'}...
        </h1>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#dac8b8] max-w-sm w-full space-y-4">
          <p className="text-gray-600 font-medium">סכום לתשלום:</p>
          <p className="text-3xl font-bold text-[#82220a]">{paymentRedirect.total} ₪</p>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-sm text-gray-500 mb-2">מספר הטלפון להעברה הועתק ללוח!</p>
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-[#6a4b44]">
              {merchantPhone}
              <Copy size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-sm text-[#b5895e]">
            האפליקציה תיפתח בעוד מספר שניות. אנא אשר את התשלום כדי שנשלים את ההזמנה.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#fffdfa] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 size={80} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-[#6a4b44] mb-4">הזמנתך התקבלה בהצלחה!</h1>
        <p className="text-[#82220a] mb-8 max-w-md">
          ההזמנה נכנסה למערכת והועברה לצוות Roll & Bake.
          במידה ואפליקציית התשלום לא נפתחה, אנא העבר את הסכום ({finalTotal} ₪) למספר {merchantPhone}.
        </p>
        <Link href="/" className="bg-[#cf6b22] hover:bg-[#b55c1b] text-white px-8 py-3 rounded-xl font-bold transition-colors">
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffdfa] flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag size={80} className="text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-[#6a4b44] mb-4">העגלה שלך ריקה</h1>
        <Link href="/" className="bg-[#cf6b22] hover:bg-[#b55c1b] text-white px-8 py-3 rounded-xl font-bold transition-colors">
          חזרה לתפריט
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] pb-24">
      <header className="bg-white p-4 shadow-sm border-b border-[#dac8b8]/30 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <Link href="/" className="text-[#82220a] flex items-center hover:underline">
            <ArrowRight size={20} className="ml-2" /> חזרה לתפריט
          </Link>
          <h1 className="text-xl font-bold text-[#6a4b44] flex-grow text-center ml-10">קופה</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 mt-4 space-y-6">
        
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <PackagingSelector 
          items={items} 
          bundles={bundles} 
          onPackagingComplete={(boxes, isComplete) => {
            setPackagingData(boxes);
            setIsPackagingComplete(isComplete);
            if (isComplete) setErrorMsg("");
          }} 
        />

        <div className="bg-white rounded-2xl shadow-sm border border-[#dac8b8]/50 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[#6a4b44] border-b border-[#dac8b8]/30 pb-3">פרטי הזמנה</h2>
          
          <div className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" placeholder="ישראל ישראלי" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון (לעדכונים)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors text-left" dir="ltr" placeholder="050-1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל (לקבלה)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors text-left" dir="ltr" placeholder="email@example.com" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block font-bold text-[#6a4b44]">שיטת קבלה (יום חמישי)</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex-1 p-4 border rounded-xl cursor-pointer text-center transition-colors ${formData.deliveryMethod === 'pickup' ? 'border-[#cf6b22] bg-[#f0dca4]/20' : 'border-gray-200'}`}>
                  <input type="radio" name="deliveryMethod" value="pickup" className="sr-only" checked={formData.deliveryMethod === 'pickup'} onChange={handleInputChange} />
                  <span className="font-bold text-[#6a4b44] block mb-1">איסוף עצמי</span>
                  <span className="text-sm text-[#b5895e]">מהיישוב נריה</span>
                </label>
                <label className={`flex-1 p-4 border rounded-xl cursor-pointer text-center transition-colors ${formData.deliveryMethod === 'delivery' ? 'border-[#cf6b22] bg-[#f0dca4]/20' : 'border-gray-200'}`}>
                  <input type="radio" name="deliveryMethod" value="delivery" className="sr-only" checked={formData.deliveryMethod === 'delivery'} onChange={handleInputChange} />
                  <span className="font-bold text-[#6a4b44] block mb-1">משלוח עד הבית</span>
                  <span className="text-sm text-[#b5895e]">לאזור גוש טלמונים ומודיעין</span>
                </label>
              </div>
            </div>

            {formData.deliveryMethod === 'delivery' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מלאה למשלוח</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" placeholder="יישוב, רחוב, מספר בית..." />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">איך תרצה לקבל את הקבלה?</label>
              <select name="receiptPreference" value={formData.receiptPreference} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors">
                <option value="whatsapp">שלח לי בווטסאפ</option>
                <option value="email">שלח לי למייל</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערות להזמנה</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors resize-none" rows={2} placeholder="בקשות מיוחדות..."></textarea>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#dac8b8]/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#6a4b44]">תשלום</h2>
            <div className="text-2xl font-bold text-[#82220a]">{total} ₪</div>
          </div>
          
          <p className="text-sm text-[#b5895e] mb-4">
            בחר באחת מהאפליקציות. אנו נפיק עבורך קבלה (עוסק פטור) ונאשר את ההזמנה מיד לאחר קבלת התשלום.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handlePaymentClick('bit')}
              disabled={isSubmitting || !formData.customerName || !formData.phone}
              className="flex-1 bg-[#159a8c] hover:bg-[#12867a] disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center"
            >
              {isSubmitting ? 'מעבד...' : 'לתשלום ב-Bit'}
            </button>
            <button 
              onClick={() => handlePaymentClick('paybox')}
              disabled={isSubmitting || !formData.customerName || !formData.phone}
              className="flex-1 bg-[#000000] hover:bg-gray-800 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center"
            >
              {isSubmitting ? 'מעבד...' : 'לתשלום ב-PayBox'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
