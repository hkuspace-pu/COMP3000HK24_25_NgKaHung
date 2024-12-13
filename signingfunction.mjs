import ml_dsa44 from './PQC WebAssembly/pqc-sign-dilithium2-browser/dist/pqc-sign-dilithium2.js';
import ml_dsa65 from './PQC WebAssembly/pqc-sign-dilithium3-browser/dist/pqc-sign-dilithium3.js';
import ml_dsa87 from './PQC WebAssembly/pqc-sign-dilithium5-browser/dist/pqc-sign-dilithium5.js';

import slh_dsa_sha2_128f from './SPHINCS/pqc-sign-sphincs-sha256-128f-robust-browser/package/dist/pqc-sign-sphincs-sha256-128f-robust.js';
import slh_dsa_sha2_128s from './SPHINCS/pqc-sign-sphincs-sha256-128s-robust-browser/package/dist/pqc-sign-sphincs-sha256-128s-robust.js';
import slh_dsa_sha2_192f from './SPHINCS/pqc-sign-sphincs-sha256-192f-robust-browser/package/dist/pqc-sign-sphincs-sha256-192f-robust.js';
import slh_dsa_sha2_192s from './SPHINCS/pqc-sign-sphincs-sha256-192s-robust-browser/package/dist/pqc-sign-sphincs-sha256-192s-robust.js';
import slh_dsa_sha2_256f from './SPHINCS/pqc-sign-sphincs-sha256-256f-robust-browser/package/dist/pqc-sign-sphincs-sha256-256f-robust.js';
import slh_dsa_sha2_256s from './SPHINCS/pqc-sign-sphincs-sha256-256s-robust-browser/package/dist/pqc-sign-sphincs-sha256-256s-robust.js';
import slh_dsa_shake_128f from './SPHINCS/pqc-sign-sphincs-shake256-128f-robust-browser/package/dist/pqc-sign-sphincs-shake256-128f-robust.js';
import slh_dsa_shake_128s from './SPHINCS/pqc-sign-sphincs-shake256-128s-robust-browser/package/dist/pqc-sign-sphincs-shake256-128s-robust.js';
import slh_dsa_shake_192f from './SPHINCS/pqc-sign-sphincs-shake256-192f-robust-browser/package/dist/pqc-sign-sphincs-shake256-192f-robust.js';
import slh_dsa_shake_192s from './SPHINCS/pqc-sign-sphincs-shake256-192s-robust-browser/package/dist/pqc-sign-sphincs-shake256-192s-robust.js';
import slh_dsa_shake_256f from './SPHINCS/pqc-sign-sphincs-shake256-256f-robust-browser/package/dist/pqc-sign-sphincs-shake256-256f-robust.js';
import slh_dsa_shake_256s from './SPHINCS/pqc-sign-sphincs-shake256-256s-robust-browser/package/dist/pqc-sign-sphincs-shake256-256s-robust.js';

import falcon_512 from './PQC WebAssembly/pqc-sign-falcon-512-browser/dist/pqc-sign-falcon-512.js';
import falcon_1024 from './PQC WebAssembly/pqc-sign-falcon-1024-browser/dist/pqc-sign-falcon-1024.js';

const algorithms = {
  ml_dsa44,
  ml_dsa65,
  ml_dsa87,
  slh_dsa_sha2_128f,
  slh_dsa_sha2_128s,
  slh_dsa_sha2_192f,
  slh_dsa_sha2_192s,
  slh_dsa_sha2_256f,
  slh_dsa_sha2_256s,
  slh_dsa_shake_128f,
  slh_dsa_shake_128s,
  slh_dsa_shake_192f,
  slh_dsa_shake_192s,
  slh_dsa_shake_256f,
  slh_dsa_shake_256s,
  falcon_512,
  falcon_1024,
};

function hexToUint8Array(hex) {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Invalid hex input: must be an even-length hex string.");
  }
  const length = hex.length / 2;
  const uint8Array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return uint8Array;
}

function uint8ArrayToHex(array) {
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function showError(message) {
  alert(message);
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("generateKeyPair").addEventListener("click", async () => {
    try {
      const selectedAlgorithm = document
        .getElementById("selectorKeyGen")
        .textContent.trim();

      if (!algorithms[selectedAlgorithm]) {
        showError("Invalid algorithm selected for key generation.");
        return;
      }

      const algorithm = await algorithms[selectedAlgorithm]();
      const { publicKey, privateKey } = await algorithm.keypair();

      document.getElementById("signingPublickeyGen").value = uint8ArrayToHex(publicKey);
      document.getElementById("signingPrivatekeyGen").value = uint8ArrayToHex(privateKey);
    } catch (error) {
      showError(`Error during key generation: ${error.message}`);
      console.error("Error during key generation:", error);
    }
  });

  document.getElementById("Sign").addEventListener("click", async () => {
    try {
      const selectedAlgorithm = document
        .getElementById("selectorSigning")
        .textContent.trim();

      if (!algorithms[selectedAlgorithm]) {
        showError("Invalid algorithm selected for signing.");
        return;
      }

      const algorithm = await algorithms[selectedAlgorithm]();

      const privateKeyHex = document.getElementById("privatekeyInput").value.trim();
      if (!privateKeyHex) {
        showError("Private key cannot be empty.");
        return;
      }

      const privateKey = hexToUint8Array(privateKeyHex);
      const message = document.getElementById("messageInput").value.trim();
      if (!message) {
        showError("Message cannot be empty.");
        return;
      }

      const messageBytes = new TextEncoder().encode(message);

      const { signature } = await algorithm.sign(messageBytes, privateKey);

      document.getElementById("signatureOutput").value = uint8ArrayToHex(signature);
    } catch (error) {
      showError(`Error during signing: ${error.message}`);
      console.error("Error during signing:", error);
    }
  });

  document.getElementById("verify").addEventListener("click", async () => {
    try {
      const selectedAlgorithm = document
        .getElementById("selectorVerification")
        .textContent.trim();

      if (!algorithms[selectedAlgorithm]) {
        showError("Invalid algorithm selected for verification.");
        return;
      }

      const algorithm = await algorithms[selectedAlgorithm]();

      const publicKeyHex = document.getElementById("publickeyInput").value.trim();
      if (!publicKeyHex) {
        showError("Public key cannot be empty.");
        return;
      }

      const publicKey = hexToUint8Array(publicKeyHex);
      const receivedMessage = document.getElementById("receivedMessageInput").value.trim();
      if (!receivedMessage) {
        showError("Message cannot be empty.");
        return;
      }

      const messageBytes = new TextEncoder().encode(receivedMessage);
      const signatureHex = document.getElementById("signatureInput").value.trim();
      if (!signatureHex) {
        showError("Signature cannot be empty.");
        return;
      }

      const signature = hexToUint8Array(signatureHex);

      const validSignature = await algorithm.verify(signature, messageBytes, publicKey);

      const checkIcon = document.getElementById("checkIcon");
      const xmarkIcon = document.getElementById("xmarkIcon");
      if (validSignature) {
        checkIcon.classList.remove("invisible");
        xmarkIcon.classList.add("invisible");
      } else {
        checkIcon.classList.add("invisible");
        xmarkIcon.classList.remove("invisible");
      }
    } catch (error) {
      showError(`Error during verification: ${error.message}`);
      console.error("Error during verification:", error);
    }
  });
});