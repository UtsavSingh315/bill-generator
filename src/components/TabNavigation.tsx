"use client";

import { Settings, FileSpreadsheet, FileText } from "lucide-react";

interface TabNavigationProps {
  activeTab: "config" | "template" | "preview" | "presets";
  billDataLength: number;
  onTabChange: (tab: "config" | "template" | "preview" | "presets") => void;
}

export default function TabNavigation({
  activeTab,
  billDataLength,
  onTabChange,
}: TabNavigationProps) {
  const tabs = [
    { id: "config", label: "Configuration", icon: Settings },
    { id: "template", label: "Template", icon: FileSpreadsheet },
    { id: "presets", label: "Presets", icon: FileText },
    { id: "preview", label: `Preview (${billDataLength})`, icon: FileText },
  ] as const;

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white rounded-lg p-1 shadow-sm border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}>
            <Icon className="w-4 h-4 inline mr-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
