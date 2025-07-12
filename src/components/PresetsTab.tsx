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
import { Save, Bookmark, Trash2, Upload } from "lucide-react";
import { BillConfig } from "@/lib/billGenerator";

interface Preset {
  name: string;
  config: BillConfig;
  excludedWeekdays: number[];
  createdAt: string;
}

interface PresetsTabProps {
  presets: Preset[];
  newPresetName: string;
  onNewPresetNameChange: (name: string) => void;
  onSavePreset: () => void;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (index: number) => void;
}

export default function PresetsTab({
  presets,
  newPresetName,
  onNewPresetNameChange,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: PresetsTabProps) {
  return (
    <div className="space-y-6">
      {/* Save Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Save Current Configuration
          </CardTitle>
          <CardDescription>
            Save your current settings as a preset for future use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="presetName">Preset Name</Label>
              <Input
                id="presetName"
                type="text"
                placeholder="e.g., Monthly Billing 2024"
                value={newPresetName}
                onChange={(e) => onNewPresetNameChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newPresetName.trim()) {
                    onSavePreset();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={onSavePreset}
                disabled={!newPresetName.trim()}
                variant="default">
                <Save className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bookmark className="w-5 h-5 mr-2" />
            Saved Presets
          </CardTitle>
          <CardDescription>
            Load previously saved configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No presets saved yet</p>
              <p className="text-sm">
                Save your current configuration to create your first preset
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {presets.map((preset, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {preset.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Saved on{" "}
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div className="flex space-x-4">
                        <span>
                          Period: {preset.config.startMonth}/
                          {preset.config.startYear} - {preset.config.endMonth}/
                          {preset.config.endYear}
                        </span>
                        <span>Rate: ₹{preset.config.unitPrice}/unit</span>
                      </div>
                      {preset.excludedWeekdays.length > 0 && (
                        <div>
                          Excludes:{" "}
                          {preset.excludedWeekdays
                            .map(
                              (d) =>
                                [
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ][d]
                            )
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onLoadPreset(preset)}
                      variant="outline"
                      size="sm">
                      <Upload className="w-4 h-4 mr-1" />
                      Load
                    </Button>
                    <Button
                      onClick={() => onDeletePreset(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:border-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
