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

// 定義所有算法
const algorithms = {
  // KEM 算法
  ml_kem512,
  ml_kem768,
  ml_kem1024,
  // DSA 算法
  ml_dsa44,
  ml_dsa65,
  ml_dsa87,
  slh_dsa_sha2_128f, slh_dsa_sha2_128s,
  slh_dsa_sha2_192f, slh_dsa_sha2_192s,
  slh_dsa_sha2_256f, slh_dsa_sha2_256s,
  slh_dsa_shake_128f, slh_dsa_shake_128s,
  slh_dsa_shake_192f, slh_dsa_shake_192s,
  slh_dsa_shake_256f, slh_dsa_shake_256s,
};

// 計算中位數的函數
function calculateMedian(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// 測試函數 (支持 KEM 和 DSA)
async function measurePerformance(algorithmName, algorithm, iterations = 1) {
  const results = {
    keygen: [],
    encapsulate: [], // 對 KEM 是 encapsulate，對 DSA 是 sign
    decapsulate: [], // 對 KEM 是 decapsulate，對 DSA 是 verify
  };

  // 測試密鑰生成 (通用)
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const { publicKey, secretKey } = algorithm.keygen();
    const endTime = performance.now();
    results.keygen.push(endTime - startTime);
  }

  // 測試加密/簽名
  const { publicKey, secretKey } = algorithm.keygen(); // 生成密鑰對
  const testMessage = new TextEncoder().encode("Test message"); // 測試消息
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    if (algorithm.encapsulate) {
      // KEM: 封裝密鑰
      const { cipherText, sharedSecret } = algorithm.encapsulate(publicKey);
    } else if (algorithm.sign) {
      // DSA: 簽名
      const signature = algorithm.sign(secretKey, testMessage);
    }
    const endTime = performance.now();
    results.encapsulate.push(endTime - startTime);
  }

  // 測試解密/驗簽
  if (algorithm.encapsulate) {
    // KEM: 測試解密
    const { cipherText } = algorithm.encapsulate(publicKey); // 生成密文
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const sharedSecret = algorithm.decapsulate(cipherText, secretKey);
      const endTime = performance.now();
      results.decapsulate.push(endTime - startTime);
    }
  } else if (algorithm.verify) {
    // DSA: 測試驗簽
    const signature = algorithm.sign(secretKey, testMessage); // 生成簽名
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const isValid = algorithm.verify(publicKey, testMessage, signature);
      const endTime = performance.now();
      results.decapsulate.push(endTime - startTime);
    }
  }

  // 計算中位數並返回
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

// 主測試函數
async function runTestsWithProgress() {
  const iterations = 1; // 每個操作測試 1 次
  const allResults = [];
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");

  const algorithmNames = Object.keys(algorithms);
  const totalAlgorithms = algorithmNames.length;

  progressBar.max = totalAlgorithms; // 設置進度條最大值
  progressBar.value = 0; // 初始化進度條

  for (let i = 0; i < totalAlgorithms; i++) {
    const name = algorithmNames[i];
    const algorithm = algorithms[name];

    progressLabel.textContent = `Testing ${name} (${i + 1}/${totalAlgorithms})...`;
    console.log(`Testing algorithm: ${name}...`);

    const result = await measurePerformance(name, algorithm, iterations);
    allResults.push(result);

    // 更新進度條
    progressBar.value = i + 1;

    // 插入短暫延遲，允許瀏覽器更新進度條
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  progressLabel.textContent = "All tests completed!";
  return allResults;
}

// 初始化圖表數據
const operations = ["keygen", "encapsulate", "decapsulate"];
const colors = {
  keygen: "rgba(255, 99, 132, 1)", // 紅色
  encapsulate: "rgba(54, 162, 235, 1)", // 藍色
  decapsulate: "rgba(75, 192, 192, 1)", // 綠色
};
const pointStyles = {
  keygen: "triangle",
  encapsulate: "rectRounded",
  decapsulate: "circle",
};
const scatterData = { datasets: [] };

// 配置對數圖表
const scatterOptions = {
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

// 初始化圖表
window.addEventListener("load", () => {
  const ctx = document.getElementById("performanceScatterPlot").getContext("2d");
  const chart = new Chart(ctx, {
    type: "scatter",
    data: scatterData,
    options: scatterOptions,
  });

  // 按鈕點擊事件
  document.getElementById("runTestButton").addEventListener("click", async () => {
    try {
      const results = await runTestsWithProgress();
      
      // 更新圖表數據
      chart.data.datasets = operations.map((operation) => ({
        label: operation.charAt(0).toUpperCase() + operation.slice(1),
        data: results.map((result) => ({
          x: result.algorithm,
          y: result.median[operation] || 0.01, // 防止對數尺度中出現 0
        })),
        backgroundColor: colors[operation],
        pointStyle: pointStyles[operation],
        pointRadius: 10,
      }));

      // 更新圖表
      chart.update();
    } catch (error) {
      console.error("Error running tests:", error);
      alert("Failed to run tests. Check the console for details.");
    } finally{
      const close = document.getElementById("closeButton");
      close.style.display = "block";
    }
  });
});