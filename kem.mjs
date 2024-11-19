import { ml_kem512, ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem';
// [Alice] generates secret & public keys, then sends publicKey to Bob

function keygen(algorithm) {
    const keys = algorithm.keygen();
    return keys;
}

function encapsulate(algorithm,publicKey){
    const { cipherText, sharedSecret: sharedKey } = algorithm.encapsulate(publicKey);
    return { cipherText, sharedSecret: sharedKey };
}

function decapsulate(algorithm, cipherText,privateKey){
    const sharedKey = algorithm.decapsulate(cipherText, privateKey);
    return sharedKey;
}

let keys= keygen(ml_kem512);
let publicKey= keys.publicKey;

// send the public key to Bob
let {cipherText, sharedKey} = encapsulate(ml_kem512,publicKey);

let symmetricalKey = decapsulate(ml_kem512,cipherText, keys.secretKey);

const keyHex = Array.from(publicKey).map(byte => byte.toString(16).padStart(2, '0')).join('');

console.log(keyHex);