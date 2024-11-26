import { ml_dsa44, ml_dsa65, ml_dsa87 } from '@noble/post-quantum/ml-dsa';
import {
    slh_dsa_sha2_128f, slh_dsa_sha2_128s,
    slh_dsa_sha2_192f, slh_dsa_sha2_192s,
    slh_dsa_sha2_256f, slh_dsa_sha2_256s,
    slh_dsa_shake_128f, slh_dsa_shake_128s,
    slh_dsa_shake_192f, slh_dsa_shake_192s,
    slh_dsa_shake_256f, slh_dsa_shake_256s,
  } from '@noble/post-quantum/slh-dsa';
  
function keygenSign(algorithm) {
    const keys = algorithm.keygen();
    return keys;
}

function sign(algorithm,secretKey,msg) {
    const sig = algorithm.sign(secretKey, msg);
    return sig;
}

function verify(algorithm,publicKey, msg, sig){
    const isValid = algorithm.verify(publicKey, msg, sig);
    return isValid;
}

const keys= keygen(slh_dsa_sha2_128f);
const msg = new TextEncoder().encode('OMG');
const sig = sign(slh_dsa_sha2_128f,keys.secretKey, msg);
const isValid = verify(slh_dsa_sha2_128f,keys.publicKey, msg, sig);

console.log(isValid);