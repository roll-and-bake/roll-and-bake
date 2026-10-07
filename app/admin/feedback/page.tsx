export const dynamic = 'force-dynamic';
import React from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default async function FeedbackAdminPage() {
  const { data: feedbackList } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center mb-6">
        <Star className="ml-3" size={32} />
        משוב לקוחות
      </h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-700">תאריך</th>
                <th className="p-4 font-bold text-gray-700">לקוח</th>
                <th className="p-4 font-bold text-gray-700">דירוג</th>
                <th className="p-4 font-bold text-gray-700">תוכן המשוב</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!feedbackList || feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    אין משובים להצגה.
                  </td>
                </tr>
              ) : (
                feedbackList.map((fb: any) => (
                  <tr key={fb.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(fb.created_at).toLocaleString('he-IL')}
                    </td>
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                      {fb.customer_name || 'אנונימי'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < fb.rating ? "fill-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      {fb.content}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
