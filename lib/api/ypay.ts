// lib/api/ypay.ts

export interface YpayInvoiceData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
}

/**
 * פונקציה להפקת קבלה לעוסק פטור דרך ה-API של YPAY.
 * פונקציה זו נקראת מהשרת בלבד כדי לא לחשוף את ה-Token.
 */
export async function generateExemptDealerReceipt(data: YpayInvoiceData, apiToken: string) {
  try {
    // הדמיה של קריאת API למערכת YPAY להפקת קבלה לפי חוק
    console.log("Preparing to send invoice to YPAY...", {
      endpoint: "https://ypay.co.il/api/v1/invoices",
      type: "קבלה לעוסק פטור",
      customer: data.customerName,
      total: data.totalAmount
    });

    // במציאות כאן יהיה fetch(..., { method: 'POST', headers: { 'Authorization': `Bearer ${apiToken}` } })
    
    // סימולציה של הצלחה מקבלת מספר קבלה רציף ולינק להורדה
    return {
      success: true,
      receiptNumber: `RCP-${Math.floor(Math.random() * 10000)}`,
      pdfUrl: "https://ypay.co.il/receipts/mock-receipt.pdf",
      message: "הקבלה הופקה בהצלחה ונשלחה למייל הלקוח."
    };
  } catch (error) {
    console.error("YPAY Integration Error:", error);
    return {
      success: false,
      error: "שגיאה בתקשורת מול YPAY. אנא בדוק את הגדרות ה-Token בפאנל הניהול."
    };
  }
}
