import * as openpgp from './PQC WebAssembly/openpgp/dist/openpgp.min.mjs';
import kyber512 from './PQC WebAssembly/pqc-kem-kyber512-browser/dist/pqc-kem-kyber512.js';
import kyber768 from './PQC WebAssembly/pqc-kem-kyber768-browser/dist/pqc-kem-kyber768.js';
import kyber1024 from './PQC WebAssembly/pqc-kem-kyber1024-browser/dist/pqc-kem-kyber1024.js';

const kyberAlgorithms = {
    'kyber512': kyber512,
    'kyber768': kyber768,
    'kyber1024': kyber1024
};

function measureTime(fn) {
    const start = performance.now();
    return fn().then(result => {
        const end = performance.now();
        return { result, duration: end - start };
    });
}

function exportToCSV(data, filename) {
    const csvContent = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function testAllPQ() {
    const ITERATIONS = 10;

    const results = [["Algorithm", "Operation", "Time (ms)"]]; // CSV Header

    for (const [algName, algorithm] of Object.entries(kyberAlgorithms)) {
        console.log(`\n=== Testing [${algName}] ===`);
        const operationTimes = {
            OpenPGP_Encrypt: [],
            OpenPGP_Decrypt: []
        };

        for (let i = 0; i < ITERATIONS; i++) {
            console.log(`Iteration ${i + 1} for ${algName}`);

            // Key generation
            const { result: keys, duration: keygenTime } = await measureTime(() => keygen(algorithm));

            const { publicKey, privateKey } = keys;

            // Encapsulation
            const { result: encapsulation, duration: encapsulateTime } = await measureTime(() => encapsulate(algorithm, publicKey));

            const { ciphertext, sharedSecret } = encapsulation;

            // Decapsulation
            const { duration: decapsulateTime } = await measureTime(() => decapsulate(algorithm, ciphertext, privateKey));

            const decryptedSharedSecret = await decapsulate(algorithm, ciphertext, privateKey);
            console.log(sharedSecret);
            console.log(decryptedSharedSecret);
            console.log(`Testing OpenPGP with sharedSecret for ${algName}`);

            const message = await openpgp.createMessage({ binary: new Uint8Array([0x01, 0x01, 0x01]) });

            const { result: encryptedPgpData, duration: openpgpEncryptTime } = await measureTime(() =>
                openpgp.encrypt({
                    message: message, 
                    passwords: [sharedSecret], 
                    format: "binary",
                })
            );
            operationTimes.OpenPGP_Encrypt.push(openpgpEncryptTime);
            const encryptedMessage = await openpgp.readMessage({
                binaryMessage: encryptedPgpData // parse encrypted bytes
            });
        
            const { duration: openpgpDecryptTime } = await measureTime(() =>
                openpgp.decrypt({
                    message: encryptedMessage,
                    passwords: [sharedSecret], 
                    format: "binary",
                })
            );
            operationTimes.OpenPGP_Decrypt.push(openpgpDecryptTime);
        }
        for (const [operation, times] of Object.entries(operationTimes)) {
            const meanTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            results.push([algName, operation, meanTime.toFixed(2)]);
        }
    }

    console.log("Testing complete. Exporting results to CSV...");
    exportToCSV(results, "pqc_test_results_with_openpgp.csv");
}

document.getElementById("runTestButton").addEventListener("click", async () => {
    try {
        await testAllPQ();
    } catch (err) {
        console.error("Failure:", err);
    }
});

// Kyber Key Generation
async function keygen(algorithm) {
    const kem = await algorithm();
    return await kem.keypair();
}

// Kyber Encapsulation
async function encapsulate(algorithm, publicKey) {
    const kem = await algorithm();
    return await kem.encapsulate(publicKey);
}

// Kyber Decapsulation
async function decapsulate(algorithm, ciphertext, privateKey) {
    const kem = await algorithm();
    return await kem.decapsulate(ciphertext, privateKey);
}