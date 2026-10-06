"use client";
import React, { useState, useEffect } from "react";
import { Package, Plus, Minus, CheckCircle2 } from "lucide-react";
import { CartItem, Bundle } from "@/context/CartContext";

type Box = {
  id: string;
  capacity: number;
  name: string;
  items: Record<number, number>; // productId -> quantity
};

export default function PackagingSelector({ 
  items, 
  bundles,
  onPackagingComplete
}: { 
  items: CartItem[], 
  bundles: Bundle[],
  onPackagingComplete: (boxes: Box[], isComplete: boolean) => void 
}) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  
  // Calculate unpacked quantities
  const getUnpacked = () => {
    const unpacked: Record<number, number> = {};
    items.forEach(item => unpacked[item.id] = item.quantity);
    
    boxes.forEach(box => {
      Object.entries(box.items).forEach(([productId, qty]) => {
        unpacked[Number(productId)] -= qty;
      });
    });
    return unpacked;
  };

  const unpacked = getUnpacked();
  const remainingTotal = Object.values(unpacked).reduce((a, b) => a + b, 0);
  const isComplete = remainingTotal === 0;

  useEffect(() => {
    onPackagingComplete(boxes, isComplete);
  }, [boxes, isComplete]);

  const addBox = (bundle: Bundle) => {
    const newBox = {
      id: Math.random().toString(36).substr(2, 9),
      capacity: bundle.capacity,
      name: bundle.name,
      items: {}
    };
    setBoxes([...boxes, newBox]);
    setActiveBoxId(newBox.id);
  };

  const addSingleBox = () => {
    const newBox = {
      id: Math.random().toString(36).substr(2, 9),
      capacity: 1,
      name: "מארז בודד",
      items: {}
    };
    setBoxes([...boxes, newBox]);
    setActiveBoxId(newBox.id);
  };

  const removeBox = (boxId: string) => {
    setBoxes(boxes.filter(b => b.id !== boxId));
    if (activeBoxId === boxId) setActiveBoxId(null);
  };

  const addItemToBox = (boxId: string, productId: number) => {
    if (unpacked[productId] <= 0) return;
    
    setBoxes(boxes.map(box => {
      if (box.id !== boxId) return box;
      const currentBoxQty = Object.values(box.items).reduce((a, b) => a + b, 0);
      if (currentBoxQty >= box.capacity) return box; // Box is full
      
      return {
        ...box,
        items: {
          ...box.items,
          [productId]: (box.items[productId] || 0) + 1
        }
      };
    }));
  };

  const removeItemFromBox = (boxId: string, productId: number) => {
    setBoxes(boxes.map(box => {
      if (box.id !== boxId) return box;
      if (!box.items[productId]) return box;
      
      const newItems = { ...box.items };
      newItems[productId] -= 1;
      if (newItems[productId] <= 0) delete newItems[productId];
      
      return { ...box, items: newItems };
    }));
  };

  const getProductName = (id: number) => items.find(i => i.id === id)?.name || "";

  // Hide oversized boxes
  const validBundles = bundles.filter(b => b.capacity <= remainingTotal);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#dac8b8] p-6 mb-8">
      <h2 className="text-xl font-bold text-[#6a4b44] flex items-center mb-4">
        <Package className="ml-2 text-[#cf6b22]" /> בחירת מארזים לחלוקה
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        יש לך סה"כ <strong>{totalQuantity}</strong> סינבונים. בחר מארזים ומלא אותם בטעמים שבחרת! 
      </p>

      {/* אזור הפריטים שטרם נארזו */}
      <div className="bg-[#f0dca4]/20 p-4 rounded-xl mb-6 border border-[#dac8b8]/50">
        <h3 className="font-bold text-[#82220a] mb-3">סינבונים שממתינים לאריזה: {remainingTotal}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map(item => unpacked[item.id] > 0 ? (
            <div key={item.id} className="bg-white px-3 py-2 rounded-lg border shadow-sm text-sm font-medium flex items-center gap-2">
              <span>{item.name}</span>
              <span className="bg-[#cf6b22] text-white px-2 py-0.5 rounded-full text-xs">{unpacked[item.id]}</span>
            </div>
          ) : null)}
          {remainingTotal === 0 && (
            <span className="text-green-600 font-bold flex items-center text-sm">
              <CheckCircle2 className="mr-1" size={16} /> הכל נארז!
            </span>
          )}
        </div>
      </div>

      {/* הוספת מארזים */}
      {remainingTotal > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3">הוסף מארז ריק:</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={addSingleBox} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + מארז בודד (1)
            </button>
            {validBundles.sort((a,b) => a.capacity - b.capacity).map(bundle => (
              <button 
                key={bundle.id} 
                onClick={() => addBox(bundle)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                + {bundle.name} ({bundle.capacity})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* קופסאות קיימות */}
      <div className="space-y-4">
        {boxes.map((box, boxIndex) => {
          const boxQty = Object.values(box.items).reduce((a, b) => a + b, 0);
          const isFull = boxQty === box.capacity;
          const isActive = activeBoxId === box.id;

          return (
            <div 
              key={box.id} 
              className={`border-2 rounded-xl p-4 transition-all ${isActive ? 'border-[#cf6b22] bg-[#cf6b22]/5 shadow-md' : 'border-gray-200 bg-gray-50'}`}
              onClick={() => setActiveBoxId(box.id)}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-[#6a4b44]">
                  מארז {boxIndex + 1}: {box.name} <span className="text-sm font-normal text-gray-500">({boxQty}/{box.capacity})</span>
                </h4>
                <button onClick={(e) => { e.stopPropagation(); removeBox(box.id); }} className="text-red-500 hover:text-red-700 text-sm">
                  מחק מארז
                </button>
              </div>

              {/* כפתורי הוספה מהירים כשמארז פעיל */}
              {isActive && !isFull && remainingTotal > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
                  <span className="text-xs text-gray-500 w-full">לחץ על טעם כדי להכניס למארז:</span>
                  {items.map(item => unpacked[item.id] > 0 ? (
                    <button 
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); addItemToBox(box.id, item.id); }}
                      className="bg-white border border-[#cf6b22] text-[#cf6b22] hover:bg-[#cf6b22] hover:text-white px-2 py-1 rounded-md text-xs transition-colors"
                    >
                      + {item.name}
                    </button>
                  ) : null)}
                </div>
              )}

              {/* תכולת המארז */}
              <div className="space-y-2">
                {Object.entries(box.items).map(([productId, qty]) => (
                  <div key={productId} className="flex justify-between items-center bg-white px-3 py-2 rounded border text-sm">
                    <span>{getProductName(Number(productId))}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{qty} יח'</span>
                      <button onClick={(e) => { e.stopPropagation(); removeItemFromBox(box.id, Number(productId)); }} className="text-gray-400 hover:text-red-500">
                        <Minus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {boxQty === 0 && <div className="text-gray-400 text-sm italic text-center py-2">המארז ריק. לחץ עליו כדי להוסיף טעמים.</div>}
              </div>
            </div>
          );
        })}
      </div>

      {boxes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Package size={48} className="mx-auto mb-2 opacity-20" />
          <p>לא הוספת מארזים עדיין. הוסף מארזים מהרשימה למעלה.</p>
        </div>
      )}
    </div>
  );
}
