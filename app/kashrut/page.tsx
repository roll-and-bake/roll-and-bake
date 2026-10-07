"use client";
import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// סטטי - כדי שלא תצטרך מסד נתונים בשלב זה
const staticImages = [
  { id: 1, url: '/kashrut/cream.jpg', title: 'שמנת Euro (חלב ישראל, כולל פסח)' },
  { id: 2, url: '/kashrut/flour.jpg', title: 'קמח חיטה לבן שטיבל (בד"ץ העדה החרדית)' },
  { id: 3, url: '/kashrut/butter.jpg', title: 'מוצרי חלב תנובה (בד"ץ העדה החרדית)' },
  { id: 5, url: '/kashrut/cinnamon.jpg', title: 'קינמון טחון טהור (בד"ץ העדה החרדית)' },
];

export default function KashrutPage() {
  return (
    <div className="min-h-screen bg-[#fffdfa] font-sans pb-20">
      <header className="bg-[#f0dca4]/20 border-b border-[#dac8b8]/30 pt-6 pb-4 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <Link href="/" className="text-[#6a4b44] hover:bg-[#f0dca4]/40 p-2 rounded-full transition-colors inline-flex">
            <ArrowRight size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#6a4b44] flex-grow text-center ml-10">כשרות חומרי הגלם</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#dac8b8]/50 p-6 md:p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0dca4]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#cf6b22]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <ShieldCheck size={48} className="mx-auto text-[#cf6b22] mb-4 relative z-10" />
          <h2 className="text-2xl font-bold text-[#6a4b44] mb-3 relative z-10">הסינבונים שלנו מיוצרים באהבה</h2>
          <p className="text-lg text-gray-700 relative z-10 max-w-lg mx-auto">
            אנחנו מקפידים על שימוש בחומרי גלם איכותיים וכשרים למהדרין. 
            להלן תמונות של חומרי הגלם המרכזיים בהם אנחנו משתמשים המדגישות את חותמות הכשרות.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {staticImages.map(img => (
            <div key={img.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-3 text-center border-t border-gray-50">
                <p className="font-medium text-[#6a4b44]">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
