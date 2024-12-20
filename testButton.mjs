import Chart from "chart.js/auto";
import {
  ml_kem512,
  ml_kem768,
  ml_kem1024,
} from "@noble/post-quantum/ml-kem";
import {
  ml_dsa44,
  ml_dsa65,
  ml_dsa87,
} from "@noble/post-quantum/ml-dsa";
import {
  slh_dsa_sha2_128f, slh_dsa_sha2_128s,
  slh_dsa_sha2_192f, slh_dsa_sha2_192s,
  slh_dsa_sha2_256f, slh_dsa_sha2_256s,
  slh_dsa_shake_128f, slh_dsa_shake_128s,
  slh_dsa_shake_192f, slh_dsa_shake_192s,
  slh_dsa_shake_256f, slh_dsa_shake_256s,
} from "@noble/post-quantum/slh-dsa";

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

function saveChartAsImage(chart) {
  const link = document.createElement("a");
  link.download = "PQC_Performance_Chart.png";
  link.href = chart.toBase64Image("image/png", 1.0);
  link.click();
}


async function measurePerformance(algorithmName, algorithm, iterations = 1) {
  const operationDurations = {
    keygen: 0,
    encapsulate: 0,
    decapsulate: 0,
  };

  // Key generation performance measurement
  performance.mark("keygen-start");
  for (let i = 0; i < iterations; i++) {
    const { publicKey, secretKey } = algorithm.keygen();
  }
  performance.mark("keygen-end");
  performance.measure("Keygen", "keygen-start", "keygen-end");
  const keygenMeasure = performance.getEntriesByName("Keygen").pop();
  operationDurations.keygen = keygenMeasure.duration / iterations;

  // Encapsulation/Signing performance measurement
  const { publicKey, secretKey } = algorithm.keygen();
  const testMessage = new TextEncoder().encode("Test message");

  if (algorithm.encapsulate) {
    performance.mark("encapsulate-start");
    for (let i = 0; i < iterations; i++) {
      const { cipherText, sharedSecret } = algorithm.encapsulate(publicKey);
    }
    performance.mark("encapsulate-end");
    performance.measure("Encapsulate", "encapsulate-start", "encapsulate-end");
    const encapsulateMeasure = performance.getEntriesByName("Encapsulate").pop();
    operationDurations.encapsulate = encapsulateMeasure.duration / iterations; // 平均值計算
  } else if (algorithm.sign) {
    performance.mark("sign-start");
    for (let i = 0; i < iterations; i++) {
      const signature = algorithm.sign(secretKey, testMessage);
    }
    performance.mark("sign-end");
    performance.measure("Sign", "sign-start", "sign-end");
    const signMeasure = performance.getEntriesByName("Sign").pop();
    operationDurations.encapsulate = signMeasure.duration / iterations; // 平均值計算
  }

  // Decapsulation/Verification performance measurement
  if (algorithm.encapsulate) {
    const { cipherText } = algorithm.encapsulate(publicKey);
    performance.mark("decapsulate-start");
    for (let i = 0; i < iterations; i++) {
      const sharedSecret = algorithm.decapsulate(cipherText, secretKey);
    }
    performance.mark("decapsulate-end");
    performance.measure("Decapsulate", "decapsulate-start", "decapsulate-end");
    const decapsulateMeasure = performance.getEntriesByName("Decapsulate").pop();
    operationDurations.decapsulate = decapsulateMeasure.duration / iterations; // 平均值計算
  } else if (algorithm.verify) {
    const signature = algorithm.sign(secretKey, testMessage);
    performance.mark("verify-start");
    for (let i = 0; i < iterations; i++) {
      const isValid = algorithm.verify(publicKey, testMessage, signature);
    }
    performance.mark("verify-end");
    performance.measure("Verify", "verify-start", "verify-end");
    const verifyMeasure = performance.getEntriesByName("Verify").pop();
    operationDurations.decapsulate = verifyMeasure.duration / iterations; 
  }

  performance.clearMarks();
  performance.clearMeasures();

  return {
    algorithm: algorithmName,
    average: operationDurations,
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

  const totalAlgorithms = selectedAlgorithms.length;

  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", totalAlgorithms.toString());
  progressBar.setAttribute("aria-valuenow", "0");
  progressBar.style.width = "0%";

  const allResults = [];

  for (let i = 0; i < totalAlgorithms; i++) {
    const [name, algorithm] = selectedAlgorithms[i];

    progressLabel.textContent = `Testing ${name} (${i + 1}/${totalAlgorithms})...`;
    console.log(`Testing algorithm: ${name}...`);

    const result = await measurePerformance(name, algorithm, iterations);
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
      const saveImageButton = document.getElementById("saveImageButton");

      saveCsvButton.style.display = "block";
      saveImageButton.style.display = "block";

      saveCsvButton.replaceWith(saveCsvButton.cloneNode(true));
      saveImageButton.replaceWith(saveImageButton.cloneNode(true));

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
      const closeButton = document.getElementById("closeButton1");
      closeButton.style.display = "block";
    }
  });
});