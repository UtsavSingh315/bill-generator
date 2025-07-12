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
import { Settings, Trash2 } from "lucide-react";

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

interface AdvancedOptionsProps {
  specificDatesToExclude: string[];
  newExcludeDate: string;
  onNewExcludeDateChange: (value: string) => void;
  onAddExcludeDate: () => void;
  onRemoveExcludeDate: (date: string) => void;
}

export default function AdvancedOptions({
  specificDatesToExclude,
  newExcludeDate,
  onNewExcludeDateChange,
  onAddExcludeDate,
  onRemoveExcludeDate,
}: AdvancedOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Advanced Options
        </CardTitle>
        <CardDescription>Additional configuration options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Specific Dates to Exclude */}
        <div className="space-y-3">
          <Label>Exclude Specific Dates</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="excludeDatePicker">Date Picker</Label>
              <Input
                id="excludeDatePicker"
                type="date"
                onChange={(e) => {
                  if (e.target.value) {
                    const ddmmyyyy = convertFromInputDate(e.target.value);
                    onNewExcludeDateChange(ddmmyyyy);
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="excludeDateManual">
                Manual Entry (DD-MM-YYYY)
              </Label>
              <Input
                id="excludeDateManual"
                type="text"
                placeholder="DD-MM-YYYY"
                value={newExcludeDate}
                onChange={(e) => onNewExcludeDateChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onAddExcludeDate();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={onAddExcludeDate}
              variant="outline"
              size="sm"
              disabled={!newExcludeDate}>
              Add Exclusion
            </Button>
          </div>

          {specificDatesToExclude.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">
                Excluded Dates ({specificDatesToExclude.length})
              </Label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {specificDatesToExclude.map((date, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-red-50 border border-red-200 rounded text-sm">
                    <span className="text-red-700">{date}</span>
                    <Button
                      onClick={() => onRemoveExcludeDate(date)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 p-1 h-auto">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
