import KEMStrategy from "./KEMStrategy.mjs";

class KyberStrategy extends KEMStrategy{
  constructor(algorithmModule) {
    super();
    this.algorithm = algorithmModule;
  }

  async keypair() {
    return await this.algorithm.keypair();
  }

  async encapsulate(publicKey) {
    return await this.algorithm.encapsulate(publicKey);
  }

  async decapsulate(ciphertext, privateKey) {
    return await this.algorithm.decapsulate(ciphertext, privateKey);
  }
}

export default KyberStrategy;