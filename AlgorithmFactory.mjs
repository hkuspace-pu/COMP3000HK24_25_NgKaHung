
import KyberStrategy from "./Strategy Pattern/KyberStrategy.mjs";
import DilithiumStrategy from "./Strategy Pattern/DilithiumStrategy.mjs";
import SphincsStrategy from "./Strategy Pattern/SphincsStrategy.mjs";
import FalconStrategy from "./Strategy Pattern/FalconStrategy.mjs";

import ml_kem512 from './PQC WebAssembly/pqc-kem-kyber512-browser/dist/pqc-kem-kyber512.js';
import ml_kem768 from './PQC WebAssembly/pqc-kem-kyber768-browser/dist/pqc-kem-kyber768.js';
import ml_kem1024 from './PQC WebAssembly/pqc-kem-kyber1024-browser/dist/pqc-kem-kyber1024.js';

import ml_dsa44 from './PQC WebAssembly/pqc-sign-dilithium2-browser/dist/pqc-sign-dilithium2.js';
import ml_dsa65 from './PQC WebAssembly/pqc-sign-dilithium3-browser/dist/pqc-sign-dilithium3.js';
import ml_dsa87 from './PQC WebAssembly/pqc-sign-dilithium5-browser/dist/pqc-sign-dilithium5.js';

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

import falcon_512 from './PQC WebAssembly/pqc-sign-falcon-512-browser/dist/pqc-sign-falcon-512.js';
import falcon_1024 from './PQC WebAssembly/pqc-sign-falcon-1024-browser/dist/pqc-sign-falcon-1024.js';

class AlgorithmFactory {
  static async createAlgorithm(name, initialize = false) {
    switch (name) {
      // Kyber Algorithms
      case "kyber512": {
        const instance = await ml_kem512(initialize);
        return new KyberStrategy(instance);
      }
      case "kyber768": {
        const instance = await ml_kem768(initialize);
        return new KyberStrategy(instance);
      }
      case "kyber1024":{
        const instance = await ml_kem1024(initialize);
        return new KyberStrategy(instance);
      }
      // Dilithium Algorithms
      case "dilithium2":{
        const instance = await ml_dsa44(initialize);
        return new DilithiumStrategy(instance);
      }
      case "dilithium3":{
        const instance = await ml_dsa65(initialize);

        return new DilithiumStrategy(instance);
      }
      case "dilithium5":{
        const instance = await ml_dsa87(initialize);

        return new DilithiumStrategy(instance);
      }
      // SPHINCS Algorithms
      case "sphincs_sha2_128f": {
        const instance = await slh_dsa_sha2_128f(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_sha2_128s": {
        const instance = await slh_dsa_sha2_128s(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_sha2_192f": {
        const instance = await slh_dsa_sha2_192f(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_sha2_192s": {
        const instance = await slh_dsa_sha2_192s(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_sha2_256f": {
        const instance = await slh_dsa_sha2_256f(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_sha2_256s": {
        const instance = await slh_dsa_sha2_256s(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_shake_128f": {
        const instance = await slh_dsa_shake_128f(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_shake_128s": {
        const instance = await slh_dsa_shake_128s(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_shake_192f": {
        const instance = await slh_dsa_shake_192f(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_shake_192s": {
        const instance = await slh_dsa_shake_192s(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_shake_256f": {
        const instance = await slh_dsa_shake_256f(initialize);
        return new SphincsStrategy(instance);
      }
      case "sphincs_shake_256s": {
        const instance = await slh_dsa_shake_256s(initialize);
        return new SphincsStrategy(instance);
      }

      // Falcon Algorithms
      case "falcon512": {
        const instance = await falcon_512(initialize);
        return new FalconStrategy(instance);
      }
      case "falcon1024": {
        const instance = await falcon_1024(initialize);
        return new FalconStrategy(instance);
      }

      default:
        throw new Error(`Algorithm ${name} is not supported.`);
    }
  }
}
export default AlgorithmFactory;