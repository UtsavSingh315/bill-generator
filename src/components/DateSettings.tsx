"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { BillConfig, BillGenerator } from "@/lib/billGenerator";

// Helper functions to convert between DD-MM-YYYY and YYYY-MM-DD formats
const convertToInputDate = (ddmmyyyy: string): string => {
  try {
    const [day, month, year] = ddmmyyyy.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } catch {
    return "";
  }
};

const convertFromInputDate = (yyyymmdd: string): string => {
  try {
    const [year, month, day] = yyyymmdd.split("-");
    return `${day}-${month}-${year}`;
  } catch {
    return "";
  }
};

interface DateSettingsProps {
  config: BillConfig;
  dateMode: "month-range" | "exact-range" | "specific-dates";
  exactStartDate: string;
  exactEndDate: string;
  specificDates: string[];
  newDate: string;
  onConfigChange: (field: keyof BillConfig, value: any) => void;
  onDateModeChange: (
    mode: "month-range" | "exact-range" | "specific-dates"
  ) => void;
  onExactDateChange: (field: "start" | "end", value: string) => void;
  onNewDateChange: (value: string) => void;
  onAddSpecificDate: () => void;
  onRemoveSpecificDate: (date: string) => void;
}

export default function DateSettings({
  config,
  dateMode,
  exactStartDate,
  exactEndDate,
  specificDates,
  newDate,
  onConfigChange,
  onDateModeChange,
  onExactDateChange,
  onNewDateChange,
  onAddSpecificDate,
  onRemoveSpecificDate,
}: DateSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Date Selection
        </CardTitle>
        <CardDescription>Configure the billing dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Mode Selection */}
        <div className="space-y-3">
          <Label>Date Selection Mode</Label>
          <div className="flex space-x-2">
            <button
              onClick={() => onDateModeChange("month-range")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateMode === "month-range"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              } border`}>
              Month Range
            </button>
            <button
              onClick={() => onDateModeChange("exact-range")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateMode === "exact-range"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              } border`}>
              Exact Range
            </button>
            <button
              onClick={() => onDateModeChange("specific-dates")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dateMode === "specific-dates"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              } border`}>
              Specific Dates
            </button>
          </div>
        </div>

        {dateMode === "month-range" ? (
          /* Month Range Mode */
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startMonth">Start Month</Label>
                <Input
                  id="startMonth"
                  type="number"
                  min="1"
                  max="12"
                  value={config.startMonth}
                  onChange={(e) =>
                    onConfigChange("startMonth", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="startYear">Start Year</Label>
                <Input
                  id="startYear"
                  type="number"
                  value={config.startYear}
                  onChange={(e) =>
                    onConfigChange("startYear", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endMonth">End Month</Label>
                <Input
                  id="endMonth"
                  type="number"
                  min="1"
                  max="12"
                  value={config.endMonth}
                  onChange={(e) =>
                    onConfigChange("endMonth", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="endYear">End Year</Label>
                <Input
                  id="endYear"
                  type="number"
                  value={config.endYear}
                  onChange={(e) =>
                    onConfigChange("endYear", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </>
        ) : dateMode === "exact-range" ? (
          /* Exact Date Range Mode */
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="exactStartDate">Start Date</Label>
                <Input
                  id="exactStartDate"
                  type="date"
                  value={
                    exactStartDate ? convertToInputDate(exactStartDate) : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const ddmmyyyy = convertFromInputDate(e.target.value);
                      onExactDateChange("start", ddmmyyyy);
                    } else {
                      onExactDateChange("start", "");
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Format: DD-MM-YYYY
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="exactEndDate">End Date</Label>
                <Input
                  id="exactEndDate"
                  type="date"
                  value={exactEndDate ? convertToInputDate(exactEndDate) : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const ddmmyyyy = convertFromInputDate(e.target.value);
                      onExactDateChange("end", ddmmyyyy);
                    } else {
                      onExactDateChange("end", "");
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Format: DD-MM-YYYY
                </div>
              </div>
            </div>
            {exactStartDate && exactEndDate && (
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <strong>Range:</strong> {exactStartDate} to {exactEndDate}
                {(() => {
                  const start = BillGenerator.parseDate(exactStartDate);
                  const end = BillGenerator.parseDate(exactEndDate);
                  if (start && end) {
                    const days =
                      Math.ceil(
                        (end.getTime() - start.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1;
                    return ` (${days} days total)`;
                  }
                  return "";
                })()}
              </div>
            )}
          </div>
        ) : (
          /* Specific Dates Mode */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newDatePicker">Add Date (Date Picker)</Label>
                <Input
                  id="newDatePicker"
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      const ddmmyyyy = convertFromInputDate(e.target.value);
                      onNewDateChange(ddmmyyyy);
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="newDate">Or Enter Manually (DD-MM-YYYY)</Label>
                <Input
                  id="newDate"
                  type="text"
                  placeholder="e.g., 15-03-2025"
                  value={newDate}
                  onChange={(e) => onNewDateChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      onAddSpecificDate();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={onAddSpecificDate}
                variant="outline"
                size="sm"
                disabled={!newDate}>
                Add Date
              </Button>
            </div>

            {specificDates.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Dates ({specificDates.length} total)</Label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 border rounded-md bg-gray-50">
                  {specificDates.map((date, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-1 bg-white rounded text-sm">
                      <span>{date}</span>
                      <Button
                        onClick={() => onRemoveSpecificDate(date)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 p-1 h-auto">
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
