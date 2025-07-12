export interface BillConfig {
  invoiceStart: number;
  invoiceEnd: number;
  totalUnitsToSell: number;
  minUnitsPerBill: number;
  maxUnitsPerBill: number;
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  excludeWeekdays: number[];
  unitPrice: number;
  // Excel template settings
  invoiceCell: string;
  dateCell: string;
  unitsCell: string;
  amountWordsCell: string;
  // Enhanced date selection
  dateMode?: "month-range" | "exact-range" | "specific-dates";
  exactStartDate?: string; // DD-MM-YYYY format
  exactEndDate?: string; // DD-MM-YYYY format
  specificDates?: string[]; // Array of dates in DD-MM-YYYY format
  // Multiple invoices per day
  allowMultipleInvoicesPerDay?: boolean;
}

export interface DateRange {
  startDate?: string; // DD-MM-YYYY format
  endDate?: string; // DD-MM-YYYY format
  useSpecificDates?: boolean;
  specificDates?: string[];
}

export interface BillData {
  billNo: number;
  date: string;
  units: number;
  amount: number;
}

export interface BillPreset {
  name: string;
  description: string;
  config: BillConfig;
}

export interface ExcelCellMapping {
  invoiceCell: string;
  dateCell: string;
  unitsCell: string;
  amountWordsCell: string;
}

// Bill generator utility functions
export class BillGenerator {
  static calculateNumBills(start: number, end: number): number {
    return end - start + 1;
  }

  static generateDateRange(
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
    excludeWeekdays: number[] = [],
    config?: {
      dateMode?: "month-range" | "exact-range" | "specific-dates";
      exactStartDate?: string;
      exactEndDate?: string;
      specificDates?: string[];
    }
  ): string[] {
    // Handle specific dates mode
    if (
      config?.dateMode === "specific-dates" &&
      config?.specificDates?.length
    ) {
      const validDates = config.specificDates.filter((date) => {
        try {
          const parsedDate = this.parseDate(date);
          if (!parsedDate) return false;
          return !excludeWeekdays.includes(parsedDate.getDay());
        } catch {
          return false;
        }
      });

      if (validDates.length === 0) {
        throw new Error(
          "No valid dates found in the specified dates after excluding weekdays"
        );
      }

      return validDates.sort((a, b) => {
        const dateA = this.parseDate(a);
        const dateB = this.parseDate(b);
        return dateA && dateB ? dateA.getTime() - dateB.getTime() : 0;
      });
    }

    // Handle exact date range mode
    if (
      config?.dateMode === "exact-range" &&
      config?.exactStartDate &&
      config?.exactEndDate
    ) {
      const startDate = this.parseDate(config.exactStartDate);
      const endDate = this.parseDate(config.exactEndDate);

      if (!startDate || !endDate) {
        throw new Error(
          "Invalid start or end date format. Please use DD-MM-YYYY format."
        );
      }

      if (startDate > endDate) {
        throw new Error("Start date cannot be after end date");
      }

      const validDates: string[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (!excludeWeekdays.includes(currentDate.getDay())) {
          validDates.push(this.formatDate(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (validDates.length === 0) {
        throw new Error(
          "No valid dates found in the specified date range after excluding weekdays"
        );
      }

      return validDates;
    }

    // Default: month range mode
    const validDates: string[] = [];

    // Enhanced date range generation supporting multiple months
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth - 1, 1);

    if (startDate > endDate) {
      throw new Error("Start date cannot be after end date");
    }

    // For single month
    if (startMonth === endMonth && startYear === endYear) {
      const nextMonth =
        startMonth === 12
          ? new Date(startYear + 1, 0, 1)
          : new Date(startYear, startMonth, 1);
      const lastDay = new Date(
        nextMonth.getTime() - 24 * 60 * 60 * 1000
      ).getDate();

      for (let day = 1; day <= lastDay; day++) {
        const dateObj = new Date(startYear, startMonth - 1, day);
        if (!excludeWeekdays.includes(dateObj.getDay())) {
          validDates.push(this.formatDate(dateObj));
        }
      }
    } else {
      // Multi-month support
      let currentDate = new Date(startDate);
      const finalDate = new Date(endYear, endMonth, 0); // Last day of end month

      while (currentDate <= finalDate) {
        if (!excludeWeekdays.includes(currentDate.getDay())) {
          validDates.push(this.formatDate(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    if (validDates.length === 0) {
      throw new Error(
        "No valid dates found with the given constraints. Try adjusting the date range or excluded weekdays."
      );
    }

    return validDates;
  }

  static formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  }

  static generateUnitsDistribution(
    totalUnits: number,
    numBills: number,
    minUnits: number,
    maxUnits: number
  ): number[] {
    // Enhanced validation with specific error messages
    if (minUnits <= 0) {
      throw new Error("Minimum units per bill must be greater than 0");
    }

    if (maxUnits <= 0) {
      throw new Error("Maximum units per bill must be greater than 0");
    }

    if (minUnits > maxUnits) {
      throw new Error(
        `Minimum units (${minUnits}) cannot be greater than maximum units (${maxUnits})`
      );
    }

    if (totalUnits <= 0) {
      throw new Error("Total units to sell must be greater than 0");
    }

    if (numBills <= 0) {
      throw new Error("Number of bills must be greater than 0");
    }

    const minPossibleTotal = numBills * minUnits;
    const maxPossibleTotal = numBills * maxUnits;

    if (totalUnits < minPossibleTotal) {
      throw new Error(
        `Cannot distribute ${totalUnits} units across ${numBills} bills with minimum ${minUnits} units each. ` +
          `Minimum possible total: ${minPossibleTotal} units. ` +
          `Either reduce the minimum units per bill or increase the total units to sell.`
      );
    }

    if (totalUnits > maxPossibleTotal) {
      throw new Error(
        `Cannot distribute ${totalUnits} units across ${numBills} bills with maximum ${maxUnits} units each. ` +
          `Maximum possible total: ${maxPossibleTotal} units. ` +
          `Either increase the maximum units per bill or reduce the total units to sell.`
      );
    }

    // Start with minimum units for each bill
    const units = new Array(numBills).fill(minUnits);
    let remaining = totalUnits - minPossibleTotal;

    // Distribute remaining units randomly
    while (remaining > 0) {
      for (let i = 0; i < numBills && remaining > 0; i++) {
        const maxAdd = Math.min(remaining, maxUnits - units[i]);
        if (maxAdd > 0) {
          const add = Math.floor(Math.random() * (maxAdd + 1));
          units[i] += add;
          remaining -= add;
        }
      }
    }

    // Shuffle to randomize distribution
    for (let i = units.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [units[i], units[j]] = [units[j], units[i]];
    }

    return units;
  }

  static createBillData(config: BillConfig): BillData[] {
    const numBills = this.calculateNumBills(
      config.invoiceStart,
      config.invoiceEnd
    );

    // Validate invoice range
    if (config.invoiceStart <= 0 || config.invoiceEnd <= 0) {
      throw new Error("Invoice numbers must be greater than 0");
    }

    if (config.invoiceStart > config.invoiceEnd) {
      throw new Error(
        `Invoice start (${config.invoiceStart}) cannot be greater than invoice end (${config.invoiceEnd})`
      );
    }

    // Generate valid dates with enhanced options
    const validDates = this.generateDateRange(
      config.startMonth,
      config.startYear,
      config.endMonth,
      config.endYear,
      config.excludeWeekdays,
      {
        dateMode: config.dateMode || "month-range",
        exactStartDate: config.exactStartDate,
        exactEndDate: config.exactEndDate,
        specificDates: config.specificDates,
      }
    );

    if (validDates.length === 0) {
      throw new Error("No valid dates found with the given constraints");
    }

    // Validate if we have enough dates for the number of bills (only if multiple invoices per day is disabled)
    if (!config.allowMultipleInvoicesPerDay && validDates.length < numBills) {
      throw new Error(
        `Not enough valid dates (${validDates.length}) for the number of bills (${numBills}). ` +
          `Consider reducing the number of bills, expanding the date range, reducing excluded weekdays, or enabling "Allow multiple invoices per day".`
      );
    }

    // Generate units distribution with enhanced validation
    const unitsList = this.generateUnitsDistribution(
      config.totalUnitsToSell,
      numBills,
      config.minUnitsPerBill,
      config.maxUnitsPerBill
    );

    // Create bill data
    const billData: BillData[] = [];

    if (config.allowMultipleInvoicesPerDay) {
      // Distribute bills across available dates more evenly
      const distributedDates = this.distributeInvoicesAcrossDates(
        numBills,
        validDates
      );

      for (let i = 0; i < numBills; i++) {
        const billNo = config.invoiceStart + i;
        const date = distributedDates[i];
        const units = unitsList[i];
        const amount = units * config.unitPrice;

        billData.push({ billNo, date, units, amount });
      }
    } else {
      // Original behavior: one invoice per date
      for (let i = 0; i < numBills; i++) {
        const billNo = config.invoiceStart + i;
        const date = validDates[i]; // Direct mapping, no cycling
        const units = unitsList[i];
        const amount = units * config.unitPrice;

        billData.push({ billNo, date, units, amount });
      }
    }

    return billData;
  }

  static numberToWords(num: number): string {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const thousands = ["", "thousand", "million", "billion"];

    if (num === 0) return "zero";

    function convertHundreds(n: number): string {
      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred ";
        n %= 100;
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        if (n % 10 !== 0) result += "-" + ones[n % 10];
      } else if (n >= 10) {
        result += teens[n - 10];
      } else if (n > 0) {
        result += ones[n];
      }

      return result.trim();
    }

    if (num < 1000) {
      return convertHundreds(num);
    }

    let result = "";
    let thousandCounter = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        result =
          convertHundreds(num % 1000) +
          (thousands[thousandCounter] ? " " + thousands[thousandCounter] : "") +
          " " +
          result;
      }
      num = Math.floor(num / 1000);
      thousandCounter++;
    }

    return result.trim();
  }

  static generateAmountInWords(amount: number): string {
    const words = this.numberToWords(amount);
    return `( Rs. ${words.charAt(0).toUpperCase() + words.slice(1)} only )`;
  }

  static downloadAsCSV(
    billData: BillData[],
    filename: string = "bills.csv"
  ): void {
    const headers = [
      "Invoice No",
      "Date",
      "Units",
      "Amount",
      "Amount in Words",
    ];
    const csvContent = [
      headers.join(","),
      ...billData.map((bill) =>
        [
          bill.billNo,
          bill.date,
          bill.units,
          bill.amount,
          `"${this.generateAmountInWords(bill.amount)}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static downloadAsJSON(
    billData: BillData[],
    filename: string = "bills.json"
  ): void {
    const jsonContent = JSON.stringify(
      billData.map((bill) => ({
        ...bill,
        amountInWords: this.generateAmountInWords(bill.amount),
      })),
      null,
      2
    );

    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async generateExcelBillsAsZip(
    billData: BillData[],
    config: BillConfig,
    templateFile: File
  ): Promise<Blob> {
    const ExcelJS = await this.loadExcelJS();
    const JSZip = (await import("jszip")).default;

    const zip = new JSZip();
    const templateBuffer = await templateFile.arrayBuffer();

    for (const bill of billData) {
      try {
        // Use the enhanced binary method for absolute template preservation
        const excelBlob = await this.generateSingleExcelBillBinary(
          bill,
          config,
          templateFile
        );

        if (excelBlob) {
          const buffer = await excelBlob.arrayBuffer();
          zip.file(`Invoice_${bill.billNo}.xlsx`, buffer);
        } else {
          throw new Error(`Failed to generate Excel for bill ${bill.billNo}`);
        }
      } catch (error) {
        console.error(`Error processing bill ${bill.billNo}:`, error);
        // Add error file to ZIP
        zip.file(
          `Error_Invoice_${bill.billNo}.txt`,
          `Error processing invoice ${bill.billNo}:\n${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Generate the ZIP file
    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });
  }

  static async generatePDFBillsAsZip(
    billData: BillData[],
    config: BillConfig,
    templateFile: File
  ): Promise<Blob> {
    const jsPDF = (await import("jspdf")).default;
    const JSZip = (await import("jszip")).default;

    const zip = new JSZip();

    for (const bill of billData) {
      try {
        // Create a new PDF document
        const doc = new jsPDF();

        // Set font and styling
        doc.setFontSize(20);
        doc.text("INVOICE", 105, 30, { align: "center" });

        // Invoice details
        doc.setFontSize(12);
        doc.text(`Invoice No: ${bill.billNo}`, 20, 60);
        doc.text(`Date: ${bill.date}`, 20, 75);
        doc.text(`Units: ${bill.units}`, 20, 90);
        doc.text(`Unit Price: ₹${config.unitPrice}`, 20, 105);
        doc.text(`Total Amount: ₹${bill.amount}`, 20, 120);

        // Amount in words
        const amountInWords = this.generateAmountInWords(bill.amount);
        doc.text(`Amount in Words: ${amountInWords}`, 20, 140);

        // Add a simple border
        doc.rect(15, 15, 180, 250);

        // Generate PDF buffer
        const pdfBuffer = doc.output("arraybuffer");

        // Add to ZIP
        zip.file(`Invoice_${bill.billNo}.pdf`, pdfBuffer);
      } catch (error) {
        console.error(`Error generating PDF for bill ${bill.billNo}:`, error);
        // Add error file to ZIP
        zip.file(
          `Error_Invoice_${bill.billNo}.txt`,
          `Error generating PDF for invoice ${bill.billNo}:\n${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Generate the ZIP file
    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });
  }

  static async generateSingleExcelBill(
    bill: BillData,
    config: BillConfig,
    templateFile: File
  ): Promise<Blob | null> {
    // Use the binary method for absolute template preservation
    return this.generateSingleExcelBillBinary(bill, config, templateFile);
  }

  static async generateSinglePDFBill(
    bill: BillData,
    config: BillConfig
  ): Promise<Blob> {
    const jsPDF = (await import("jspdf")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Set font and styling
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 30, { align: "center" });

    // Invoice details
    doc.setFontSize(12);
    doc.text(`Invoice No: ${bill.billNo}`, 20, 60);
    doc.text(`Date: ${bill.date}`, 20, 75);
    doc.text(`Units: ${bill.units}`, 20, 90);
    doc.text(`Unit Price: ₹${config.unitPrice}`, 20, 105);
    doc.text(`Total Amount: ₹${bill.amount}`, 20, 120);

    // Amount in words
    const amountInWords = this.generateAmountInWords(bill.amount);
    const words = doc.splitTextToSize(amountInWords, 170);
    doc.text(`Amount in Words:`, 20, 140);
    doc.text(words, 20, 155);

    // Add a simple border
    doc.rect(15, 15, 180, 250);

    // Return as blob
    return new Blob([doc.output("blob")], { type: "application/pdf" });
  }

  static downloadZipFile(
    zipBlob: Blob,
    filename: string = "invoices.zip"
  ): void {
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async generatePDFFromExcel(
    excelBlob: Blob,
    bill: BillData
  ): Promise<Blob> {
    const jsPDF = (await import("jspdf")).default;

    // Create a new PDF document with better formatting
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 105, 30, { align: "center" });

    // Add a line under title
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Invoice details with better formatting
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Left column
    doc.text(`Invoice Number: ${bill.billNo}`, 20, 50);
    doc.text(`Date: ${bill.date}`, 20, 65);
    doc.text(`Quantity: ${bill.units} units`, 20, 80);

    // Right column
    doc.text(`Unit Price: ₹${(bill.amount / bill.units).toFixed(2)}`, 110, 50);
    doc.text(`Total Amount: ₹${bill.amount.toLocaleString()}`, 110, 65);

    // Amount in words section
    doc.setFontSize(10);
    doc.text("Amount in Words:", 20, 100);
    const amountInWords = this.generateAmountInWords(bill.amount);
    const words = doc.splitTextToSize(amountInWords, 170);
    doc.text(words, 20, 110);

    // Add table-like structure
    doc.setLineWidth(0.3);
    doc.rect(15, 40, 180, 80); // Main border
    doc.line(15, 85, 195, 85); // Horizontal line before amount in words

    // Footer
    doc.setFontSize(8);
    doc.text("This is a computer-generated invoice.", 105, 140, {
      align: "center",
    });

    // Return as blob
    return new Blob([doc.output("blob")], { type: "application/pdf" });
  }

  static async generatePDFBillsFromExcel(
    billData: BillData[],
    config: BillConfig,
    templateFile: File
  ): Promise<Blob> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const bill of billData) {
      try {
        // First generate Excel with template
        const excelBlob = await this.generateSingleExcelBill(
          bill,
          config,
          templateFile
        );

        if (excelBlob) {
          // Convert to PDF
          const pdfBlob = await this.generatePDFFromExcel(excelBlob, bill);
          zip.file(`Invoice_${bill.billNo}.pdf`, pdfBlob);
        } else {
          // Fallback to basic PDF if Excel generation fails
          const pdfBlob = await this.generateSinglePDFBill(bill, config);
          zip.file(`Invoice_${bill.billNo}.pdf`, pdfBlob);
        }
      } catch (error) {
        console.error(`Error generating PDF for bill ${bill.billNo}:`, error);
        // Add error file to ZIP
        zip.file(
          `Error_Invoice_${bill.billNo}.txt`,
          `Error generating PDF for invoice ${bill.billNo}:\n${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Generate the ZIP file
    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });
  }

  // Enhanced ExcelJS loader with retry mechanism
  private static async loadExcelJS(): Promise<any> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Loading ExcelJS attempt ${attempt}/${maxRetries}`);

        // Try different import strategies
        let ExcelJS;

        if (attempt === 1) {
          // Standard dynamic import
          ExcelJS = (await import("exceljs")).default;
        } else if (attempt === 2) {
          // Try importing the entire module
          const excelModule = await import("exceljs");
          ExcelJS = excelModule.default || excelModule;
        } else {
          // Last resort - try with a delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          ExcelJS = (await import("exceljs")).default;
        }

        if (!ExcelJS || !ExcelJS.Workbook) {
          throw new Error(
            `ExcelJS loaded but Workbook not found (attempt ${attempt})`
          );
        }

        console.log(`ExcelJS loaded successfully on attempt ${attempt}`);
        return ExcelJS;
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(`Unknown error on attempt ${attempt}`);
        console.warn(
          `ExcelJS loading failed on attempt ${attempt}:`,
          lastError.message
        );

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }

    // If all attempts failed, throw detailed error
    throw new Error(
      `Failed to load ExcelJS library after ${maxRetries} attempts. ` +
        `Last error: ${lastError?.message || "Unknown error"}. ` +
        `This might be due to network issues or browser limitations. ` +
        `Please try refreshing the page or using a different browser.`
    );
  }

  static async validateExcelTemplate(
    templateFile: File,
    cellMapping: ExcelCellMapping
  ): Promise<{
    isValid: boolean;
    errors: string[];
    preview?: any;
  }> {
    try {
      // Use the enhanced ExcelJS loader
      const ExcelJS = await this.loadExcelJS();
      const workbook = new ExcelJS.Workbook();

      console.log(
        `Processing file: ${templateFile.name}, size: ${templateFile.size} bytes`
      );

      // Validate file before processing
      if (templateFile.size === 0) {
        return {
          isValid: false,
          errors: [
            "The uploaded file is empty. Please select a valid Excel file.",
          ],
        };
      }

      if (templateFile.size > 50 * 1024 * 1024) {
        // 50MB limit
        return {
          isValid: false,
          errors: ["File is too large. Please use a file smaller than 50MB."],
        };
      }

      const buffer = await templateFile.arrayBuffer();
      console.log(`File buffer created, size: ${buffer.byteLength} bytes`);

      // Try loading the Excel file with timeout
      const loadPromise = workbook.xlsx.load(buffer);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("File loading timeout after 30 seconds")),
          30000
        )
      );

      await Promise.race([loadPromise, timeoutPromise]);
      console.log("Excel file loaded successfully");

      // Check for worksheets - try multiple approaches
      let worksheet = null;

      // Method 1: Get first worksheet
      if (workbook.worksheets && workbook.worksheets.length > 0) {
        worksheet = workbook.worksheets[0];
      }

      // Method 2: Try getting worksheet by index
      if (!worksheet) {
        try {
          worksheet = workbook.getWorksheet(1);
        } catch (e) {
          // Ignore error and try next method
        }
      }

      // Method 3: Try getting active worksheet
      if (!worksheet && workbook.worksheets) {
        for (const ws of workbook.worksheets) {
          if (ws && ws.state === "visible") {
            worksheet = ws;
            break;
          }
        }
      }

      // Method 4: Just get any worksheet
      if (!worksheet && workbook.worksheets) {
        worksheet = workbook.worksheets.find((ws: any) => ws !== undefined);
      }

      const errors: string[] = [];

      if (!worksheet) {
        errors.push(
          "No accessible worksheet found in the Excel file. Please ensure the file contains at least one worksheet."
        );
        return { isValid: false, errors };
      }

      // Check if the specified cells exist and are accessible
      const cellsToCheck = [
        { name: "Invoice Cell", address: cellMapping.invoiceCell },
        { name: "Date Cell", address: cellMapping.dateCell },
        { name: "Units Cell", address: cellMapping.unitsCell },
        { name: "Amount Words Cell", address: cellMapping.amountWordsCell },
      ];

      const preview: any = {};

      for (const cellInfo of cellsToCheck) {
        try {
          // Validate cell address format
          if (
            !cellInfo.address ||
            !/^[A-Z]+\d+$/i.test(cellInfo.address.trim())
          ) {
            errors.push(
              `Invalid cell address format: ${cellInfo.address} (${cellInfo.name}). Use format like A1, B2, etc.`
            );
            continue;
          }

          const cell = worksheet.getCell(cellInfo.address.trim().toUpperCase());

          // Safely serialize the cell value
          let currentValue: string;
          if (cell.value === null || cell.value === undefined) {
            currentValue = "Empty";
          } else if (cell.value instanceof Date) {
            currentValue = cell.value.toLocaleDateString();
          } else if (typeof cell.value === "object") {
            // Handle complex cell values (like formulas)
            currentValue = JSON.stringify(cell.value);
          } else {
            currentValue = String(cell.value);
          }

          preview[cellInfo.name] = {
            address: cellInfo.address.toUpperCase(),
            currentValue: currentValue,
            type: cell.type || "empty",
            formula: cell.formula || null,
          };
        } catch (error) {
          errors.push(
            `Cannot access cell: ${cellInfo.address} (${cellInfo.name}). ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Additional validation - check if worksheet has any content
      if (worksheet.actualRowCount === 0) {
        errors.push(
          "The worksheet appears to be empty. Please use a template with some content."
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        preview: errors.length === 0 ? preview : undefined,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Provide more specific error messages
      if (errorMessage.includes("Zip")) {
        return {
          isValid: false,
          errors: [
            `File appears to be corrupted or not a valid Excel file. Please try saving the file again in Excel format (.xlsx).`,
          ],
        };
      }

      if (errorMessage.includes("workbook")) {
        return {
          isValid: false,
          errors: [
            `Unable to read Excel workbook. Please ensure the file is a valid .xlsx or .xls file and not password protected.`,
          ],
        };
      }

      return {
        isValid: false,
        errors: [
          `Failed to read Excel file: ${errorMessage}. Please ensure the file is a valid Excel format (.xlsx recommended).`,
        ],
      };
    }
  }

  static parseDate(dateString: string): Date | null {
    try {
      const [day, month, year] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      // Validate the date is real (e.g., not 31st February)
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }

  static validateDateFormat(dateString: string): boolean {
    const regex = /^\d{1,2}-\d{1,2}-\d{4}$/;
    if (!regex.test(dateString)) return false;

    const date = this.parseDate(dateString);
    return date !== null;
  }

  static validateConfigurationLimits(config: BillConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const numBills = this.calculateNumBills(
      config.invoiceStart,
      config.invoiceEnd
    );
    const minPossibleTotal = numBills * config.minUnitsPerBill;
    const maxPossibleTotal = numBills * config.maxUnitsPerBill;

    // Validate units constraints
    if (config.totalUnitsToSell < minPossibleTotal) {
      errors.push(
        `Total units (${config.totalUnitsToSell}) is too low. With ${numBills} bills and minimum ${config.minUnitsPerBill} units each, you need at least ${minPossibleTotal} units.`
      );
    }

    if (config.totalUnitsToSell > maxPossibleTotal) {
      errors.push(
        `Total units (${config.totalUnitsToSell}) is too high. With ${numBills} bills and maximum ${config.maxUnitsPerBill} units each, you can sell at most ${maxPossibleTotal} units.`
      );
    }

    // Validate date constraints
    if (config.dateMode === "specific-dates" && config.specificDates) {
      const validDates = config.specificDates.filter((date) =>
        this.validateDateFormat(date)
      );
      if (!config.allowMultipleInvoicesPerDay && validDates.length < numBills) {
        errors.push(
          `Not enough valid specific dates (${validDates.length}) for ${numBills} bills. Please add more dates, use date range, or enable "Allow multiple invoices per day".`
        );
      }
    }

    if (config.dateMode === "exact-range") {
      if (!config.exactStartDate || !config.exactEndDate) {
        errors.push(
          "Both start date and end date are required for exact date range mode."
        );
      } else {
        const startDate = this.parseDate(config.exactStartDate);
        const endDate = this.parseDate(config.exactEndDate);

        if (!startDate || !endDate) {
          errors.push(
            "Invalid date format. Please use DD-MM-YYYY format for both start and end dates."
          );
        } else if (startDate > endDate) {
          errors.push("Start date cannot be after end date.");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static distributeInvoicesAcrossDates(
    numBills: number,
    availableDates: string[]
  ): string[] {
    const distributedDates: string[] = [];

    if (availableDates.length === 0) {
      throw new Error("No available dates for invoice distribution");
    }

    // Calculate how many invoices per date on average
    const invoicesPerDate = Math.ceil(numBills / availableDates.length);

    // Distribute invoices more evenly across dates
    for (let i = 0; i < numBills; i++) {
      const dateIndex = Math.floor(i / invoicesPerDate) % availableDates.length;
      distributedDates.push(availableDates[dateIndex]);
    }

    // If we still have bills left, distribute them cyclically
    for (let i = distributedDates.length; i < numBills; i++) {
      distributedDates.push(availableDates[i % availableDates.length]);
    }

    return distributedDates;
  }

  // Enhanced binary-level template preservation method
  static async generateSingleExcelBillBinary(
    bill: BillData,
    config: BillConfig,
    templateFile: File
  ): Promise<Blob | null> {
    try {
      const ExcelJS = await this.loadExcelJS();

      // Create a pristine copy of the template buffer
      const originalBuffer = await templateFile.arrayBuffer();
      const pristineBuffer = new ArrayBuffer(originalBuffer.byteLength);
      new Uint8Array(pristineBuffer).set(new Uint8Array(originalBuffer));

      // Load the pristine copy
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(pristineBuffer, {
        ignoreNodes: [], // Preserve all XML nodes
        map: (value: any) => value, // Don't transform values
      });

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheet found in template");
      }

      console.log(`Binary method: Processing bill ${bill.billNo}`);
      console.log(
        `Template has ${worksheet.rowCount} rows and ${worksheet.columnCount} columns`
      );

      // Preserve all worksheet properties
      const worksheetProperties = {
        views: worksheet.views ? [...worksheet.views] : [],
        autoFilter: worksheet.autoFilter ? { ...worksheet.autoFilter } : null,
        pageSetup: worksheet.pageSetup ? { ...worksheet.pageSetup } : {},
        headerFooter: worksheet.headerFooter
          ? { ...worksheet.headerFooter }
          : null,
        properties: worksheet.properties ? { ...worksheet.properties } : {},
        state: worksheet.state,
      };

      // Preserve all row heights
      const rowHeights: { [key: number]: number } = {};
      worksheet.eachRow((row) => {
        if (row.height !== undefined) {
          rowHeights[row.number] = row.height;
        }
      });

      // Preserve all column widths
      const columnWidths: { [key: string]: number } = {};
      if (worksheet.columns) {
        worksheet.columns.forEach((col, index) => {
          if (col.width !== undefined) {
            columnWidths[index + 1] = col.width;
          }
        });
      }

      // Preserve merged cells
      const mergedCells = worksheet.model?.merges
        ? [...worksheet.model.merges]
        : [];
      console.log(`Found ${mergedCells.length} merged cell ranges in template`);

      // Define cell mappings
      const cellMappings = [
        { address: config.invoiceCell, value: bill.billNo, name: "Invoice" },
        { address: config.dateCell, value: bill.date, name: "Date" },
        { address: config.unitsCell, value: bill.units, name: "Units" },
        {
          address: config.amountWordsCell,
          value: this.generateAmountInWords(bill.amount),
          name: "Amount Words",
        },
      ];

      // Update cells with extreme care
      for (const mapping of cellMappings) {
        try {
          const cell = worksheet.getCell(mapping.address);

          // Preserve all cell properties
          const cellState = {
            value: cell.value,
            type: cell.type,
            style: JSON.parse(JSON.stringify(cell.style || {})),
            alignment: JSON.parse(JSON.stringify(cell.alignment || {})),
            border: JSON.parse(JSON.stringify(cell.border || {})),
            fill: JSON.parse(JSON.stringify(cell.fill || {})),
            font: JSON.parse(JSON.stringify(cell.font || {})),
            numFmt: cell.numFmt,
            protection: JSON.parse(JSON.stringify(cell.protection || {})),
            hyperlink: cell.hyperlink ? { ...cell.hyperlink } : null,
            comment: cell.comment ? { ...cell.comment } : null,
            formula: cell.formula,
            formulaType: cell.formulaType,
            sharedFormula: cell.sharedFormula,
            name: cell.name,
            isMerged: cell.isMerged,
            master: cell.master ? cell.master.address : null,
          };

          // Update ONLY the value
          cell.value = mapping.value;

          // Restore all properties
          if (Object.keys(cellState.style).length > 0)
            cell.style = cellState.style;
          if (Object.keys(cellState.alignment).length > 0)
            cell.alignment = cellState.alignment;
          if (Object.keys(cellState.border).length > 0)
            cell.border = cellState.border;
          if (Object.keys(cellState.fill).length > 0)
            cell.fill = cellState.fill;
          if (Object.keys(cellState.font).length > 0)
            cell.font = cellState.font;
          if (cellState.numFmt) cell.numFmt = cellState.numFmt;
          if (Object.keys(cellState.protection).length > 0)
            cell.protection = cellState.protection;
          if (cellState.hyperlink) cell.hyperlink = cellState.hyperlink;
          if (cellState.comment) cell.comment = cellState.comment;
          if (cellState.formula) cell.formula = cellState.formula;
          if (cellState.formulaType) cell.formulaType = cellState.formulaType;
          if (cellState.sharedFormula)
            cell.sharedFormula = cellState.sharedFormula;
          if (cellState.name) cell.name = cellState.name;
          if (cellState.isMerged) cell.merge(cellState.master || cell);

          console.log(
            `Binary method: Updated ${mapping.name} at ${mapping.address} = ${mapping.value}`
          );
        } catch (error) {
          console.warn(
            `Binary method: Failed to update ${mapping.name} at ${mapping.address}:`,
            error
          );
        }
      }

      // Restore worksheet properties
      if (worksheetProperties.views.length > 0)
        worksheet.views = worksheetProperties.views;
      if (worksheetProperties.autoFilter)
        worksheet.autoFilter = worksheetProperties.autoFilter;
      if (Object.keys(worksheetProperties.pageSetup).length > 0)
        worksheet.pageSetup = worksheetProperties.pageSetup;
      if (worksheetProperties.headerFooter)
        worksheet.headerFooter = worksheetProperties.headerFooter;
      if (Object.keys(worksheetProperties.properties).length > 0)
        worksheet.properties = worksheetProperties.properties;
      if (worksheetProperties.state)
        worksheet.state = worksheetProperties.state;

      // Restore row heights
      Object.keys(rowHeights).forEach((rowNum) => {
        const row = worksheet.getRow(Number(rowNum));
        if (row) row.height = rowHeights[Number(rowNum)];
      });

      // Restore column widths
      Object.keys(columnWidths).forEach((colNum) => {
        const col = worksheet.getColumn(Number(colNum));
        if (col) col.width = columnWidths[Number(colNum)];
      });

      // Restore merged cells
      if (mergedCells.length > 0) {
        try {
          worksheet.model.merges = mergedCells;
          console.log(
            `Binary method: Restored ${mergedCells.length} merged cell ranges`
          );
        } catch (error) {
          console.warn("Binary method: Could not restore merged cells:", error);
        }
      }

      // Write with maximum fidelity options
      const outputBuffer = await workbook.xlsx.writeBuffer({
        useStyles: true,
        useSharedStrings: true,
        bookType: "xlsx",
        compression: "DEFLATE",
      });

      console.log(
        `Binary method: Successfully generated bill ${bill.billNo} - ${outputBuffer.byteLength} bytes`
      );

      return new Blob([outputBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch (error) {
      console.error(`Binary method failed for bill ${bill.billNo}:`, error);
      return null; // Return null to indicate failure, allowing fallback in caller
    }
  }

  // Fallback method with simpler preservation
  static async generateSingleExcelBillEnhanced(
    bill: BillData,
    config: BillConfig,
    templateFile: File
  ): Promise<Blob | null> {
    try {
      const ExcelJS = await this.loadExcelJS();

      // Create a completely fresh ArrayBuffer copy
      const originalBuffer = await templateFile.arrayBuffer();
      const templateCopy = originalBuffer.slice(0);

      // Load the template as-is
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateCopy);

      // Get the first worksheet
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error("No worksheet found in template");
      }

      console.log(`Processing bill ${bill.billNo} - Original template loaded`);

      // Preserve row and column dimensions
      const rowHeights: { [key: number]: number } = {};
      worksheet.eachRow((row) => {
        if (row.height !== undefined) {
          rowHeights[row.number] = row.height;
        }
      });

      const columnWidths: { [key: string]: number } = {};
      if (worksheet.columns) {
        worksheet.columns.forEach((col, index) => {
          if (col.width !== undefined) {
            columnWidths[index + 1] = col.width;
          }
        });
      }

      // Preserve merged cells
      const mergedCells = worksheet.model?.merges
        ? [...worksheet.model.merges]
        : [];

      // Update only the specific cell values
      const cellUpdates = [
        {
          address: config.invoiceCell,
          value: bill.billNo,
          name: "Invoice Number",
        },
        { address: config.dateCell, value: bill.date, name: "Date" },
        { address: config.unitsCell, value: bill.units, name: "Units" },
        {
          address: config.amountWordsCell,
          value: this.generateAmountInWords(bill.amount),
          name: "Amount in Words",
        },
      ];

      // Update cells with minimal disruption
      for (const update of cellUpdates) {
        try {
          const targetCell = worksheet.getCell(update.address);

          // Store original properties
          const originalStyle = JSON.parse(
            JSON.stringify(targetCell.style || {})
          );
          const originalAlignment = JSON.parse(
            JSON.stringify(targetCell.alignment || {})
          );
          const originalBorder = JSON.parse(
            JSON.stringify(targetCell.border || {})
          );
          const originalFill = JSON.parse(
            JSON.stringify(targetCell.fill || {})
          );
          const originalFont = JSON.parse(
            JSON.stringify(targetCell.font || {})
          );
          const originalNumFmt = targetCell.numFmt;
          const originalFormula = targetCell.formula;

          // Update value
          targetCell.value = update.value;

          // Restore properties
          if (Object.keys(originalStyle).length > 0)
            targetCell.style = originalStyle;
          if (Object.keys(originalAlignment).length > 0)
            targetCell.alignment = originalAlignment;
          if (Object.keys(originalBorder).length > 0)
            targetCell.border = originalBorder;
          if (Object.keys(originalFill).length > 0)
            targetCell.fill = originalFill;
          if (Object.keys(originalFont).length > 0)
            targetCell.font = originalFont;
          if (originalNumFmt) targetCell.numFmt = originalNumFmt;
          if (originalFormula) targetCell.formula = originalFormula;

          console.log(
            `Updated ${update.name} at ${update.address}: ${update.value}`
          );
        } catch (e) {
          console.warn(
            `Failed to update ${update.name} at ${update.address}:`,
            e
          );
        }
      }

      // Restore row heights
      Object.keys(rowHeights).forEach((rowNum) => {
        const row = worksheet.getRow(Number(rowNum));
        if (row) row.height = rowHeights[Number(rowNum)];
      });

      // Restore column widths
      Object.keys(columnWidths).forEach((colNum) => {
        const col = worksheet.getColumn(Number(colNum));
        if (col) col.width = columnWidths[Number(colNum)];
      });

      // Restore merged cells
      if (mergedCells.length > 0) {
        worksheet.model.merges = mergedCells;
      }

      // Write the workbook with all original formatting preserved
      const outputBuffer = await workbook.xlsx.writeBuffer({
        useStyles: true,
        useSharedStrings: true,
        bookType: "xlsx",
      });

      console.log(
        `Generated bill ${bill.billNo} - Size: ${outputBuffer.byteLength} bytes`
      );

      return new Blob([outputBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch (error) {
      console.error(`Error generating Excel bill ${bill.billNo}:`, error);
      return null;
    }
  }

  // Ultimate template preservation method - direct buffer manipulation approach
  static async generateSingleExcelBillUltimate(
    bill: BillData,
    config: BillConfig,
    templateFile: File
  ): Promise<Blob | null> {
    try {
      const ExcelJS = await this.loadExcelJS();

      // Read the template as binary data
      const templateArrayBuffer = await templateFile.arrayBuffer();

      // Load with maximum preservation
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateArrayBuffer, {
        ignoreNodes: [],
        map: (value: any) => value,
      });

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheet found in template");
      }

      console.log(
        `Processing bill ${bill.billNo} with ultimate preservation method`
      );

      // Preserve worksheet properties
      const worksheetProperties = {
        views: worksheet.views ? [...worksheet.views] : [],
        autoFilter: worksheet.autoFilter ? { ...worksheet.autoFilter } : null,
        pageSetup: worksheet.pageSetup ? { ...worksheet.pageSetup } : {},
        headerFooter: worksheet.headerFooter
          ? { ...worksheet.headerFooter }
          : null,
        properties: worksheet.properties ? { ...worksheet.properties } : {},
        state: worksheet.state,
      };

      // Preserve row and column dimensions
      const rowHeights: { [key: number]: number } = {};
      worksheet.eachRow((row) => {
        if (row.height !== undefined) {
          rowHeights[row.number] = row.height;
        }
      });

      const columnWidths: { [key: string]: number } = {};
      if (worksheet.columns) {
        worksheet.columns.forEach((col, index) => {
          if (col.width !== undefined) {
            columnWidths[index + 1] = col.width;
          }
        });
      }

      // Preserve merged cells
      const mergedCells = worksheet.model?.merges
        ? [...worksheet.model.merges]
        : [];

      // Define cell updates
      const updates = [
        { cell: config.invoiceCell, value: bill.billNo, type: "number" },
        { cell: config.dateCell, value: bill.date, type: "string" },
        { cell: config.unitsCell, value: bill.units, type: "number" },
        {
          cell: config.amountWordsCell,
          value: this.generateAmountInWords(bill.amount),
          type: "string",
        },
      ];

      // Update cells with minimal disruption
      for (const update of updates) {
        try {
          const targetCell = worksheet.getCell(update.cell);

          // Backup all cell properties
          const backup = {
            style: JSON.parse(JSON.stringify(targetCell.style || {})),
            alignment: JSON.parse(JSON.stringify(targetCell.alignment || {})),
            border: JSON.parse(JSON.stringify(targetCell.border || {})),
            fill: JSON.parse(JSON.stringify(targetCell.fill || {})),
            font: JSON.parse(JSON.stringify(targetCell.font || {})),
            numFmt: targetCell.numFmt,
            type: targetCell.type,
            formula: targetCell.formula,
            formulaType: targetCell.formulaType,
            sharedFormula: targetCell.sharedFormula,
            name: targetCell.name,
            protection: JSON.parse(JSON.stringify(targetCell.protection || {})),
            hyperlink: targetCell.hyperlink
              ? { ...targetCell.hyperlink }
              : null,
            comment: targetCell.comment ? { ...targetCell.comment } : null,
            isMerged: targetCell.isMerged,
            master: targetCell.master ? targetCell.master.address : null,
          };

          // Update only the value
          targetCell.value = update.value;

          // Restore all properties
          if (Object.keys(backup.style).length > 0)
            targetCell.style = backup.style;
          if (Object.keys(backup.alignment).length > 0)
            targetCell.alignment = backup.alignment;
          if (Object.keys(backup.border).length > 0)
            targetCell.border = backup.border;
          if (Object.keys(backup.fill).length > 0)
            targetCell.fill = backup.fill;
          if (Object.keys(backup.font).length > 0)
            targetCell.font = backup.font;
          if (backup.numFmt) targetCell.numFmt = backup.numFmt;
          if (backup.formula) targetCell.formula = backup.formula;
          if (backup.formulaType) targetCell.formulaType = backup.formulaType;
          if (backup.sharedFormula)
            targetCell.sharedFormula = backup.sharedFormula;
          if (backup.name) targetCell.name = backup.name;
          if (Object.keys(backup.protection).length > 0)
            targetCell.protection = backup.protection;
          if (backup.hyperlink) targetCell.hyperlink = backup.hyperlink;
          if (backup.comment) targetCell.comment = backup.comment;
          if (backup.isMerged && backup.master)
            targetCell.merge(worksheet.getCell(backup.master));

          console.log(
            `Updated ${update.cell} with value: ${update.value} (type: ${update.type})`
          );
        } catch (error) {
          console.warn(`Could not update cell ${update.cell}:`, error);
        }
      }

      // Restore worksheet properties
      if (worksheetProperties.views.length > 0)
        worksheet.views = worksheetProperties.views;
      if (worksheetProperties.autoFilter)
        worksheet.autoFilter = worksheetProperties.autoFilter;
      if (Object.keys(worksheetProperties.pageSetup).length > 0)
        worksheet.pageSetup = worksheetProperties.pageSetup;
      if (worksheetProperties.headerFooter)
        worksheet.headerFooter = worksheetProperties.headerFooter;
      if (Object.keys(worksheetProperties.properties).length > 0)
        worksheet.properties = worksheetProperties.properties;
      if (worksheetProperties.state)
        worksheet.state = worksheetProperties.state;

      // Restore row heights
      Object.keys(rowHeights).forEach((rowNum) => {
        const row = worksheet.getRow(Number(rowNum));
        if (row) row.height = rowHeights[Number(rowNum)];
      });

      // Restore column widths
      Object.keys(columnWidths).forEach((colNum) => {
        const col = worksheet.getColumn(Number(colNum));
        if (col) col.width = columnWidths[Number(colNum)];
      });

      // Restore merged cells
      if (mergedCells.length > 0) {
        worksheet.model.merges = mergedCells;
      }

      // Generate output with comprehensive preservation
      const buffer = await workbook.xlsx.writeBuffer({
        useStyles: true,
        useSharedStrings: true,
        bookType: "xlsx",
        compression: "DEFLATE",
      });

      console.log(
        `Ultimate method completed for bill ${bill.billNo} - Output size: ${buffer.byteLength} bytes`
      );

      return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch (error) {
      console.error(`Ultimate method failed for bill ${bill.billNo}:`, error);
      return this.generateSingleExcelBillEnhanced(bill, config, templateFile);
    }
  }
}

// Predefined presets
export const BILL_PRESETS: BillPreset[] = [
  {
    name: "Default May 2025",
    description: "129 bills in May 2025, excluding Tuesdays",
    config: {
      invoiceStart: 110,
      invoiceEnd: 238,
      totalUnitsToSell: 645,
      minUnitsPerBill: 2,
      maxUnitsPerBill: 12,
      startMonth: 5,
      startYear: 2025,
      endMonth: 5,
      endYear: 2025,
      excludeWeekdays: [2], // Tuesday
      unitPrice: 400,
      invoiceCell: "I10",
      dateCell: "I9",
      unitsCell: "G20",
      amountWordsCell: "D39",
      dateMode: "month-range",
      allowMultipleInvoicesPerDay: true,
    },
  },
  {
    name: "June Weekend Sales",
    description: "50 bills in June 2025, excluding weekends",
    config: {
      invoiceStart: 300,
      invoiceEnd: 349,
      totalUnitsToSell: 400,
      minUnitsPerBill: 5,
      maxUnitsPerBill: 15,
      startMonth: 6,
      startYear: 2025,
      endMonth: 6,
      endYear: 2025,
      excludeWeekdays: [0, 6], // Sunday, Saturday
      unitPrice: 500,
      invoiceCell: "I10",
      dateCell: "I9",
      unitsCell: "G20",
      amountWordsCell: "D39",
      dateMode: "month-range",
      allowMultipleInvoicesPerDay: false,
    },
  },
  {
    name: "High Volume March",
    description: "200 bills in March 2025, excluding Sunday only",
    config: {
      invoiceStart: 1000,
      invoiceEnd: 1199,
      totalUnitsToSell: 2000,
      minUnitsPerBill: 8,
      maxUnitsPerBill: 12,
      startMonth: 3,
      startYear: 2025,
      endMonth: 3,
      endYear: 2025,
      excludeWeekdays: [0], // Sunday
      unitPrice: 350,
      invoiceCell: "I10",
      dateCell: "I9",
      unitsCell: "G20",
      amountWordsCell: "D39",
      dateMode: "month-range",
      allowMultipleInvoicesPerDay: true,
    },
  },
  {
    name: "July No Restrictions",
    description: "100 bills in July 2025, no day restrictions",
    config: {
      invoiceStart: 2000,
      invoiceEnd: 2099,
      totalUnitsToSell: 800,
      minUnitsPerBill: 6,
      maxUnitsPerBill: 10,
      startMonth: 7,
      startYear: 2025,
      endMonth: 7,
      endYear: 2025,
      excludeWeekdays: [],
      unitPrice: 450,
      invoiceCell: "I10",
      dateCell: "I9",
      unitsCell: "G20",
      amountWordsCell: "D39",
      dateMode: "month-range",
      allowMultipleInvoicesPerDay: true,
    },
  },
  {
    name: "Custom Specific Dates",
    description: "5 bills on specific dates in July 2025",
    config: {
      invoiceStart: 3000,
      invoiceEnd: 3004,
      totalUnitsToSell: 40,
      minUnitsPerBill: 6,
      maxUnitsPerBill: 10,
      startMonth: 7,
      startYear: 2025,
      endMonth: 7,
      endYear: 2025,
      excludeWeekdays: [],
      unitPrice: 500,
      invoiceCell: "I10",
      dateCell: "I9",
      unitsCell: "G20",
      amountWordsCell: "D39",
      dateMode: "specific-dates",
      specificDates: [
        "01-07-2025",
        "05-07-2025",
        "10-07-2025",
        "15-07-2025",
        "20-07-2025",
      ],
      allowMultipleInvoicesPerDay: false,
    },
  },
  {
    name: "Exact Date Range",
    description: "10 bills from March 15 to April 1, 2025",
    config: {
      invoiceStart: 4000,
      invoiceEnd: 4009,
      totalUnitsToSell: 80,
      minUnitsPerBill: 6,
      maxUnitsPerBill: 10,
      startMonth: 3,
      startYear: 2025,
      endMonth: 4,
      endYear: 2025,
      excludeWeekdays: [0], // Sunday
      unitPrice: 450,
      invoiceCell: "I10",
      dateCell: "I9",
      unitsCell: "G20",
      amountWordsCell: "D39",
      dateMode: "exact-range",
      exactStartDate: "15-03-2025",
      exactEndDate: "01-04-2025",
      allowMultipleInvoicesPerDay: false,
    },
  },
];
