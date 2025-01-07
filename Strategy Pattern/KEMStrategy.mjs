
class KEMStrategy {
    // Keypair generation
    async keypair() {
        throw new Error("keypair() must be implemented");
    }

    // Encapsulation (for KEM algorithms)
    async encapsulate(publicKey) {
        throw new Error("encapsulate() must be implemented");
    }

    // Decapsulation (for KEM algorithms)
    async decapsulate(ciphertext, privateKey) {
        throw new Error("decapsulate() must be implemented");
    }
}

export default KEMStrategy;