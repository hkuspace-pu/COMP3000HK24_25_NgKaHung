import PerformanceTester from './PerformanceTester.mjs';

class AlgorithmTester {
  constructor(iterations = 1, initialize = true, progressTracker = null) {
    this.iterations = iterations;
    this.initialize = initialize;
    this.selectedAlgorithms = [];
    this.results = []; 
    this.progressTracker = progressTracker; 
  }

  setSelectedAlgorithms(inputs) {
    if (inputs.kyber) {
      this.selectedAlgorithms.push("kyber512", "kyber768", "kyber1024");
    }
    if (inputs.dilithium) {
      this.selectedAlgorithms.push("dilithium2", "dilithium3", "dilithium5");
    }
    if (inputs.sphincs) {
      this.selectedAlgorithms.push(
        "sphincs_sha2_128f",
        "sphincs_sha2_128s",
        "sphincs_sha2_192f",
        "sphincs_sha2_192s",
        "sphincs_sha2_256f",
        "sphincs_sha2_256s",
        "sphincs_shake_128f",
        "sphincs_shake_128s",
        "sphincs_shake_192f",
        "sphincs_shake_192s",
        "sphincs_shake_256f",
        "sphincs_shake_256s"
      );
    }
    if (inputs.falcon) {
      this.selectedAlgorithms.push("falcon512", "falcon1024");
    }
  }

  async testSingleAlgorithm(algorithmName) {
    try {
      const tester = new PerformanceTester(algorithmName, this.initialize, this.iterations);
      const result = await tester.runTests(); 
      return result;
    } catch (error) {
      console.error(`Error testing algorithm ${algorithmName}:`, error.message);
      return { algorithm: algorithmName, error: error.message };
    }
  }

  async runAllTests() {
    this.results = [];
    const totalAlgorithms = this.selectedAlgorithms.length;

    this.progressTracker.initialize(totalAlgorithms);

    for (let i = 0; i < totalAlgorithms; i++) {
      const algorithmName = this.selectedAlgorithms[i];

      const progressText = `Testing ${algorithmName} (${i + 1}/${totalAlgorithms})...`;
      this.progressTracker.updateLabel(progressText);
      this.progressTracker.updateProgress(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const result = await this.testSingleAlgorithm(algorithmName);
      this.results.push(result);
    }

    if (this.progressTracker) {
      this.progressTracker.completeProgress(); 
    }

    return this.results;
  }
}

export default AlgorithmTester;