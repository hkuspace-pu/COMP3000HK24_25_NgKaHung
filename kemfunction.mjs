
import { ml_kem512, ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem';


import { Buffer } from 'buffer';

// [Alice] generates secret & public keys, then sends publicKey to Bob

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



export function keygen(algorithm) {
    const keys = algorithm.keygen();
    return keys;
}

export function encapsulate(algorithm,publicKey){
    const { cipherText, sharedSecret: sharedKey } = algorithm.encapsulate(publicKey);
    return { cipherText, sharedSecret: sharedKey };
}

export function decapsulate(algorithm, cipherText,privateKey){
    const sharedKey = algorithm.decapsulate(cipherText, privateKey);
    return sharedKey;
}


//Encapsulation
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('generateKeyPair').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorKeyGen').textContent.trim();
            const algorithm = algorithms[selectedAlgorithm]; 
            const key = keygen(algorithm);
            const privateKey=key.secretKey;
            const publicKey=key.publicKey;
            document.getElementById('kemPublickeyGen').value = Buffer.from(publicKey).toString('hex');
            document.getElementById('kemPrivatekeyGen').value = Buffer.from(privateKey).toString('hex');
        } catch (error) {
            console.error('Error:', error);
        }
    });
});



//Encapsulation
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('encapsulateKey').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorEncapsulation').textContent.trim();
            const algorithm = algorithms[selectedAlgorithm]; 
            const publickeyHex = document.getElementById('publicKeyInput').value;
            const publickey = hexToUint8Array(publickeyHex);
            const {cipherText, sharedSecret} = encapsulate(algorithm,publickey);
            document.getElementById('cipherTextOutput').value = Buffer.from(cipherText).toString('hex');
            document.getElementById('symmetricKeyOutput').value = Buffer.from(sharedSecret).toString('hex');
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
//Decapsulation
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('decapsulate').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorDecapsulation').textContent.trim();
            const algorithm = algorithms[selectedAlgorithm]; 
            const privatekeyHex = document.getElementById('privateKeyInput').value;
            const privateKey = hexToUint8Array(privatekeyHex);
            const cipherTextHex = document.getElementById('cipherTextInput').value;
            const cipherText = hexToUint8Array(cipherTextHex);
            const symmetrickey = decapsulate(algorithm,cipherText ,privateKey);
            document.getElementById('symmetrickeyDecapsulate').value = Buffer.from(symmetrickey).toString('hex');
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
