import ChartManager from "./ChartManager.mjs";
import AlgorithmTester from "./AlgorithmTester.mjs";
import ProgressTracker from "./ProgressTracker.mjs";

const colors = {
  keygen: "rgba(255, 99, 132, 1)",
  encapsulate: "rgba(54, 162, 235, 1)",
  decapsulate: "rgba(75, 192, 192, 1)",
};
const pointStyles = {
  keygen: "triangle",
  encapsulate: "rectRounded",
  decapsulate: "circle",
};
const operationDisplayNames = {
  keygen: "Key Generation",
  encapsulate: "Encapsulation/Signing",
  decapsulate: "Decapsulation/Verification",
};
const operations = ["keygen", "encapsulate", "decapsulate"];

function saveResultsAsCsv(results) {
  const csvHeaders = ["Algorithm", "Operation", "Mean Time (ms)"];
  const csvRows = [csvHeaders.join(",")];

  results.forEach((result) => {
    Object.entries(result.average).forEach(([operation, averageTime]) => {
      csvRows.push(`${result.algorithm},${operation},${averageTime}`);
    });
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "PQC_Performance_Results.csv";
  a.click();

  URL.revokeObjectURL(url);
}

window.addEventListener("load", () => {
  const chartManager = new ChartManager("performanceScatterPlot");
  chartManager.initialize();

  const progressTracker = new ProgressTracker();

  document.getElementById("runTestButton").addEventListener("click", async () => {
    try {
      const iterationsInput = document.getElementById("iterations").value;
      const iterations = parseInt(iterationsInput, 10) || 1;

      const inputs = {
        kyber: document.getElementById("kyber").checked,
        dilithium: document.getElementById("Dilithium").checked,
        sphincs: document.getElementById("SPHINCS").checked,
        falcon: document.getElementById("FALCON").checked,
      };
      const isChart1Page = window.location.pathname.includes("/charts2");
      console.log(window.location.pathname)
      const initialize = !isChart1Page;
      console.log(initialize)
      const tester = new AlgorithmTester(iterations, initialize, progressTracker);
      tester.setSelectedAlgorithms(inputs);

      const totalAlgorithms = tester.selectedAlgorithms.length;
      if (totalAlgorithms === 0) {
        alert("Please select at least one algorithm to test.");
        return;
      }

      chartManager.reset(); 

      const results = await tester.runAllTests();

      chartManager.updateDatasets(results, operations, operationDisplayNames, colors, pointStyles);

      const saveCsvButton = document.getElementById("saveCsvButton");
      saveCsvButton.style.display = "block";

      saveCsvButton.replaceWith(saveCsvButton.cloneNode(true));
      document.getElementById("saveCsvButton").addEventListener("click", () => {
        saveResultsAsCsv(results);
      });

    } catch (error) {
      console.error("Error running tests:", error);
      alert("Failed to run tests. Check the console for details.");
    } finally {
      const close = document.getElementById("closeButton1");
      close.style.display = "block";
    }
  });
});