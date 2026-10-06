"use client";
import React, { useState, useTransition } from "react";
import { AlertTriangle, Trash2, Archive } from "lucide-react";
import { archiveAllData, deleteAllData } from "@/lib/actions";

export default function DataResetCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1 = initial, 2 = confirm
  const [actionType, setActionType] = useState<"archive" | "delete" | null>(null);
  const [archiveName, setArchiveName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleActionClick = (type: "archive" | "delete") => {
    setActionType(type);
    if (type === "delete") setStep(2);
  };

  const handleArchiveNext = () => {
    if (!archiveName.trim()) {
      alert("נא להזין שם לארכיון (למשל 'שנת מס 2026')");
      return;
    }
    setStep(2);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      if (actionType === "archive") {
        await archiveAllData(archiveName);
      } else if (actionType === "delete") {
        await deleteAllData();
      }
      setIsOpen(false);
      setStep(1);
      setActionType(null);
      setArchiveName("");
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    setStep(1);
    setActionType(null);
    setArchiveName("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 mt-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-red-700 flex items-center">
            <AlertTriangle className="mr-2 ml-2" size={24} />
            איפוס נתונים (אזור מסוכן)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            פעולות למחיקה או ארכיון של כל ההזמנות וההוצאות.
          </p>
        </div>
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200"
          >
            אפשרויות איפוס
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 mt-4 animate-in fade-in zoom-in-95 duration-200">
          {step === 1 ? (
            <div className="space-y-6">
              <p className="font-bold text-red-800 text-lg text-center">בחר את הפעולה הרצויה:</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`flex-1 bg-white border-2 p-4 rounded-xl flex flex-col transition-colors ${actionType === 'archive' ? 'border-orange-500 shadow-md' : 'border-orange-200'}`}>
                  <button 
                    onClick={() => handleActionClick("archive")}
                    className="flex flex-col items-center justify-center text-center group w-full"
                  >
                    <Archive className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-bold text-orange-700 text-lg">העברה לארכיון</span>
                    <span className="text-xs text-gray-600 mt-2">מעביר את הנתונים הנוכחיים לארכיון לשמירה ועיון עתידי</span>
                  </button>
                  
                  {actionType === "archive" && (
                    <div className="mt-4 pt-4 border-t border-orange-100 animate-in fade-in">
                      <label className="block text-sm font-bold text-gray-700 mb-1 text-right">שם הארכיון:</label>
                      <input 
                        type="text" 
                        value={archiveName}
                        onChange={(e) => setArchiveName(e.target.value)}
                        placeholder="למשל: שנת 2026"
                        className="w-full p-2 border border-gray-200 rounded-lg text-right mb-3"
                      />
                      <button 
                        onClick={handleArchiveNext}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold"
                      >
                        המשך
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleActionClick("delete")}
                  className="flex-1 bg-white border-2 border-red-200 hover:border-red-500 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-colors group h-fit"
                >
                  <Trash2 className="text-red-500 mb-2 group-hover:scale-110 transition-transform" size={32} />
                  <span className="font-bold text-red-700 text-lg">מחיקה לצמיתות</span>
                  <span className="text-xs text-gray-600 mt-2">מוחק הכל לחלוטין ללא דרך חזרה</span>
                </button>
              </div>

              <div className="text-center mt-6">
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-800 underline">
                  ביטול וסגירה
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <AlertTriangle size={48} className={`mx-auto ${actionType === 'delete' ? 'text-red-500' : 'text-orange-500'} animate-pulse`} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">האם אתה בטוח?</h3>
                <p className="text-gray-700 max-w-md mx-auto">
                  {actionType === "archive" 
                    ? `פעולה זו תעביר את כל ההזמנות וההוצאות כעת לתוך ארכיון בשם "${archiveName}". הנתונים ייעלמו מהמסכים הראשיים. האם להמשיך?` 
                    : "פעולה זו תמחק לצמיתות את כל ההזמנות וההוצאות! לא ניתן יהיה לשחזר את הנתונים. האם למחוק?"}
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleConfirm}
                  disabled={isPending}
                  className={`${actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50`}
                >
                  {isPending ? "מבצע..." : "כן, אני בטוח"}
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isPending}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
