import ml_kem512 from './node_modules/@dashlane/pqc-kem-kyber512-browser/dist/pqc-kem-kyber512.js';
import ml_kem768 from './node_modules/@dashlane/pqc-kem-kyber768-browser/dist/pqc-kem-kyber768.js';
import ml_kem1024 from './node_modules/@dashlane/pqc-kem-kyber1024-browser/dist/pqc-kem-kyber1024.js';

import ml_dsa44 from './node_modules/@dashlane/pqc-sign-dilithium2-browser/dist/pqc-sign-dilithium2.js';
import ml_dsa65 from './node_modules/@dashlane/pqc-sign-dilithium3-browser/dist/pqc-sign-dilithium3.js';
import ml_dsa87 from './node_modules/@dashlane/pqc-sign-dilithium5-browser/dist/pqc-sign-dilithium5.js';

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

import falcon_512 from './node_modules/@dashlane/pqc-sign-falcon-512-browser/dist/pqc-sign-falcon-512.js';
import falcon_1024 from './node_modules/@dashlane/pqc-sign-falcon-1024-browser/dist/pqc-sign-falcon-1024.js';


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

function calculateMedian(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function measurePerformance(algorithmName, algorithmBuilder, iterations = 1) {
  const algorithm = await algorithmBuilder();
  const results = {
    keygen: [],
    encapsulate: [],
    decapsulate: [],
  };

  // Key generation performance measurement
  for (let i = 0; i < iterations; i++) {
    performance.mark("keygen-start");
    const { publicKey, privateKey } = await algorithm.keypair();
    performance.mark("keygen-end");

    performance.measure("Keygen", "keygen-start", "keygen-end");
    const keygenMeasure = performance.getEntriesByName("Keygen").pop();

    results.keygen.push(keygenMeasure.duration);

    performance.clearMarks();
    performance.clearMeasures();
    const testMessage = new Uint8Array([0x44, 0x61, 0x73, 0x68, 0x6c, 0x61, 0x6e, 0x65]);

    // Encapsulation or Signing performance measurement
    if (algorithm.encapsulate) {
      performance.mark("encapsulate-start");
      const { ciphertext, sharedSecret } = await algorithm.encapsulate(publicKey);
      performance.mark("encapsulate-end");
      performance.measure("Encapsulate", "encapsulate-start", "encapsulate-end");
      results.encapsulate.push(
        performance.getEntriesByName("Encapsulate").pop().duration
      );

      performance.mark("decapsulate-start");
      const { sharedSecret: sharedSecretB } = await algorithm.decapsulate(
        ciphertext,
        privateKey
      );
      performance.mark("decapsulate-end");
      performance.measure("Decapsulate", "decapsulate-start", "decapsulate-end");
      results.decapsulate.push(
        performance.getEntriesByName("Decapsulate").pop().duration
      );
    } else if (algorithm.sign) {
      performance.mark("sign-start");
      const { signature } = await algorithm.sign(testMessage, privateKey);
      performance.mark("sign-end");
      performance.measure("Sign", "sign-start", "sign-end");
      results.encapsulate.push(
        performance.getEntriesByName("Sign").pop().duration
      );

      performance.mark("verify-start");
      const validSignature = await algorithm.verify(
        signature,
        testMessage,
        publicKey
      );
      performance.mark("verify-end");
      performance.measure("Verify", "verify-start", "verify-end");
      results.decapsulate.push(
        performance.getEntriesByName("Verify").pop().duration
      );
    }

    performance.clearMarks();
    performance.clearMeasures();
  }

  return {
    algorithm: algorithmName,
    median: {
      keygen: calculateMedian(results.keygen),
      encapsulate: calculateMedian(results.encapsulate),
      decapsulate: calculateMedian(results.decapsulate),
    },
    results,
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
        text: "Median Execution Time (ms)",
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
        keygen: "keygen",
        encapsulate: "encapsulate/sign",
        decapsulate: "decapsulate/verify",
      };

      chart.data.datasets = operations.map((operation) => ({
        label: operationDisplayNames[operation],
        data: results.map((result) => ({
          x: result.algorithm,
          y: result.median[operation] || 0.01,
        })),
        backgroundColor: colors[operation],
        pointStyle: pointStyles[operation],
        pointRadius: 10,
      }));

      chart.update();

    } catch (error) {
      console.error("Error running tests:", error);
      alert("Failed to run tests. Check the console for details.");
    } finally {
      const close = document.getElementById("closeButton1");
      close.style.display = "block";
    }
  });
});