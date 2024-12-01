import { ml_kem512, ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem';
import { performance } from 'perf_hooks';
import fs from 'fs';

const algorithms = {
  ml_kem512,
  ml_kem768,
  ml_kem1024,
};

function calculateMedian(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function measurePerformance(algorithmName, algorithm, iterations = 100) {
  const results = {
    keygen: [],
    encapsulate: [],
    decapsulate: [],
  };

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const { publicKey, secretKey: privateKey } = algorithm.keygen();
    const endTime = performance.now();
    results.keygen.push(endTime - startTime); 
  }

  const { publicKey, secretKey: privateKey } = algorithm.keygen(); 
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const { cipherText, sharedSecret } = algorithm.encapsulate(publicKey);
    const endTime = performance.now();
    results.encapsulate.push(endTime - startTime);
  }

  const { cipherText } = algorithm.encapsulate(publicKey); 
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const sharedSecret = algorithm.decapsulate(cipherText, privateKey);
    const endTime = performance.now();
    results.decapsulate.push(endTime - startTime); 
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

async function runTests() {
  const iterations = 100; 
  const allResults = [];

  for (const [name, algorithm] of Object.entries(algorithms)) {
    console.log(`Testing algorithm: ${name}...`);
    const result = await measurePerformance(name, algorithm, iterations);
    allResults.push(result);
  }

  const jsonContent = JSON.stringify(allResults, null, 2);
  fs.writeFileSync('performance_results.json', jsonContent);
  console.log("Performance results saved to 'performance_results.json'");
}

runTests().catch(console.error);