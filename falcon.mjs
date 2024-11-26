import signBuilder512 from '@dashlane/pqc-sign-falcon-512-node'
import signBuilder1024 from '@dashlane/pqc-sign-falcon-1024-node'


async function run() {
    const sign = await signBuilder512();
    
    const message = new Uint8Array([0x44, 0x61, 0x73, 0x68, 0x6c, 0x61, 0x6e, 0x65]);
    
    const { publicKey, privateKey } = await sign.keypair();
    const { signature } = await sign.sign(message, privateKey);
    const validSignature = await sign.verify(signature, message, publicKey);
    // validSignature === true
    console.log(validSignature)
}
run();