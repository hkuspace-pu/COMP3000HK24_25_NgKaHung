import { ml_kem512, ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem';
import { ml_dsa44, ml_dsa65, ml_dsa87 } from '@noble/post-quantum/ml-dsa';
import {
    slh_dsa_sha2_128f, slh_dsa_sha2_128s,
    slh_dsa_sha2_192f, slh_dsa_sha2_192s,
    slh_dsa_sha2_256f, slh_dsa_sha2_256s,
    slh_dsa_shake_128f, slh_dsa_shake_128s,
    slh_dsa_shake_192f, slh_dsa_shake_192s,
    slh_dsa_shake_256f, slh_dsa_shake_256s,
  } from '@noble/post-quantum/slh-dsa';
  
import AES from 'crypto-js/aes.js';
import CryptoJS from 'crypto-js';

const algorithmsA = [
    { name: "ml_kem512", algorithm: ml_kem512 },
    { name: "ml_kem768", algorithm: ml_kem768 },
    { name: "ml_kem1024", algorithm: ml_kem1024 }
];

const algorithmsB = [
    { name: "ml_dsa44", algorithm: ml_dsa44 },
    { name: "ml_dsa65", algorithm: ml_dsa65 },
    { name: "ml_dsa87", algorithm: ml_dsa87 },
    { name: "slh_dsa_sha2_128f", algorithm: slh_dsa_sha2_128f },
    { name: "slh_dsa_sha2_128s", algorithm: slh_dsa_sha2_128s },
    { name: "slh_dsa_sha2_192f", algorithm: slh_dsa_sha2_192f },
    { name: "slh_dsa_sha2_192s", algorithm: slh_dsa_sha2_192s },
    { name: "slh_dsa_sha2_256f", algorithm: slh_dsa_sha2_256f },
    { name: "slh_dsa_sha2_256s", algorithm: slh_dsa_sha2_256s },
    { name: "slh_dsa_shake_128f", algorithm: slh_dsa_shake_128f },
    { name: "slh_dsa_shake_128s", algorithm: slh_dsa_shake_128s },
    { name: "slh_dsa_shake_192f", algorithm: slh_dsa_shake_192f },
    { name: "slh_dsa_shake_192s", algorithm: slh_dsa_shake_192s },
    { name: "slh_dsa_shake_256f", algorithm: slh_dsa_shake_256f },
    { name: "slh_dsa_shake_256s", algorithm: slh_dsa_shake_256s }
];
function byteArrayToHexString(byteArray) {
    return Array.from(byteArray, byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function testAlgorithmCombination(algorithmA, algorithmB) {
    const aliceKeys = algorithmA.keygen();
    const alicePub = aliceKeys.publicKey;

    const bobKeys = algorithmB.keygen();
    const bobPub = bobKeys.publicKey;

    const { cipherText, sharedSecret: bobShared } = algorithmA.encapsulate(alicePub);

    const encryptedmessage = AES.encrypt("Hello, I am Bob", byteArrayToHexString(bobShared)).toString();
    const arrayOfMessage = [cipherText, encryptedmessage];
    const sig = algorithmB.sign(bobKeys.secretKey, JSON.stringify(arrayOfMessage));
    const wholeMessage = [arrayOfMessage, sig];

    const isValid = algorithmB.verify(bobPub, JSON.stringify(arrayOfMessage), sig);
    console.log(isValid);

    if (isValid) {
        const aliceShared = algorithmA.decapsulate(cipherText, aliceKeys.secretKey);

        var bytes = AES.decrypt(encryptedmessage, byteArrayToHexString(aliceShared));

        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log(originalText);
    } else {
        console.log(isValid);
    }
}

for (let a of algorithmsA) {
    for (let b of algorithmsB) {
        const startTime = performance.now();
        testAlgorithmCombination(a.algorithm, b.algorithm);
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        console.log(`kem: ${a.name}, Signing: ${b.name}, ${executionTime}`);
    }
}
