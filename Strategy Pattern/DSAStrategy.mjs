class DSAStrategy {
  // Keypair generation
  async keypair() {
    throw new Error("keypair() must be implemented");
  }

  // Signing
  async sign(message, privateKey) {
    throw new Error("sign() must be implemented");
  }

  // Verification
  async verify(signature, message, publicKey) {
    throw new Error("verify() must be implemented");
  }
}

export default DSAStrategy;
