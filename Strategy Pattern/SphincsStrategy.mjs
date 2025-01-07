import DSAStrategy from "./DSAStrategy.mjs";

class SphincsStrategy extends DSAStrategy {
  constructor(algorithmModule) {
    super();
    this.algorithm = algorithmModule; 
  }

  async keypair() {
    return await this.algorithm.keypair();
  }

  async sign(message, privateKey) {
    return await this.algorithm.sign(message, privateKey);
  }

  async verify(signature, message, publicKey) {
    return await this.algorithm.verify(signature, message, publicKey);
  }
}

export default SphincsStrategy;