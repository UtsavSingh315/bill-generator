"use client";

import { useState } from "react";

interface ExcelPreviewOptionsProps {
  excelBlob: Blob;
  fileName: string;
  onClose: () => void;
}

export default function ExcelPreviewOptions({
  excelBlob,
  fileName,
  onClose,
}: ExcelPreviewOptionsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Google Sheets Preview - Direct approach
  const previewWithGoogleSheets = async () => {
    setIsUploading(true);
    try {
      // Download the file first
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Open Google Sheets
      setTimeout(() => {
        window.open("https://sheets.google.com/create", "_blank");
        URL.revokeObjectURL(url);
      }, 1000);

      alert(
        `✅ File downloaded successfully!\n\n📋 Next steps:\n1. Google Sheets is opening in a new tab\n2. Click "File" → "Import"\n3. Upload the downloaded file: ${fileName}\n4. Choose "Replace spreadsheet" and click "Import Data"\n\n🎯 Your Excel file will open with full formatting, formulas, and charts!`
      );
    } catch (error) {
      console.error("Google Sheets preview error:", error);
      alert(
        "❌ Error preparing Google Sheets preview. Please try the direct download option."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Microsoft Office Online Preview
  const previewWithOfficeOnline = async () => {
    setIsUploading(true);
    try {
      // Download the file first
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Open Office Online
      setTimeout(() => {
        window.open("https://office.live.com/start/Excel.aspx", "_blank");
        URL.revokeObjectURL(url);
      }, 1000);

      alert(
        `✅ File downloaded successfully!\n\n📋 Next steps:\n1. Office Online is opening in a new tab\n2. Click "Upload and open" or "Open"\n3. Select the downloaded file: ${fileName}\n\n🎯 Your Excel file will open with native Excel features and formulas!`
      );
    } catch (error) {
      console.error("Office Online preview error:", error);
      alert(
        "❌ Error preparing Office Online preview. Please try the direct download option."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced Browser Preview
  const previewInBrowser = async () => {
    try {
      const url = URL.createObjectURL(excelBlob);
      const newWindow = window.open("", "_blank");

      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Excel Preview - ${fileName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5; 
              }
              .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e0e0e0;
              }
              .download-btn {
                background: #4CAF50;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
              }
              .download-btn:hover {
                background: #45a049;
              }
              .preview-note {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                border-left: 4px solid #2196F3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Excel File Preview</h1>
                <h2>${fileName}</h2>
                <a href="${url}" download="${fileName}" class="download-btn">
                  📥 Download Excel File
                </a>
              </div>
              <div class="preview-note">
                <h3>💡 Preview Options</h3>
                <p><strong>For best viewing experience:</strong></p>
                <ul>
                  <li><strong>Download the file</strong> and open with Microsoft Excel</li>
                  <li><strong>Upload to Google Sheets</strong> for online editing</li>
                  <li><strong>Use Office Online</strong> for native Excel web experience</li>
                </ul>
                <p>Browser preview has limitations with Excel formatting, formulas, and charts.</p>
              </div>
            </div>
            <script>
              // Auto-cleanup
              setTimeout(() => {
                URL.revokeObjectURL('${url}');
              }, 300000); // 5 minutes
            </script>
          </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback: direct download
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error("Browser preview error:", error);
      alert(
        "❌ Error opening browser preview. Please try the direct download option."
      );
    }
  };

  // Direct Download
  const downloadFile = () => {
    setIsDownloading(true);
    try {
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      alert(
        `✅ Download started successfully!\n\n📁 File: ${fileName}\n💡 Open with Excel for best experience`
      );
    } catch (error) {
      console.error("Download error:", error);
      alert("❌ Error downloading file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Excel Preview Options
              </h2>
              <p className="text-sm text-gray-500 mt-1">{fileName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Google Sheets Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Google Sheets
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View with full formatting, live formulas, and collaboration
                  features
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Full Formatting
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Live Formulas
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Charts & Images
                  </span>
                </div>
                <button
                  onClick={previewWithGoogleSheets}
                  disabled={isUploading}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Opening...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                      </svg>
                      Open in Google Sheets
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Office Online Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Microsoft Office Online
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Native Excel experience with full formula support
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✅ Native Excel
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✅ Advanced Formulas
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✅ Pivot Tables
                  </span>
                </div>
                <button
                  onClick={previewWithOfficeOnline}
                  disabled={isUploading}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Opening...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                      </svg>
                      Open in Office Online
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Browser Preview Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Enhanced Browser Preview
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quick preview with download options (limited formatting)
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    ⚡ Instant
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ Limited Features
                  </span>
                </div>
                <button
                  onClick={previewInBrowser}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Quick Browser Preview
                </button>
              </div>
            </div>
          </div>

          {/* Download Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Direct Download
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Download file to open with your preferred Excel application
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    💻 Local App
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Full Features
                  </span>
                </div>
                <button
                  onClick={downloadFile}
                  disabled={isDownloading}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">
                  {isDownloading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Download Excel File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            💡 For best experience with formulas and formatting, use Google
            Sheets or Office Online
          </p>
        </div>
      </div>
    </div>
  );
}
