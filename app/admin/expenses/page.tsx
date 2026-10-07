export const dynamic = 'force-dynamic';
import React from "react";
import { Receipt } from "lucide-react";
import { getExpenses } from "@/lib/actions";
import ExpenseForm from "./ExpenseForm";

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center">
          <Receipt className="ml-3" size={32} />
          הוצאות מוכרות
        </h1>
      </div>

      <ExpenseForm />

      {/* טבלת הוצאות */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#f0dca4]/20 text-[#6a4b44]">
              <tr>
                <th className="p-4 font-bold">תאריך</th>
                <th className="p-4 font-bold">ספק</th>
                <th className="p-4 font-bold">קטגוריה</th>
                <th className="p-4 font-bold">סכום</th>
                <th className="p-4 font-bold text-center">קבלה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    אין הוצאות רשומות עדיין.
                  </td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-gray-600">{expense.expense_date}</td>
                    <td className="p-4 font-medium text-gray-800">{expense.supplier}</td>
                    <td className="p-4 text-gray-600">{expense.category}</td>
                    <td className="p-4 font-bold text-[#82220a]">{expense.amount} ₪</td>
                    <td className="p-4 text-center">
                      {expense.receipt_image_url ? (
                        <a href={expense.receipt_image_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-sm">
                          צפה בקבלה
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* סיכום מהיר */}
      <div className="bg-[#82220a] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <p className="text-white/80 text-sm">סה״כ הוצאות רשומות</p>
          <h2 className="text-3xl font-bold">{totalExpenses} ₪</h2>
        </div>
      </div>
    </div>
  );
}
