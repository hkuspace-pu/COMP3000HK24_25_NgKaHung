import AlgorithmFactory from './AlgorithmFactory.mjs';

class PerformanceTester {
  constructor(algorithmName, initialize = false, iterations = 1) {
    this.algorithmName = algorithmName;
    this.initialize = initialize;
    this.iterations = iterations;
    this.algorithm = null;
    this.totalTimes = {
      keygen: 0,
      encapsulate: 0,
      decapsulate: 0,
      keygenStdDev: 0,        
      encapsulateStdDev: 0,    
      decapsulateStdDev: 0,    
    };
    this.keygenTimes = [];    
    this.encapsulationTimes = [];
    this.decapsulationTimes = [];
    this.testMessage = new Uint8Array([0x44, 0x61, 0x73, 0x68, 0x6c, 0x61, 0x6e, 0x65]); // "Dashlane"
  }

  async initializeAlgorithm() {
    this.algorithm = await AlgorithmFactory.createAlgorithm(this.algorithmName, this.initialize);
  }

  calculateStdDev(times) {
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
    return Math.sqrt(variance);
  }

  async testKeypairGeneration() {
    if (this.algorithmName.startsWith("sphincs")) {
      for (let i = 0; i < this.iterations; i++) {
        const startTime = performance.now();
        const { publicKey, privateKey } = await this.algorithm.keypair();
        const endTime = performance.now();
        this.keygenTimes.push(endTime - startTime);
      }

      this.totalTimes.keygen = this.keygenTimes.reduce((a, b) => a + b, 0) / this.iterations;
      this.totalTimes.keygenStdDev = this.calculateStdDev(this.keygenTimes);
    } else {
      const startTime = performance.now();
      for (let i = 0; i < this.iterations; i++) {
        const { publicKey, privateKey } = await this.algorithm.keypair();
      }
      const endTime = performance.now();
      this.totalTimes.keygen = (endTime - startTime) / this.iterations;
    }
  }

  async testEncapsulation() {
    const { publicKey, privateKey } = await this.algorithm.keypair();

    if (this.algorithmName.startsWith("sphincs")) {
      for (let i = 0; i < this.iterations; i++) {
        const encapsulateStart = performance.now();
        const { ciphertext, sharedSecret } = await this.algorithm.encapsulate(publicKey);
        const encapsulateEnd = performance.now();
        this.encapsulationTimes.push(encapsulateEnd - encapsulateStart);

        const decapsulateStart = performance.now();
        const { sharedSecret: decapsulatedSecret } = await this.algorithm.decapsulate(
          ciphertext,
          privateKey
        );
        const decapsulateEnd = performance.now();
        this.decapsulationTimes.push(decapsulateEnd - decapsulateStart);
      }

      this.totalTimes.encapsulate =
        this.encapsulationTimes.reduce((a, b) => a + b, 0) / this.iterations;
      this.totalTimes.decapsulate =
        this.decapsulationTimes.reduce((a, b) => a + b, 0) / this.iterations;
      this.totalTimes.encapsulateStdDev = this.calculateStdDev(this.encapsulationTimes);
      this.totalTimes.decapsulateStdDev = this.calculateStdDev(this.decapsulationTimes);
    } else {
      const encapsulateStartTime = performance.now();
      for (let i = 0; i < this.iterations; i++) {
        const { ciphertext, sharedSecret } = await this.algorithm.encapsulate(publicKey);
      }
      const encapsulateEndTime = performance.now();
      this.totalTimes.encapsulate =
        (encapsulateEndTime - encapsulateStartTime) / this.iterations;

      const { ciphertext } = await this.algorithm.encapsulate(publicKey);
      const decapsulateStartTime = performance.now();
      for (let i = 0; i < this.iterations; i++) {
        const { sharedSecret } = await this.algorithm.decapsulate(ciphertext, privateKey);
      }
      const decapsulateEndTime = performance.now();
      this.totalTimes.decapsulate =
        (decapsulateEndTime - decapsulateStartTime) / this.iterations;
    }
  }

  async testSigning() {
    const { publicKey, privateKey } = await this.algorithm.keypair();

    const signStartTime = performance.now();
    for (let i = 0; i < this.iterations; i++) {
      const { signature } = await this.algorithm.sign(this.testMessage, privateKey);
    }
    const signEndTime = performance.now();
    this.totalTimes.encapsulate = (signEndTime - signStartTime) / this.iterations;

    const { signature } = await this.algorithm.sign(this.testMessage, privateKey);
    const verifyStartTime = performance.now();
    for (let i = 0; i < this.iterations; i++) {
      const isValid = await this.algorithm.verify(signature, this.testMessage, publicKey);
    }
    const verifyEndTime = performance.now();
    this.totalTimes.decapsulate = (verifyEndTime - verifyStartTime) / this.iterations;
  }

  async runTests() {
    await this.initializeAlgorithm();

    await this.testKeypairGeneration();

    if (this.algorithm.encapsulate) {
      await this.testEncapsulation();
    } else if (this.algorithm.sign) {
      await this.testSigning();
    }

    return {
      algorithm: this.algorithmName,
      average: this.totalTimes,
    };
  }
}

export default PerformanceTester;