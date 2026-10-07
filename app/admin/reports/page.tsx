export const dynamic = 'force-dynamic';
import React from 'react';
import { Calculator } from 'lucide-react';
import { getFinancialReportData } from '@/lib/actions';
import ReportDashboard from './ReportDashboard';

export default async function ReportsPage() {
  const data = await getFinancialReportData();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center mb-6">
        <Calculator className="ml-3" size={32} />
        דוחות מס ופיננסים
      </h1>
      
      <p className="text-gray-600 mb-8">
        מערכת הדיווח מאפשרת לך לפלח את ההכנסות וההוצאות בצורה חכמה (שנתית או דו-חודשית) למטרת תשלומי מקדמות מס הכנסה או מע"מ.
      </p>

      <ReportDashboard rawOrders={data.orders} rawExpenses={data.expenses} />
    </div>
  );
}