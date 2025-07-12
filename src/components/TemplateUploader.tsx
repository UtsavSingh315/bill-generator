"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Check, AlertCircle, Eye } from "lucide-react";
import { BillGenerator, ExcelCellMapping } from "@/lib/billGenerator";

interface TemplateUploaderProps {
  onTemplateUpload: (file: File, cellMapping: ExcelCellMapping) => void;
  cellMapping: ExcelCellMapping;
  onCellMappingChange: (mapping: ExcelCellMapping) => void;
}

export default function TemplateUploader({
  onTemplateUpload,
  cellMapping,
  onCellMappingChange,
}: TemplateUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    preview?: any;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous validation
    setValidationResult(null);

    // Basic file validation
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setValidationResult({
        isValid: false,
        errors: [
          "Please select a valid Excel file (.xlsx or .xls). We recommend using .xlsx format for best compatibility.",
        ],
      });
      return;
    }

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setValidationResult({
        isValid: false,
        errors: ["File is too large. Please use a file smaller than 50MB."],
      });
      return;
    }

    // Check if file is actually readable
    try {
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength === 0) {
        setValidationResult({
          isValid: false,
          errors: [
            "The selected file appears to be empty. Please select a valid Excel template.",
          ],
        });
        return;
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [
          "Could not read the selected file. Please ensure it is not corrupted.",
        ],
      });
      return;
    }

    setSelectedFile(file);
  };

  const validateTemplate = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    try {
      console.log(`Starting validation for file: ${selectedFile.name}`);

      const result = await BillGenerator.validateExcelTemplate(
        selectedFile,
        cellMapping
      );
      setValidationResult(result);

      if (result.isValid) {
        console.log("Template validation successful");
        onTemplateUpload(selectedFile, cellMapping);
      } else {
        console.warn("Template validation failed:", result.errors);
      }
    } catch (error) {
      console.error("Template validation error:", error);

      // Enhanced error message based on error type
      let errorMessage = "Unknown error occurred during validation";

      if (error instanceof Error) {
        if (
          error.message.includes("Loading chunk") ||
          error.message.includes("Failed to load ExcelJS")
        ) {
          errorMessage = `Unable to load the Excel processing library. This might be due to:
• Network connectivity issues
• Browser security restrictions
• Ad blockers or extensions blocking the library

Please try:
1. Refreshing the page
2. Disabling ad blockers temporarily
3. Using a different browser (Chrome/Firefox recommended)
4. Checking your internet connection`;
        } else if (error.message.includes("timeout")) {
          errorMessage = `File processing timed out. This might be due to:
• File is too large or complex
• Slow network connection
• Browser performance issues

Please try:
1. Using a smaller/simpler Excel file
2. Refreshing the page and trying again
3. Ensuring good network connectivity`;
        } else if (
          error.message.includes("arrayBuffer") ||
          error.message.includes("buffer")
        ) {
          errorMessage = `File reading error. Please ensure:
• The file is not corrupted
• The file is a valid Excel format (.xlsx recommended)
• The file is not password protected
• You have sufficient browser memory`;
        } else {
          errorMessage = error.message;
        }
      }

      setValidationResult({
        isValid: false,
        errors: [`Validation failed: ${errorMessage}`],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCellMappingChange = (
    field: keyof ExcelCellMapping,
    value: string
  ) => {
    const newMapping = { ...cellMapping, [field]: value };
    onCellMappingChange(newMapping);
    setValidationResult(null); // Reset validation when mapping changes
  };

  const clearFile = () => {
    setSelectedFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Excel Template
          </CardTitle>
          <CardDescription>
            Upload your Excel invoice template file. The app will fill in the
            specified cells with bill data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {selectedFile ? "Change Template" : "Select Excel Template"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
            <p>
              <strong>📋 Requirements:</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Use .xlsx format (recommended) or .xls</li>
              <li>• File should not be password protected</li>
              <li>• Must contain at least one worksheet</li>
              <li>• Template should have some existing content</li>
            </ul>
            <p className="mt-2">
              <strong>💡 Tip:</strong> Save your template in Excel as .xlsx
              format for best compatibility
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button onClick={clearFile} variant="ghost" size="sm">
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cell Mapping Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Excel Cell Mapping</CardTitle>
          <CardDescription>
            Specify which cells in your Excel template should be filled with
            bill data. Use Excel cell references like A1, B2, C3, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceCell">Invoice Number Cell</Label>
              <Input
                id="invoiceCell"
                value={cellMapping.invoiceCell}
                onChange={(e) =>
                  handleCellMappingChange(
                    "invoiceCell",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="e.g., I10"
              />
            </div>
            <div>
              <Label htmlFor="dateCell">Date Cell</Label>
              <Input
                id="dateCell"
                value={cellMapping.dateCell}
                onChange={(e) =>
                  handleCellMappingChange(
                    "dateCell",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="e.g., I9"
              />
            </div>
            <div>
              <Label htmlFor="unitsCell">Units Cell</Label>
              <Input
                id="unitsCell"
                value={cellMapping.unitsCell}
                onChange={(e) =>
                  handleCellMappingChange(
                    "unitsCell",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="e.g., G20"
              />
            </div>
            <div>
              <Label htmlFor="amountWordsCell">Amount in Words Cell</Label>
              <Input
                id="amountWordsCell"
                value={cellMapping.amountWordsCell}
                onChange={(e) =>
                  handleCellMappingChange(
                    "amountWordsCell",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="e.g., D39"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Template Validation</CardTitle>
            <CardDescription>
              Validate your Excel template and cell mapping before generating
              bills.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={validateTemplate}
              disabled={isValidating}
              className="w-full">
              {isValidating ? (
                "Validating..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Validate Template
                </>
              )}
            </Button>

            {validationResult && (
              <div
                className={`p-4 rounded-lg ${
                  validationResult.isValid
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                } border`}>
                <div className="flex items-center mb-2">
                  {validationResult.isValid ? (
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span
                    className={`font-medium ${
                      validationResult.isValid
                        ? "text-green-800"
                        : "text-red-800"
                    }`}>
                    {validationResult.isValid
                      ? "Template is valid!"
                      : "Validation failed"}
                  </span>
                </div>

                {validationResult.errors.length > 0 && (
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}

                {validationResult.isValid && validationResult.preview && (
                  <div className="mt-3">
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="ghost"
                      size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      {showPreview ? "Hide" : "Show"} Cell Preview
                    </Button>

                    {showPreview && (
                      <div className="mt-2 text-xs bg-white p-3 rounded border">
                        {Object.entries(validationResult.preview).map(
                          ([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="flex justify-between py-1">
                              <span className="font-medium">{key}:</span>
                              <span className="text-gray-600">
                                {value.address} (Current:{" "}
                                {String(value.currentValue || "Empty")})
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
