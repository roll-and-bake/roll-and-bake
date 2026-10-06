import React from "react";
import { Archive } from "lucide-react";
import { getArchiveNames, getArchiveData } from "@/lib/actions";
import ArchiveView from "./ArchiveView";

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const archiveNames = await getArchiveNames();
  const selectedName = searchParams.name || archiveNames[0];

  let data = null;
  if (selectedName) {
    data = await getArchiveData(selectedName);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center mb-6">
        <Archive className="ml-3" size={32} />
        ארכיונים ודוחות
      </h1>

      {archiveNames.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
          <Archive size={48} className="mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold mb-2">אין ארכיונים קיימים</h2>
          <p>כאשר תבצע "איפוס נתונים והעברה לארכיון" בהגדרות המערכת, הנתונים יופיעו כאן לפי השם שתיתן להם.</p>
        </div>
      ) : (
        <ArchiveView 
          archiveNames={archiveNames} 
          selectedName={selectedName} 
          data={data} 
        />
      )}
    </div>
  );
}
