"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserX } from "lucide-react";

interface WeekdayExclusionsProps {
  excludedWeekdays: number[];
  onExcludedWeekdaysChange: (weekdays: number[]) => void;
}

export default function WeekdayExclusions({
  excludedWeekdays,
  onExcludedWeekdaysChange,
}: WeekdayExclusionsProps) {
  const weekdays = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  const handleWeekdayToggle = (weekday: number) => {
    const updated = excludedWeekdays.includes(weekday)
      ? excludedWeekdays.filter((d) => d !== weekday)
      : [...excludedWeekdays, weekday];
    onExcludedWeekdaysChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserX className="w-5 h-5 mr-2" />
          Exclude Weekdays
        </CardTitle>
        <CardDescription>
          Select weekdays to exclude from billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Days to Exclude</Label>
          <div className="grid grid-cols-2 gap-2">
            {weekdays.map((day) => (
              <label
                key={day.value}
                className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                  excludedWeekdays.includes(day.value)
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-gray-50 hover:bg-gray-100"
                } border`}>
                <input
                  type="checkbox"
                  checked={excludedWeekdays.includes(day.value)}
                  onChange={() => handleWeekdayToggle(day.value)}
                  className="rounded"
                />
                <span className="text-sm font-medium">{day.label}</span>
              </label>
            ))}
          </div>
          {excludedWeekdays.length > 0 && (
            <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
              <strong>Excluding:</strong>{" "}
              {excludedWeekdays
                .map((d) => weekdays.find((w) => w.value === d)?.label)
                .join(", ")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
