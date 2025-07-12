// Simple test file to verify component integration
import ExcelPreviewOptions from "../src/components/ExcelPreviewOptions";

// Test that the component can be imported and has the correct interface
const testBlob = new Blob(["test"], {
  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
});

// This should compile without errors
const testComponent = (
  <ExcelPreviewOptions
    excelBlob={testBlob}
    fileName="test.xlsx"
    onClose={() => {}}
  />
);

console.log("Components test passed - no compilation errors");
