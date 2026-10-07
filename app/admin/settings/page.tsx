export const dynamic = 'force-dynamic';
import React from "react";
import { Settings } from "lucide-react";
import { getSettings } from "@/lib/actions";
import SettingsForm from "../SettingsForm";
import DataResetCard from "./DataResetCard";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-[#6a4b44] flex items-center mb-6">
        <Settings className="ml-3" size={32} />
        הגדרות מערכת
      </h1>
      
      <SettingsForm initialSettings={settings} />
      
      <DataResetCard />
    </div>
  );
}
