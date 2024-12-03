import kyber512 from './node_modules/@dashlane/pqc-kem-kyber512-browser/dist/pqc-kem-kyber512.js';
import kyber768 from './node_modules/@dashlane/pqc-kem-kyber768-browser/dist/pqc-kem-kyber768.js';
import kyber1024 from './node_modules/@dashlane/pqc-kem-kyber1024-browser/dist/pqc-kem-kyber1024.js';

const algorithms = {
    'ml_kem512': kyber512,
    'ml_kem768': kyber768,
    'ml_kem1024': kyber1024
};

const algorithmLengths = {
    'ml_kem512': { publicKey: 1600, privateKey: 3264, ciphertext: 1536 },
    'ml_kem768': { publicKey: 2368, privateKey: 4800, ciphertext: 2176 },
    'ml_kem1024': { publicKey: 3136, privateKey: 6336, ciphertext: 3136 },
};
function validateLength(input, expectedLength, fieldName) {
    if (input.length !== expectedLength) {
        alert(`${fieldName} must be ${expectedLength} characters long. Please check your input.`);
        return false;
    }
    return true;
}
// Helper Functions
function hexToUint8Array(hex) {
    const length = hex.length / 2;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        uint8Array[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return uint8Array;
}

function uint8ArrayToHex(array) {
    return Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

// **Input Validation**
function isValidHex(input) {
    // Check if the input is a valid hexadecimal string
    return /^[0-9a-fA-F]*$/.test(input) && input.length % 2 === 0;
}

function validateInput(input, fieldName) {
    if (!input || input.trim() === "") {
        alert(`${fieldName} cannot be empty.`);
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

// **DOM Event Listeners**
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

            document.getElementById('kemPublickeyGen').value = uint8ArrayToHex(publicKey);
            document.getElementById('kemPrivatekeyGen').value = uint8ArrayToHex(privateKey);
        } catch (error) {
            console.error('Error during key generation:', error);
            alert('Failed to generate key pair. Please try again.');
        }
    });

    document.getElementById('encapsulateKey').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorEncapsulation').textContent.trim();
            const publickeyHex = document.getElementById('publicKeyInput').value.trim();

            if (!validateInput(selectedAlgorithm, "Algorithm selection")) return;
            if (!validateInput(publickeyHex, "Public key")) return;

            const algorithm = algorithms[selectedAlgorithm];
            const lengths = algorithmLengths[selectedAlgorithm];

            if (!algorithm) {
                alert('Invalid algorithm selected for encapsulation!');
                return;
            }

            if (!isValidHex(publickeyHex)) {
                alert('Invalid public key! Please enter a valid hexadecimal value.');
                return;
            }

            if (!validateLength(publickeyHex, lengths.publicKey, "Public key")) return;

            const publicKey = hexToUint8Array(publickeyHex);
            const { ciphertext, sharedSecret } = await encapsulate(algorithm, publicKey);

            document.getElementById('cipherTextOutput').value = uint8ArrayToHex(ciphertext);
            document.getElementById('symmetricKeyOutput').value = uint8ArrayToHex(sharedSecret);
        } catch (error) {
            console.error('Error during encapsulation:', error);
            alert('Failed to encapsulate the key. Please check your input and try again.');
        }
    });
    // Decapsulation
    document.getElementById('decapsulate').addEventListener('click', async () => {
        try {
            const selectedAlgorithm = document.getElementById('selectorDecapsulation').textContent.trim();
            const privatekeyHex = document.getElementById('privateKeyInput').value.trim();
            const cipherTextHex = document.getElementById('cipherTextInput').value.trim();

            if (!validateInput(selectedAlgorithm, "Algorithm selection")) return;
            if (!validateInput(privatekeyHex, "Private key")) return;
            if (!validateInput(cipherTextHex, "Ciphertext")) return;

            const algorithm = algorithms[selectedAlgorithm];
            const lengths = algorithmLengths[selectedAlgorithm];

            if (!algorithm) {
                alert('Invalid algorithm selected for decapsulation!');
                return;
            }

            if (!isValidHex(privatekeyHex)) {
                alert('Invalid private key! Please enter a valid hexadecimal value.');
                return;
            }

            if (!isValidHex(cipherTextHex)) {
                alert('Invalid ciphertext! Please enter a valid hexadecimal value.');
                return;
            }

            if (!validateLength(privatekeyHex, lengths.privateKey, "Private key")) return;

            if (!validateLength(cipherTextHex, lengths.ciphertext, "Ciphertext")) return;

            const privateKey = hexToUint8Array(privatekeyHex);
            const ciphertext = hexToUint8Array(cipherTextHex);

            const sharedSecret = await decapsulate(algorithm, ciphertext, privateKey);

            document.getElementById('symmetrickeyDecapsulate').value = uint8ArrayToHex(sharedSecret);
        } catch (error) {
            console.error('Error during decapsulation:', error);
            alert('Failed to decapsulate the key. Please check your input and try again.');
        }
    });
});
