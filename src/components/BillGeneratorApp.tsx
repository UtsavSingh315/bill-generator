"use client";

import { useState, useEffect } from "react";
import {
  BillGenerator,
  BillConfig,
  BillData,
  BILL_PRESETS,
  ExcelCellMapping,
} from "@/lib/billGenerator";
import { useToast } from "@/hooks/use-toast";
import TemplateUploader from "./TemplateUploader";
import TabNavigation from "./TabNavigation";
import InvoiceUnitsSettings from "./InvoiceUnitsSettings";
import DateSettings from "./DateSettings";
import WeekdayExclusions from "./WeekdayExclusions";
import AdvancedOptions from "./AdvancedOptions";
import PreviewTab from "./PreviewTab";
import PresetsTab from "./PresetsTab";

interface Preset {
  name: string;
  config: BillConfig;
  excludedWeekdays: number[];
  createdAt: string;
}

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

export default function BillGeneratorApp() {
  const { toast } = useToast();
  const [config, setConfig] = useState<BillConfig>(BILL_PRESETS[0].config);
  const [billData, setBillData] = useState<BillData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "config" | "template" | "preview" | "presets"
  >("config");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [cellMapping, setCellMapping] = useState<ExcelCellMapping>({
    invoiceCell: "I10",
    dateCell: "I9",
    unitsCell: "G20",
    amountWordsCell: "D39",
  });

  // Date settings state
  const [dateMode, setDateMode] = useState<
    "month-range" | "exact-range" | "specific-dates"
  >("month-range");
  const [exactStartDate, setExactStartDate] = useState("");
  const [exactEndDate, setExactEndDate] = useState("");
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");

  // Advanced options state
  const [specificDatesToExclude, setSpecificDatesToExclude] = useState<
    string[]
  >([]);
  const [newExcludeDate, setNewExcludeDate] = useState("");

  // Presets state
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  // Excel loading status
  const [excelLibraryStatus, setExcelLibraryStatus] = useState<
    "unknown" | "loading" | "loaded" | "error"
  >("unknown");
  const [excelLoadError, setExcelLoadError] = useState<string | null>(null);

  // Test ExcelJS loading on component mount
  useEffect(() => {
    const testExcelJSLoading = async () => {
      if (excelLibraryStatus !== "unknown") return;

      setExcelLibraryStatus("loading");
      try {
        // Try to load ExcelJS to verify it works
        const ExcelJS = (await import("exceljs")).default;
        if (ExcelJS && ExcelJS.Workbook) {
          setExcelLibraryStatus("loaded");
          console.log("✅ ExcelJS library loaded successfully");
        } else {
          throw new Error("ExcelJS loaded but Workbook not available");
        }
      } catch (error) {
        setExcelLibraryStatus("error");
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        setExcelLoadError(errorMsg);
        console.error("❌ ExcelJS loading failed:", errorMsg);

        // Show user-friendly error message
        toast({
          variant: "destructive",
          title: "Excel Library Loading Issue",
          description:
            "There may be issues with Excel file processing. Please refresh the page or try a different browser if you encounter problems.",
        });
      }
    };

    testExcelJSLoading();
  }, [toast, excelLibraryStatus]);

  const handleConfigChange = (field: keyof BillConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);

    // Real-time validation for major constraint violations
    const updatedConfig = { ...config, [field]: value };
    const validation = BillGenerator.validateConfigurationLimits(updatedConfig);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
    }
  };

  const handleTemplateUpload = (file: File, mapping: ExcelCellMapping) => {
    setTemplateFile(file);
    setCellMapping(mapping);
    setConfig((prev) => ({
      ...prev,
      invoiceCell: mapping.invoiceCell,
      dateCell: mapping.dateCell,
      unitsCell: mapping.unitsCell,
      amountWordsCell: mapping.amountWordsCell,
    }));
  };

  const handleDateModeChange = (
    mode: "month-range" | "exact-range" | "specific-dates"
  ) => {
    setDateMode(mode);
    setConfig((prev) => ({
      ...prev,
      dateMode: mode,
      exactStartDate: mode === "exact-range" ? exactStartDate : undefined,
      exactEndDate: mode === "exact-range" ? exactEndDate : undefined,
      specificDates: mode === "specific-dates" ? specificDates : undefined,
    }));
    setValidationErrors([]);
  };

  const handleExactDateChange = (field: "start" | "end", value: string) => {
    if (field === "start") {
      setExactStartDate(value);
      setConfig((prev) => ({ ...prev, exactStartDate: value }));
    } else {
      setExactEndDate(value);
      setConfig((prev) => ({ ...prev, exactEndDate: value }));
    }
  };

  const addSpecificDate = () => {
    if (!newDate) return;

    if (!BillGenerator.validateDateFormat(newDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Date Format",
        description: "Please use DD-MM-YYYY format (e.g., 15-03-2025)",
      });
      return;
    }

    if (specificDates.includes(newDate)) {
      toast({
        variant: "warning",
        title: "Duplicate Date",
        description: "Date already added to the list",
      });
      return;
    }

    const updatedDates = [...specificDates, newDate].sort((a, b) => {
      const dateA = BillGenerator.parseDate(a);
      const dateB = BillGenerator.parseDate(b);
      return dateA && dateB ? dateA.getTime() - dateB.getTime() : 0;
    });

    setSpecificDates(updatedDates);
    setConfig((prev) => ({ ...prev, specificDates: updatedDates }));
    setNewDate("");
  };

  const removeSpecificDate = (dateToRemove: string) => {
    const updatedDates = specificDates.filter((date) => date !== dateToRemove);
    setSpecificDates(updatedDates);
    setConfig((prev) => ({ ...prev, specificDates: updatedDates }));
  };

  const addExcludeDate = () => {
    if (!newExcludeDate) return;

    if (!BillGenerator.validateDateFormat(newExcludeDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Date Format",
        description: "Please use DD-MM-YYYY format",
      });
      return;
    }

    if (specificDatesToExclude.includes(newExcludeDate)) {
      toast({
        variant: "warning",
        title: "Date Already Excluded",
        description: "This date is already in the exclusion list",
      });
      return;
    }

    const updatedDates = [...specificDatesToExclude, newExcludeDate].sort();
    setSpecificDatesToExclude(updatedDates);
    setNewExcludeDate("");
  };

  const removeExcludeDate = (dateToRemove: string) => {
    setSpecificDatesToExclude((prev) =>
      prev.filter((date) => date !== dateToRemove)
    );
  };

  const generateBills = async () => {
    setIsGenerating(true);
    setValidationErrors([]);

    try {
      const validation = BillGenerator.validateConfigurationLimits(config);
      console.log("Validation result:", validation); // Debug log
      if (!validation.isValid) {
        // Show validation errors as toast - one toast per error for better readability
        validation.errors.forEach((error, index) => {
          setTimeout(() => {
            toast({
              variant: "warning",
              title: "Configuration Issues",
              description: error,
            });
          }, index * 100); // Slight delay between toasts
        });
        setValidationErrors(validation.errors);
        return;
      }

      const data = BillGenerator.createBillData(config);
      setBillData(data);
      setActiveTab("preview");

      // Show success toast
      toast({
        variant: "success",
        title: "Bills Generated Successfully",
        description: `Generated ${data.length} bills`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error Generating Bills",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred while generating bills",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSpecificBill = async (index: number) => {
    if (!templateFile || billData.length === 0 || index >= billData.length) {
      toast({
        variant: "warning",
        title: "Missing Requirements",
        description: "Please upload a template and generate bills first",
      });
      return;
    }

    try {
      const selectedBill = billData[index];
      const excelBlob = await BillGenerator.generateSingleExcelBill(
        selectedBill,
        config,
        templateFile
      );

      if (excelBlob) {
        // Create download link
        const url = URL.createObjectURL(excelBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice_${
          selectedBill.billNo || index + 1
        }_${selectedBill.date.replace(/[\/\\:*?"<>|]/g, "-")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        // Show success toast
        toast({
          variant: "success",
          title: "Download Started",
          description: `Successfully initiated download for invoice ${
            selectedBill.billNo || index + 1
          }`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "Failed to generate Excel file for download",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to download specific bill",
      });
    }
  };

  const downloadZip = async () => {
    if (!templateFile || billData.length === 0) {
      toast({
        variant: "warning",
        title: "Missing Requirements",
        description: "Please upload a template and generate bills first",
      });
      return;
    }

    setIsGeneratingZip(true);

    try {
      const zipBlob = await BillGenerator.generateExcelBillsAsZip(
        billData,
        config,
        templateFile
      );
      BillGenerator.downloadZipFile(zipBlob, `invoices_${Date.now()}.zip`);

      // Show success toast
      toast({
        variant: "success",
        title: "Download Complete",
        description: `Successfully downloaded ${billData.length} invoices as ZIP file`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download Error",
        description:
          err instanceof Error ? err.message : "Failed to generate ZIP file",
      });
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const downloadPDF = async () => {
    if (billData.length === 0) {
      toast({
        variant: "warning",
        title: "No Bills Generated",
        description: "Please generate bills first",
      });
      return;
    }

    if (!templateFile) {
      toast({
        variant: "warning",
        title: "Template Required",
        description: "Please upload a template first for PDF generation",
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const zipBlob = await BillGenerator.generatePDFBillsFromExcel(
        billData,
        config,
        templateFile
      );
      BillGenerator.downloadZipFile(zipBlob, `invoices_pdf_${Date.now()}.zip`);

      // Show success toast
      toast({
        variant: "success",
        title: "PDF Download Complete",
        description: `Successfully downloaded ${billData.length} invoices as PDF ZIP file`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "PDF Generation Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to generate PDF ZIP file",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const savePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        variant: "warning",
        title: "Invalid Preset Name",
        description: "Preset name cannot be empty",
      });
      return;
    }

    const preset: Preset = {
      name: newPresetName.trim(),
      config: { ...config },
      excludedWeekdays: [...config.excludeWeekdays],
      createdAt: new Date().toISOString(),
    };

    setSavedPresets((prev) => [...prev, preset]);
    setNewPresetName("");

    // Show success toast
    toast({
      variant: "success",
      title: "Preset Saved",
      description: `Successfully saved preset "${preset.name}"`,
    });
  };

  const loadPreset = (preset: Preset) => {
    setConfig(preset.config);
    setBillData([]);
    setValidationErrors([]);
    setDateMode(preset.config.dateMode || "month-range");
    setSpecificDates(preset.config.specificDates || []);
    setExactStartDate(preset.config.exactStartDate || "");
    setExactEndDate(preset.config.exactEndDate || "");
    setActiveTab("config");

    // Show success toast
    toast({
      variant: "success",
      title: "Preset Loaded",
      description: `Successfully loaded preset "${preset.name}"`,
    });
  };

  const deletePreset = (index: number) => {
    const presetName = savedPresets[index]?.name;
    setSavedPresets((prev) => prev.filter((_, i) => i !== index));

    // Show success toast
    if (presetName) {
      toast({
        variant: "success",
        title: "Preset Deleted",
        description: `Successfully deleted preset "${presetName}"`,
      });
    }
  };

  // Convert BillData to BillItem format for PreviewTab
  const convertToBillItems = (data: BillData[]): BillItem[] => {
    return data.map((bill, index) => {
      // Parse the date properly to avoid "Invalid Date"
      let dayOfWeek = "Unknown";
      let validDate = bill.date;

      try {
        // Try to parse the date if it's in DD-MM-YYYY format
        const parsedDate = BillGenerator.parseDate(bill.date);
        if (parsedDate) {
          dayOfWeek = parsedDate.toLocaleDateString("en-US", {
            weekday: "short",
          });
          validDate = bill.date; // Keep original format
        } else {
          // If parsing fails, try to create a proper date object
          const dateObj = new Date(bill.date);
          if (!isNaN(dateObj.getTime())) {
            dayOfWeek = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
            });
            // Convert to DD-MM-YYYY format
            validDate = `${dateObj.getDate().toString().padStart(2, "0")}-${(
              dateObj.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}-${dateObj.getFullYear()}`;
          }
        }
      } catch (error) {
        console.warn("Date parsing error for:", bill.date, error);
        dayOfWeek = "Invalid";
        validDate = bill.date;
      }

      return {
        date: validDate,
        dayOfWeek: dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        totalHours: bill.units, // Use actual units instead of hardcoded 8
        workHours: bill.units, // Use actual units instead of hardcoded 8
        rate: config.unitPrice,
        totalAmount: bill.amount,
        billNo: bill.billNo, // Include bill number for table display
      };
    });
  };

  const billItems = convertToBillItems(billData);
  const totalUnits = billItems.reduce((sum, bill) => sum + bill.workHours, 0); // This is actually total units
  const totalAmount = billData.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bill Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate professional invoices with customizable templates
          </p>
        </div>

        {/* Excel Library Status Notification */}
        {excelLibraryStatus === "loading" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-blue-800 font-medium">
                Loading Excel processing library...
              </p>
            </div>
          </div>
        )}

        {excelLibraryStatus === "error" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-yellow-800 font-medium">
                  Excel Processing May Be Limited
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  If you experience issues with Excel file uploads, try
                  refreshing the page or using a different browser. For best
                  results, use Chrome or Firefox with a stable internet
                  connection.
                </p>
                {excelLoadError && (
                  <details className="mt-2">
                    <summary className="text-xs text-yellow-600 cursor-pointer">
                      Technical Details
                    </summary>
                    <code className="text-xs text-yellow-600 block mt-1 bg-yellow-100 p-2 rounded">
                      {excelLoadError}
                    </code>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          billDataLength={billData.length}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "config" && (
            <div className="space-y-6">
              <InvoiceUnitsSettings
                config={config}
                onConfigChange={handleConfigChange}
              />

              <DateSettings
                config={config}
                dateMode={dateMode}
                exactStartDate={exactStartDate}
                exactEndDate={exactEndDate}
                specificDates={specificDates}
                newDate={newDate}
                onConfigChange={handleConfigChange}
                onDateModeChange={handleDateModeChange}
                onExactDateChange={handleExactDateChange}
                onNewDateChange={setNewDate}
                onAddSpecificDate={addSpecificDate}
                onRemoveSpecificDate={removeSpecificDate}
              />

              <WeekdayExclusions
                excludedWeekdays={config.excludeWeekdays}
                onExcludedWeekdaysChange={(weekdays) =>
                  handleConfigChange("excludeWeekdays", weekdays)
                }
              />

              <AdvancedOptions
                specificDatesToExclude={specificDatesToExclude}
                newExcludeDate={newExcludeDate}
                onNewExcludeDateChange={setNewExcludeDate}
                onAddExcludeDate={addExcludeDate}
                onRemoveExcludeDate={removeExcludeDate}
              />
            </div>
          )}

          {activeTab === "template" && (
            <TemplateUploader
              onTemplateUpload={handleTemplateUpload}
              cellMapping={cellMapping}
              onCellMappingChange={setCellMapping}
            />
          )}

          {activeTab === "preview" && (
            <PreviewTab
              billData={billItems}
              isGenerating={isGenerating || isGeneratingZip || isGeneratingPDF}
              totalWorkHours={totalUnits}
              totalAmount={totalAmount}
              onGenerateBills={generateBills}
              onDownloadSpecificBill={downloadSpecificBill}
              onDownloadZip={downloadZip}
              onDownloadPDF={downloadPDF}
            />
          )}

          {activeTab === "presets" && (
            <PresetsTab
              presets={savedPresets}
              newPresetName={newPresetName}
              onNewPresetNameChange={setNewPresetName}
              onSavePreset={savePreset}
              onLoadPreset={loadPreset}
              onDeletePreset={deletePreset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
