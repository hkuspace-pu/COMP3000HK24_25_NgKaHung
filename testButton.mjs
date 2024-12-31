import ml_kem512 from './PQC WebAssembly/pqc-kem-kyber512-browser/dist/pqc-kem-kyber512.js';
import ml_kem768 from './PQC WebAssembly/pqc-kem-kyber768-browser/dist/pqc-kem-kyber768.js';
import ml_kem1024 from './PQC WebAssembly/pqc-kem-kyber1024-browser/dist/pqc-kem-kyber1024.js';

import ml_dsa44 from './PQC WebAssembly/pqc-sign-dilithium2-browser/dist/pqc-sign-dilithium2.js';
import ml_dsa65 from './PQC WebAssembly/pqc-sign-dilithium3-browser/dist/pqc-sign-dilithium3.js';
import ml_dsa87 from './PQC WebAssembly/pqc-sign-dilithium5-browser/dist/pqc-sign-dilithium5.js';

import slh_dsa_sha2_128f from './SPHINCS/pqc-sign-sphincs-sha256-128f-robust-browser/package/dist/pqc-sign-sphincs-sha256-128f-robust.js';
import slh_dsa_sha2_128s from './SPHINCS/pqc-sign-sphincs-sha256-128s-robust-browser/package/dist/pqc-sign-sphincs-sha256-128s-robust.js';
import slh_dsa_sha2_192f from './SPHINCS/pqc-sign-sphincs-sha256-192f-robust-browser/package/dist/pqc-sign-sphincs-sha256-192f-robust.js';
import slh_dsa_sha2_192s from './SPHINCS/pqc-sign-sphincs-sha256-192s-robust-browser/package/dist/pqc-sign-sphincs-sha256-192s-robust.js';
import slh_dsa_sha2_256f from './SPHINCS/pqc-sign-sphincs-sha256-256f-robust-browser/package/dist/pqc-sign-sphincs-sha256-256f-robust.js';
import slh_dsa_sha2_256s from './SPHINCS/pqc-sign-sphincs-sha256-256s-robust-browser/package/dist/pqc-sign-sphincs-sha256-256s-robust.js';
import slh_dsa_shake_128f from './SPHINCS/pqc-sign-sphincs-shake256-128f-robust-browser/package/dist/pqc-sign-sphincs-shake256-128f-robust.js';
import slh_dsa_shake_128s from './SPHINCS/pqc-sign-sphincs-shake256-128s-robust-browser/package/dist/pqc-sign-sphincs-shake256-128s-robust.js';
import slh_dsa_shake_192f from './SPHINCS/pqc-sign-sphincs-shake256-192f-robust-browser/package/dist/pqc-sign-sphincs-shake256-192f-robust.js';
import slh_dsa_shake_192s from './SPHINCS/pqc-sign-sphincs-shake256-192s-robust-browser/package/dist/pqc-sign-sphincs-shake256-192s-robust.js';
import slh_dsa_shake_256f from './SPHINCS/pqc-sign-sphincs-shake256-256f-robust-browser/package/dist/pqc-sign-sphincs-shake256-256f-robust.js';
import slh_dsa_shake_256s from './SPHINCS/pqc-sign-sphincs-shake256-256s-robust-browser/package/dist/pqc-sign-sphincs-shake256-256s-robust.js';

import falcon_512 from './PQC WebAssembly/pqc-sign-falcon-512-browser/dist/pqc-sign-falcon-512.js';
import falcon_1024 from './PQC WebAssembly/pqc-sign-falcon-1024-browser/dist/pqc-sign-falcon-1024.js';

import { Chart, registerables } from "https://cdn.jsdelivr.net/npm/chart.js/+esm";

Chart.register(...registerables);


const algorithms = {
  kyber: {
    ml_kem512,
    ml_kem768,
    ml_kem1024,
  },
  dilithium: {
    ml_dsa44,
    ml_dsa65,
    ml_dsa87,
  },
  sphincs: {
    slh_dsa_sha2_128f, slh_dsa_sha2_128s,
    slh_dsa_sha2_192f, slh_dsa_sha2_192s,
    slh_dsa_sha2_256f, slh_dsa_sha2_256s,
    slh_dsa_shake_128f, slh_dsa_shake_128s,
    slh_dsa_shake_192f, slh_dsa_shake_192s,
    slh_dsa_shake_256f, slh_dsa_shake_256s,
  },
  falcon:{
    falcon_512,
    falcon_1024
  }
};

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

async function measurePerformance(algorithmName, algorithmBuilder, iterations = 1) {
  const algorithm = await algorithmBuilder(true);
  const totalTimes = {
    keygen: 0,
    encapsulate: 0,
    decapsulate: 0,
  };

  const testMessage = new Uint8Array([0x44, 0x61, 0x73, 0x68, 0x6c, 0x61, 0x6e, 0x65]); // "Dashlane" in ASCII

  // Measure Key Generation
  const keygenStartTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    const { publicKey, privateKey } = await algorithm.keypair();
  }
  const keygenEndTime = performance.now();
  totalTimes.keygen = (keygenEndTime - keygenStartTime) / iterations;

  if (algorithm.encapsulate) {
    // Generate keypair once for encapsulation and decapsulation
    const { publicKey, privateKey } = await algorithm.keypair();

    // Measure Encapsulation
    const encapsulateStartTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      const { ciphertext, sharedSecret } = await algorithm.encapsulate(publicKey);
    }
    const encapsulateEndTime = performance.now();
    totalTimes.encapsulate = (encapsulateEndTime - encapsulateStartTime) / iterations;

    // Measure Decapsulation
    const { ciphertext } = await algorithm.encapsulate(publicKey);
    const decapsulateStartTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      const { sharedSecret } = await algorithm.decapsulate(ciphertext, privateKey);
    }
    const decapsulateEndTime = performance.now();
    totalTimes.decapsulate = (decapsulateEndTime - decapsulateStartTime) / iterations;
  } else if (algorithm.sign) {
    // Generate keypair once for signing and verifying
    const { publicKey, privateKey } = await algorithm.keypair();

    // Measure Signing
    const signStartTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      const { signature } = await algorithm.sign(testMessage, privateKey);
    }
    const signEndTime = performance.now();
    totalTimes.encapsulate = (signEndTime - signStartTime) / iterations; // Store signing time as encapsulate

    // Measure Verification
    const { signature } = await algorithm.sign(testMessage, privateKey);
    const verifyStartTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      const validSignature = await algorithm.verify(signature, testMessage, publicKey);
    }
    const verifyEndTime = performance.now();
    totalTimes.decapsulate = (verifyEndTime - verifyStartTime) / iterations; // Store verification time as decapsulate
  }

  return {
    algorithm: algorithmName,
    average: {
      keygen: totalTimes.keygen,
      encapsulate: totalTimes.encapsulate,
      decapsulate: totalTimes.decapsulate,
    },
  };
}
async function runTestsWithProgress() {
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");

  const iterationsInput = document.getElementById("iterations").value;
  const iterations = parseInt(iterationsInput, 10) || 1;

  const selectedAlgorithms = [];
  if (document.getElementById("kyber").checked) {
    selectedAlgorithms.push(...Object.entries(algorithms.kyber));
  }
  if (document.getElementById("Dilithium").checked) {
    selectedAlgorithms.push(...Object.entries(algorithms.dilithium));
  }
  if (document.getElementById("SPHINCS").checked) {
    selectedAlgorithms.push(...Object.entries(algorithms.sphincs));
  }
  if (document.getElementById("FALCON").checked) {
    selectedAlgorithms.push(...Object.entries(algorithms.falcon));
  }

  const totalAlgorithms = selectedAlgorithms.length;

  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", totalAlgorithms.toString());
  progressBar.setAttribute("aria-valuenow", "0");
  progressBar.style.width = "0%";

  const allResults = [];

  for (let i = 0; i < totalAlgorithms; i++) {
    const [name, algorithmBuilder] = selectedAlgorithms[i];

    progressLabel.textContent = `Testing ${name} (${i + 1}/${totalAlgorithms})...`;
    console.log(`Testing algorithm: ${name}...`);

    const result = await measurePerformance(name, algorithmBuilder, iterations);
    allResults.push(result);

    const progressPercentage = ((i + 1) / totalAlgorithms) * 100;

    progressBar.setAttribute("aria-valuenow", (i + 1).toString());
    progressBar.style.width = `${progressPercentage}%`;

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  progressLabel.textContent = "All tests completed!";
  progressBar.setAttribute("aria-valuenow", totalAlgorithms.toString());
  progressBar.style.width = "100%";

  const closeButton = document.getElementById("closeButton");
  closeButton.style.display = "block";

  return allResults;
}
const operations = ["keygen", "encapsulate", "decapsulate"];
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
const scatterData = { datasets: [] };

const scatterOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        usePointStyle: true,
      },
    },
  },
  scales: {
    x: {
      type: "category",
      title: {
        display: true,
        text: "Algorithm",
      },
    },
    y: {
      type: "logarithmic",
      beginAtZero: false,
      title: {
        display: true,
        text: "Mean Execution Time (ms)",
      },
      ticks: {
        callback: function (value) {
          return Number(value).toLocaleString();
        },
      },
    },
  },
};


window.addEventListener("load", () => {
  const ctx = document.getElementById("performanceScatterPlot").getContext("2d");
  const chart = new Chart(ctx, {
    type: "scatter",
    data: scatterData,
    options: scatterOptions,
  });

  document.getElementById("runTestButton").addEventListener("click", async () => {
    try {
      const results = await runTestsWithProgress();

      const operationDisplayNames = {
        keygen: "Key Generation",
        encapsulate: "Encapsulation/Signing",
        decapsulate: "Decapsulation/Verification",
      };

      chart.data.datasets = operations.map((operation) => ({
        label: operationDisplayNames[operation],
        data: results.map((result) => ({
          x: result.algorithm,
          y: result.average[operation] || 0.01,
        })),
        backgroundColor: colors[operation],
        pointStyle: pointStyles[operation],
        pointRadius: 10,
      }));

      chart.update();
      const saveCsvButton = document.getElementById("saveCsvButton");
      document.getElementById("saveCsvButton").style.display = "block";
      document.getElementById("saveImageButton").style.display = "block";

      saveCsvButton.replaceWith(saveCsvButton.cloneNode(true));
      document.getElementById("saveCsvButton").addEventListener("click", () => {
        saveResultsAsCsv(results);
      });

      document.getElementById("saveImageButton").addEventListener("click", () => {
        saveChartAsImage(chart);
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