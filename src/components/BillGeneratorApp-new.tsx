"use client";

import { useState } from "react";
import {
  BillGenerator,
  BillConfig,
  BillData,
  BILL_PRESETS,
  ExcelCellMapping,
} from "@/lib/billGenerator";
import TemplateUploader from "./TemplateUploader";
import ErrorDisplay from "./ErrorDisplay";
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
}

export default function BillGeneratorApp() {
  const [config, setConfig] = useState<BillConfig>(BILL_PRESETS[0].config);
  const [billData, setBillData] = useState<BillData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState("");
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

  const handleConfigChange = (field: keyof BillConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setError("");
    setValidationErrors([]);

    // Real-time validation
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
    setError("");
  };

  const addSpecificDate = () => {
    if (!newDate) return;

    if (!BillGenerator.validateDateFormat(newDate)) {
      setError(
        "Invalid date format. Please use DD-MM-YYYY format (e.g., 15-03-2025)"
      );
      return;
    }

    if (specificDates.includes(newDate)) {
      setError("Date already added");
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
    setError("");
  };

  const removeSpecificDate = (dateToRemove: string) => {
    const updatedDates = specificDates.filter((date) => date !== dateToRemove);
    setSpecificDates(updatedDates);
    setConfig((prev) => ({ ...prev, specificDates: updatedDates }));
  };

  const addExcludeDate = () => {
    if (!newExcludeDate) return;

    if (!BillGenerator.validateDateFormat(newExcludeDate)) {
      setError("Invalid date format. Please use DD-MM-YYYY format");
      return;
    }

    if (specificDatesToExclude.includes(newExcludeDate)) {
      setError("Date already excluded");
      return;
    }

    const updatedDates = [...specificDatesToExclude, newExcludeDate].sort();
    setSpecificDatesToExclude(updatedDates);
    setNewExcludeDate("");
    setError("");
  };

  const removeExcludeDate = (dateToRemove: string) => {
    setSpecificDatesToExclude((prev) =>
      prev.filter((date) => date !== dateToRemove)
    );
  };

  const generateBills = async () => {
    setIsGenerating(true);
    setError("");
    setValidationErrors([]);

    try {
      const validation = BillGenerator.validateConfigurationLimits(config);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      const data = BillGenerator.createBillData(config);
      setBillData(data);
      setActiveTab("preview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating bills"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const previewExcel = async () => {
    if (!templateFile || billData.length === 0) {
      setError("Please upload a template and generate bills first");
      return;
    }

    try {
      const excelBlob = await BillGenerator.generateSingleExcelBill(
        billData[0],
        config,
        templateFile
      );

      if (excelBlob) {
        const url = URL.createObjectURL(excelBlob);
        const newTab = window.open();
        if (newTab) {
          newTab.location.href = url;
          setTimeout(() => URL.revokeObjectURL(url), 30000);
        } else {
          setError("Pop-up blocked. Please allow pop-ups for preview.");
        }
      } else {
        setError("Failed to generate Excel preview");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to preview Excel bill"
      );
    }
  };

  const downloadZip = async () => {
    if (!templateFile || billData.length === 0) {
      setError("Please upload a template and generate bills first");
      return;
    }

    setIsGeneratingZip(true);
    setError("");

    try {
      const zipBlob = await BillGenerator.generateExcelBillsAsZip(
        billData,
        config,
        templateFile
      );
      BillGenerator.downloadZipFile(zipBlob, `invoices_${Date.now()}.zip`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate ZIP file"
      );
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const downloadPDF = async () => {
    if (billData.length === 0) {
      setError("Please generate bills first");
      return;
    }

    if (!templateFile) {
      setError("Please upload a template first for PDF generation");
      return;
    }

    setIsGeneratingPDF(true);
    setError("");

    try {
      const zipBlob = await BillGenerator.generatePDFBillsFromExcel(
        billData,
        config,
        templateFile
      );
      BillGenerator.downloadZipFile(zipBlob, `invoices_pdf_${Date.now()}.zip`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate PDF ZIP file"
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const savePreset = () => {
    if (!newPresetName.trim()) return;

    const preset: Preset = {
      name: newPresetName.trim(),
      config: { ...config },
      excludedWeekdays: [...config.excludeWeekdays],
      createdAt: new Date().toISOString(),
    };

    setSavedPresets((prev) => [...prev, preset]);
    setNewPresetName("");
  };

  const loadPreset = (preset: Preset) => {
    setConfig(preset.config);
    setBillData([]);
    setError("");
    setValidationErrors([]);
    setDateMode(preset.config.dateMode || "month-range");
    setSpecificDates(preset.config.specificDates || []);
    setExactStartDate(preset.config.exactStartDate || "");
    setExactEndDate(preset.config.exactEndDate || "");
    setActiveTab("config");
  };

  const deletePreset = (index: number) => {
    setSavedPresets((prev) => prev.filter((_, i) => i !== index));
  };

  // Convert BillData to BillItem format for PreviewTab
  const convertToBillItems = (data: BillData[]): BillItem[] => {
    return data.map((bill) => ({
      date: bill.date,
      dayOfWeek: new Date(bill.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      startTime: "09:00",
      endTime: "18:00",
      totalHours: 8,
      workHours: 8,
      rate: config.unitPrice,
      totalAmount: bill.amount,
    }));
  };

  const billItems = convertToBillItems(billData);
  const totalWorkHours = billItems.reduce(
    (sum, bill) => sum + bill.workHours,
    0
  );
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

        {/* Error Display at Top */}
        <ErrorDisplay error={error} validationErrors={validationErrors} />

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
              totalWorkHours={totalWorkHours}
              totalAmount={totalAmount}
              onGenerateBills={generateBills}
              onPreviewExcel={previewExcel}
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
