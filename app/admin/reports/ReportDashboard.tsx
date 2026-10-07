'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';

export default function ReportDashboard({ rawOrders, rawExpenses }: { rawOrders: any[], rawExpenses: any[] }) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [period, setPeriod] = useState<string>('annual');
  const [taxRate, setTaxRate] = useState<number>(3); // ברירת מחדל: 3%

  const filteredData = useMemo(() => {
    let startMonth = 0;
    let endMonth = 11;

    if (period !== 'annual') {
      const parts = period.split('-');
      startMonth = parseInt(parts[0]) - 1;
      endMonth = parseInt(parts[1]) - 1;
    }

    const incomeList = rawOrders.filter(o => {
      if (!o.created_at) return false;
      if (o.status === 'בוטל') return false;
      const d = new Date(o.created_at);
      return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
    });

    const expenseList = rawExpenses.filter(e => {
      if (!e.expense_date) return false;
      const d = new Date(e.expense_date);
      return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
    });

    const totalIncome = incomeList.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalExpenses = expenseList.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalIncome - totalExpenses;
    const taxToPay = totalIncome * (taxRate / 100);

    return { totalIncome, totalExpenses, profit, taxToPay, incomeList, expenseList };
  }, [rawOrders, rawExpenses, year, period, taxRate]);

  const exportToExcel = () => {
    let csv = '\uFEFF';
    csv += 'סוג רישום,תאריך,פרטים,סכום (ש"ח)\n';
    
    filteredData.incomeList.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('he-IL');
      csv += `הכנסה,${date},${o.customer_name},${o.total_amount}\n`;
    });
    
    filteredData.expenseList.forEach(e => {
      const date = new Date(e.expense_date).toLocaleDateString('he-IL');
      csv += `הוצאה מוכרת,${date},${e.supplier} - ${e.category},-${e.amount}\n`;
    });
    
    csv += `\nסה"כ הכנסות,,,${filteredData.totalIncome}\n`;
    csv += `סה"כ הוצאות,,,-${filteredData.totalExpenses}\n`;
    csv += `רווח נקי,,,${filteredData.profit}\n`;
    csv += `מקדמות מס (${taxRate}%),,,${filteredData.taxToPay.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${year}_${period}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">שנת מס</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none"
          >
            {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">תקופת דיווח</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none"
          >
            <option value="annual">שנתי (כל השנה)</option>
            <option value="1-2">ינואר - פברואר (1-2)</option>
            <option value="3-4">מרץ - אפריל (3-4)</option>
            <option value="5-6">מאי - יוני (5-6)</option>
            <option value="7-8">יולי - אוגוסט (7-8)</option>
            <option value="9-10">ספטמבר - אוקטובר (9-10)</option>
            <option value="11-12">נובמבר - דצמבר (11-12)</option>
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">אחוז מקדמות למס (%)</label>
          <input 
            type="number"
            min="0" max="100" step="0.1"
            value={taxRate} 
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>

        <button 
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl flex items-center justify-center transition-colors h-[50px] px-6"
        >
          <Download size={20} className="ml-2" />
          הפק אקסל
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">הכנסות (ברוטו)</p>
            <h3 className="text-2xl font-bold text-green-600">₪{filteredData.totalIncome.toLocaleString()}</h3>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">הוצאות מוכרות</p>
            <h3 className="text-2xl font-bold text-red-500">₪{filteredData.totalExpenses.toLocaleString()}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">רווח נקי (לפני מס)</p>
            <h3 className={`text-2xl font-bold ${filteredData.profit >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
              ₪{filteredData.profit.toLocaleString()}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${filteredData.profit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'}`}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-between bg-blue-50/50">
          <div>
            <p className="text-sm text-blue-800 font-bold">מקדמות מס לתשלום</p>
            <h3 className="text-2xl font-bold text-blue-700">
              ₪{filteredData.taxToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#6a4b44] mb-4">פירוט הכנסות ({filteredData.incomeList.length} עסקאות)</h3>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {filteredData.incomeList.length === 0 ? (
              <p className="text-gray-400 text-sm">אין הכנסות בתקופה זו.</p>
            ) : (
              filteredData.incomeList.map(o => (
                <div key={o.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('he-IL')}</p>
                  </div>
                  <span className="text-green-600 font-bold">+₪{o.total_amount}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#6a4b44] mb-4">פירוט הוצאות ({filteredData.expenseList.length} רישומים)</h3>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {filteredData.expenseList.length === 0 ? (
              <p className="text-gray-400 text-sm">אין הוצאות בתקופה זו.</p>
            ) : (
              filteredData.expenseList.map(e => (
                <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium">{e.supplier} - {e.category}</p>
                    <p className="text-xs text-gray-400">{new Date(e.expense_date).toLocaleDateString('he-IL')}</p>
                  </div>
                  <span className="text-red-500 font-bold">-₪{e.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
