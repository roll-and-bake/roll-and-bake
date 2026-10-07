'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function ReportDashboard({ rawOrders, rawExpenses }: { rawOrders: any[], rawExpenses: any[] }) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [period, setPeriod] = useState<string>('annual');

  const filteredData = useMemo(() => {
    // Determine the month range based on period
    let startMonth = 0; // 0-indexed (Jan = 0)
    let endMonth = 11;

    if (period !== 'annual') {
      const parts = period.split('-');
      startMonth = parseInt(parts[0]) - 1;
      endMonth = parseInt(parts[1]) - 1;
    }

    const incomeList = rawOrders.filter(o => {
      if (!o.created_at) return false;
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

    return { totalIncome, totalExpenses, profit, incomeList, expenseList };
  }, [rawOrders, rawExpenses, year, period]);

  return (
    <div className="space-y-6">
      {/* Filters */}
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">סה"כ הכנסות (ברוטו)</p>
            <h3 className="text-3xl font-bold text-green-600">₪{filteredData.totalIncome.toLocaleString()}</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-full text-green-600">
            <TrendingUp size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">סה"כ הוצאות מוכרות</p>
            <h3 className="text-3xl font-bold text-red-500">₪{filteredData.totalExpenses.toLocaleString()}</h3>
          </div>
          <div className="bg-red-50 p-4 rounded-full text-red-500">
            <TrendingDown size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">רווח נקי (לפני מס)</p>
            <h3 className={\	ext-3xl font-bold \\}>
              ₪{filteredData.profit.toLocaleString()}
            </h3>
          </div>
          <div className={\p-4 rounded-full \\}>
            <DollarSign size={28} />
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
