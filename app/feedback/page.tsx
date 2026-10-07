"use client";
import React, { useState } from 'react';
import { ArrowRight, Star, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await supabase.from('feedback').insert({
      customer_name: name || 'לקוח/ה אנונימי/ת',
      rating,
      content
    });

    setIsSubmitting(false);
    if (!error) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] font-sans pb-20">
      <header className="bg-[#f0dca4]/20 border-b border-[#dac8b8]/30 pt-6 pb-4 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <Link href="/" className="text-[#6a4b44] hover:bg-[#f0dca4]/40 p-2 rounded-full transition-colors inline-flex">
            <ArrowRight size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#6a4b44] flex-grow text-center ml-10">משוב לקוחות</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 mt-6">
        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">תודה רבה!</h2>
            <p className="text-green-700">המשוב שלך התקבל בהצלחה, זה עוזר לנו להמשיך להשתפר בשבילכם.</p>
            <Link href="/" className="mt-6 inline-block bg-[#cf6b22] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#b55c1b] transition-colors">
              חזרה לחנות
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#dac8b8]/50 p-6">
            <p className="text-center text-[#6a4b44] font-medium mb-8">
              חשוב לנו לדעת מה אתם חושבים על המוצרים שלנו! נשמח לשמוע את דעתכם.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">איך היה?</label>
                <div className="flex justify-center gap-2 flex-row-reverse">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={`${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם (אופציונלי)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors" 
                  placeholder="השם שלך" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">המשוב שלך</label>
                <textarea 
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#cf6b22] outline-none transition-colors resize-none" 
                  rows={4} 
                  placeholder="ספרו לנו מה חשבתם..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full bg-[#6a4b44] hover:bg-[#523933] disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'שולח...' : (
                  <>
                    <Send size={20} />
                    שלח משוב
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
