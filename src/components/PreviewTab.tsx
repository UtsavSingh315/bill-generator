"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Package, Loader2 } from "lucide-react";

interface BillItem {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  workHours: number;
  rate: number;
  totalAmount: number;
  billNo?: number; // Add bill number for table display
}

interface PreviewTabProps {
  billData: BillItem[];
  isGenerating: boolean;
  totalWorkHours: number;
  totalAmount: number;
  onGenerateBills: () => void;
  onDownloadSpecificBill?: (index: number) => void; // Add download specific bill option
  onDownloadZip: () => void;
  onDownloadPDF: () => void;
}

export default function PreviewTab({
  billData,
  isGenerating,
  totalWorkHours,
  totalAmount,
  onGenerateBills,
  onDownloadSpecificBill,
  onDownloadZip,
  onDownloadPDF,
}: PreviewTabProps) {
  const hasData = billData.length > 0;

  return (
    <div className="space-y-6">
      {/* Generate Bills Button */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Bills</CardTitle>
          <CardDescription>
            Create bills based on your configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onGenerateBills}
            disabled={isGenerating}
            className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Bills...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Bills
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview and Download Section */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Download</CardTitle>
            <CardDescription>
              Preview your bills or download them in different formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Total Days:</span>
                  <span className="ml-2 font-semibold">{billData.length}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">
                    Total Units:
                  </span>
                  <span className="ml-2 font-semibold">
                    {totalWorkHours.toFixed(1)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-600 font-medium">
                    Total Amount:
                  </span>
                  <span className="ml-2 font-semibold text-green-600">
                    ₹
                    {totalAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={onDownloadZip}
                variant="outline"
                className="flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                Download ZIP
              </Button>

              <Button
                onClick={onDownloadPDF}
                variant="outline"
                className="flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bill Data Preview Table */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>Bill Data Preview</CardTitle>
            <CardDescription>
              Overview of generated bill entries ({billData.length} bills)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Invoice No.
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Day
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Amount
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {billData.map((bill, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium">
                          #{bill.billNo || index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{bill.date}</span>
                          {bill.date === "Invalid Date" && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Invalid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 text-sm">
                          {bill.dayOfWeek}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium">{bill.workHours}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-green-600">
                          ₹{bill.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center space-x-2">
                          {onDownloadSpecificBill && (
                            <Button
                              onClick={() => onDownloadSpecificBill(index)}
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-800">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Total: {billData.length} bills • {totalWorkHours} units
                </span>
                <span className="font-semibold text-green-600">
                  Grand Total: ₹
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
