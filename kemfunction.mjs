import kyber512 from './PQC WebAssembly/pqc-kem-kyber512-browser/dist/pqc-kem-kyber512.js';
import kyber768 from './PQC WebAssembly/pqc-kem-kyber768-browser/dist/pqc-kem-kyber768.js';
import kyber1024 from './PQC WebAssembly/pqc-kem-kyber1024-browser/dist/pqc-kem-kyber1024.js';

const algorithms = {
    'ml_kem512': kyber512,
    'ml_kem768': kyber768,
    'ml_kem1024': kyber1024
};

const algorithmLengths = {
    'ml_kem512': { publicKey: 800, privateKey: 1632, ciphertext: 768 },
    'ml_kem768': { publicKey: 1184, privateKey: 2400, ciphertext: 1088 },
    'ml_kem1024': { publicKey: 1568, privateKey: 3168, ciphertext: 1568 },
};

// Helper Functions
function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
}

function uint8ArrayToBase64(array) {
    const binaryString = Array.from(array)
        .map((byte) => String.fromCharCode(byte))
        .join('');
    return btoa(binaryString);
}

function isValidBase64(input) {
    return /^[A-Za-z0-9+/]*={0,2}$/.test(input) && input.length % 4 === 0;
}

function validateInput(input, fieldName) {
    if (!input || input.trim() === "") {
        alert(`${fieldName} cannot be empty.`);
        return false;
    }
    return true;
}

function validateLength(input, expectedLength, fieldName) {
    const base64ExpectedLength = Math.ceil((expectedLength * 4) / 3);
    if (input.length !== base64ExpectedLength && input.length !== base64ExpectedLength + 1 && input.length !== base64ExpectedLength + 2) {
        alert(`${fieldName} must be approximately ${base64ExpectedLength} characters long (Base64 encoded). Please check your input.`);
        return false;
    }
    return true;
}

// KEM Functions
async function keygen(algorithm) {
    const kem = await algorithm();
    const { publicKey, privateKey } = await kem.keypair();
    return { publicKey, privateKey };
}

async function encapsulate(algorithm, publicKey) {
    const kem = await algorithm();
    const { ciphertext, sharedSecret } = await kem.encapsulate(publicKey);
    return { ciphertext, sharedSecret };
}

async function decapsulate(algorithm, ciphertext, privateKey) {
    const kem = await algorithm();
    const { sharedSecret } = await kem.decapsulate(ciphertext, privateKey);
    return sharedSecret;
}

// DOM Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    // Key Pair Generation
    document.getElementById('generateKeyPair').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorKeyGen').textContent.trim();
            if (!validateInput(selectedAlgorithm, "Algorithm selection")) return;

            const algorithm = algorithms[selectedAlgorithm];
            if (!algorithm) {
                alert('Invalid algorithm selected for key generation!');
                return;
            }

            const { publicKey, privateKey } = await keygen(algorithm);

            document.getElementById('kemPublickeyGen').value = uint8ArrayToBase64(publicKey);
            document.getElementById('kemPrivatekeyGen').value = uint8ArrayToBase64(privateKey);
        } catch (error) {
            console.error('Error during key generation:', error);
            alert('Failed to generate key pair. Please try again.');
        }
    });

    // Encapsulation
    document.getElementById('encapsulateKey').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorEncapsulation').textContent.trim();
            const publicKeyBase64 = document.getElementById('publicKeyInput').value.trim();

            if (!validateInput(selectedAlgorithm, "Algorithm selection")) return;
            if (!validateInput(publicKeyBase64, "Public key")) return;

            const algorithm = algorithms[selectedAlgorithm];
            const lengths = algorithmLengths[selectedAlgorithm];

            if (!algorithm) {
                alert('Invalid algorithm selected for encapsulation!');
                return;
            }

            if (!isValidBase64(publicKeyBase64)) {
                alert('Invalid public key! Please enter a valid Base64 value.');
                return;
            }

            if (!validateLength(publicKeyBase64, lengths.publicKey, "Public key")) return;

            const publicKey = base64ToUint8Array(publicKeyBase64);
            const { ciphertext, sharedSecret } = await encapsulate(algorithm, publicKey);

            document.getElementById('cipherTextOutput').value = uint8ArrayToBase64(ciphertext);
            document.getElementById('symmetricKeyOutput').value = uint8ArrayToBase64(sharedSecret);
        } catch (error) {
            console.error('Error during encapsulation:', error);
            alert('Failed to encapsulate the key. Please check your input and try again.');
        }
    });

    // Decapsulation
    document.getElementById('decapsulate').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorDecapsulation').textContent.trim();
            const privateKeyBase64 = document.getElementById('privateKeyInput').value.trim();
            const cipherTextBase64 = document.getElementById('cipherTextInput').value.trim();

            if (!validateInput(selectedAlgorithm, "Algorithm selection")) return;
            if (!validateInput(privateKeyBase64, "Private key")) return;
            if (!validateInput(cipherTextBase64, "Ciphertext")) return;

            const algorithm = algorithms[selectedAlgorithm];
            const lengths = algorithmLengths[selectedAlgorithm];

            if (!algorithm) {
                alert('Invalid algorithm selected for decapsulation!');
                return;
            }

            if (!isValidBase64(privateKeyBase64)) {
                alert('Invalid private key! Please enter a valid Base64 value.');
                return;
            }

            if (!isValidBase64(cipherTextBase64)) {
                alert('Invalid ciphertext! Please enter a valid Base64 value.');
                return;
            }

            if (!validateLength(privateKeyBase64, lengths.privateKey, "Private key")) return;

            if (!validateLength(cipherTextBase64, lengths.ciphertext, "Ciphertext")) return;

            const privateKey = base64ToUint8Array(privateKeyBase64);
            const ciphertext = base64ToUint8Array(cipherTextBase64);

            const sharedSecret = await decapsulate(algorithm, ciphertext, privateKey);

            document.getElementById('symmetrickeyDecapsulate').value = uint8ArrayToBase64(sharedSecret);
        } catch (error) {
            console.error('Error during decapsulation:', error);
            alert('Failed to decapsulate the key. Please check your input and try again.');
        }
    });
});