import * as openpgp from "openpgp";
import { ml_kem512, ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem';
import { Buffer } from 'buffer';
import { performance } from 'perf_hooks';
import pidusage from 'pidusage';
import fs from 'fs';
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

  const algorithmsSign = {
    "ml_dsa44": ml_dsa44,
    "ml_dsa65": ml_dsa65,
    "ml_dsa87": ml_dsa87,
    "slh_dsa_sha2_128f": slh_dsa_sha2_128f,
    "slh_dsa_sha2_128s": slh_dsa_sha2_128s,
    "slh_dsa_sha2_192f": slh_dsa_sha2_192f,
    "slh_dsa_sha2_192s": slh_dsa_sha2_192s,
    "slh_dsa_sha2_256f": slh_dsa_sha2_256f,
    "slh_dsa_sha2_256s": slh_dsa_sha2_256s,
    "slh_dsa_shake_128f": slh_dsa_shake_128f,
    "slh_dsa_shake_128s": slh_dsa_shake_128s,
    "slh_dsa_shake_192f": slh_dsa_shake_192f,
    "slh_dsa_shake_192s": slh_dsa_shake_192s,
    "slh_dsa_shake_256f": slh_dsa_shake_256f,
    "slh_dsa_shake_256s": slh_dsa_shake_256s,
  };

const algorithms = {
    'ml_kem512': ml_kem512,
    'ml_kem768': ml_kem768,
    'ml_kem1024': ml_kem1024
};

function hexToUint8Array(hex) {
    const length = hex.length / 2;
    const uint8Array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        uint8Array[i] = parseInt(hex.substr(i * 2, 2), 16);
    }

    return uint8Array;
}

function uint8ArrayToHex(uint8Array) {
    return Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export function keygen(algorithm) {
    const keys = algorithm.keygen();
    return keys;
}

export function encapsulate(algorithm, publicKey) {
    const { cipherText, sharedSecret: sharedKey } = algorithm.encapsulate(publicKey);
    return { cipherText, sharedSecret: sharedKey };
}

export function decapsulate(algorithm, cipherText, privateKey) {
    const sharedKey = algorithm.decapsulate(cipherText, privateKey);
    return sharedKey;
}

async function encryptWithPQC(plaintext, pqcPublicKey, algorithm) {
    const { cipherText, sharedSecret } = encapsulate(algorithm, pqcPublicKey);

    const message = await openpgp.createMessage({ text: plaintext });
    const encrypted = await openpgp.encrypt({
        message,
        passwords: [Buffer.from(sharedSecret).toString("hex")], 
        config: { preferredSymmetricAlgorithm: openpgp.enums.symmetric.aes256 },
    });

    return { encrypted, cipherText: uint8ArrayToHex(cipherText) };
}

async function decryptWithPQC(encryptedMessage, cipherTextHex, pqcPrivateKey, algorithmName) {

    const cipherText = hexToUint8Array(cipherTextHex);

    const sharedSecret = decapsulate(algorithmName, cipherText, pqcPrivateKey);

    const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });
    const decrypted = await openpgp.decrypt({
        message,
        passwords: [Buffer.from(sharedSecret).toString("hex")],
        config: { preferredSymmetricAlgorithm: openpgp.enums.symmetric.aes256 },
    });

    return decrypted.data;
}

async function measurePerformance(iterations) {
    const algorithm = ml_kem512;
    const { publicKey, secretKey: privateKey } = keygen(algorithm);
    const plaintext = "This is a post-quantum encryption test.";

    const results = {
        cpu: [],
        memory: [],
        time: [],
    };

    for (let i = 0; i < iterations; i++) {
        console.log(`Running iteration ${i + 1}...`);

        const startTime = performance.now();
        const { encrypted, cipherText } = await encryptWithPQC(plaintext, publicKey, algorithm);
        await decryptWithPQC(encrypted, cipherText, privateKey, algorithm);
        const endTime = performance.now();

        const usage = await pidusage(process.pid);

        results.memory.push(usage.memory / 1024 / 1024); 
        results.time.push(endTime - startTime); 
    }

    return results;
}

function saveResultsAsJSON(results, filename = 'performance_results.json') {
    const jsonContent = JSON.stringify(results, null, 2);
    fs.writeFileSync(filename, jsonContent);
    console.log(`Performance results saved to ${filename}`);
}

(async () => {
    const iterations = 100; 
    const results = await measurePerformance(iterations);

    saveResultsAsJSON(results);

    console.log("Performance results:", results);
})();
