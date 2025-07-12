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
import { Hash, DollarSign } from "lucide-react";
import { BillConfig, BillGenerator } from "@/lib/billGenerator";

interface InvoiceUnitsSettingsProps {
  config: BillConfig;
  onConfigChange: (field: keyof BillConfig, value: any) => void;
}

export default function InvoiceUnitsSettings({
  config,
  onConfigChange,
}: InvoiceUnitsSettingsProps) {
  return (
    <>
      {/* Invoice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Invoice Settings
          </CardTitle>
          <CardDescription>
            Configure invoice number range and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceStart">Start Invoice #</Label>
              <Input
                id="invoiceStart"
                type="number"
                value={config.invoiceStart}
                onChange={(e) =>
                  onConfigChange("invoiceStart", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="invoiceEnd">End Invoice #</Label>
              <Input
                id="invoiceEnd"
                type="number"
                value={config.invoiceEnd}
                onChange={(e) =>
                  onConfigChange("invoiceEnd", parseInt(e.target.value))
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="unitPrice">Unit Price (₹)</Label>
            <Input
              id="unitPrice"
              type="number"
              value={config.unitPrice}
              onChange={(e) =>
                onConfigChange("unitPrice", parseInt(e.target.value))
              }
            />
          </div>
          <div className="text-sm text-gray-500">
            Total Bills:{" "}
            {BillGenerator.calculateNumBills(
              config.invoiceStart,
              config.invoiceEnd
            )}
          </div>
        </CardContent>
      </Card>

      {/* Units Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Units Distribution
          </CardTitle>
          <CardDescription>
            Configure unit quantities and distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="totalUnits">Total Units to Sell</Label>
            <Input
              id="totalUnits"
              type="number"
              value={config.totalUnitsToSell}
              onChange={(e) =>
                onConfigChange("totalUnitsToSell", parseInt(e.target.value))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minUnits">Min Units/Bill</Label>
              <Input
                id="minUnits"
                type="number"
                value={config.minUnitsPerBill}
                onChange={(e) =>
                  onConfigChange("minUnitsPerBill", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="maxUnits">Max Units/Bill</Label>
              <Input
                id="maxUnits"
                type="number"
                value={config.maxUnitsPerBill}
                onChange={(e) =>
                  onConfigChange("maxUnitsPerBill", parseInt(e.target.value))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
