import { ml_kem512, ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem';

function measurePerformance(algorithm) {
    const t1 = performance.now();
    const keys = algorithm.keygen();
    const t2 = performance.now();
    const keyGenTime = t2 - t1;

    const publicKey = keys.publicKey;

    const t3 = performance.now();
    const { cipherText, sharedSecret } = algorithm.encapsulate(publicKey);
    const t4 = performance.now();
    const encapsulateTime = t4 - t3;

    const t5 = performance.now();
    const sharedKey = algorithm.decapsulate(cipherText, keys.secretKey);
    const t6 = performance.now();
    const decapsulateTime = t6 - t5;

    return {
        keyGenTime,
        encapsulateTime,
        decapsulateTime
    };
}

const performanceResults_ml_kem512 = measurePerformance(ml_kem512);
console.log('Performance results for ml_kem512:', performanceResults_ml_kem512);

const performanceResults_ml_kem768 = measurePerformance(ml_kem768);
console.log('Performance results for ml_kem768:', performanceResults_ml_kem768);

const performanceResults_ml_kem1024 = measurePerformance(ml_kem1024);
console.log('Performance results for ml_kem1024:', performanceResults_ml_kem1024);