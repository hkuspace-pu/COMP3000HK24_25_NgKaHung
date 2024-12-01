import {
    ml_dsa44,
    ml_dsa65,
    ml_dsa87,
  } from "@noble/post-quantum/ml-dsa";
  
  import {
    slh_dsa_sha2_128f, slh_dsa_sha2_128s,
    slh_dsa_sha2_192f, slh_dsa_sha2_192s,
    slh_dsa_sha2_256f, slh_dsa_sha2_256s,
    slh_dsa_shake_128f, slh_dsa_shake_128s,
    slh_dsa_shake_192f, slh_dsa_shake_192s,
    slh_dsa_shake_256f, slh_dsa_shake_256s,
  } from "@noble/post-quantum/slh-dsa";
  
  import { Buffer } from "buffer";
  
  const algorithms = {
    "ml_dsa44": ml_dsa44,
    "ml_dsa65": ml_dsa65,
    "ml_dsa87": ml_dsa87,
    "slh_dsa_sha2_128f": slh_dsa_sha2_128f,
    "slh_dsa_sha2_128s": slh_dsa_sha2_128s,
    "slh_dsa_sha2_192f": slh_dsa_sha2_192f,
    "slh_dsa_sha2_192s": slh_dsa_sha2_192s,
    "slh_dsa_sha2_256f": slh_dsa_sha2_256f,
    "slh_dsa_sha2_256s": slh_dsa_sha2_256s,
    "slh_dsa_shake_128f": slh_dsa_shake_128f,
    "slh_dsa_shake_128s": slh_dsa_shake_128s,
    "slh_dsa_shake_192f": slh_dsa_shake_192f,
    "slh_dsa_shake_192s": slh_dsa_shake_192s,
    "slh_dsa_shake_256f": slh_dsa_shake_256f,
    "slh_dsa_shake_256s": slh_dsa_shake_256s,
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
  
  function keygenSign(algorithm) {
    const keys = algorithm.keygen();
    return keys;
  }
  
  function sign(algorithm, secretKey, msg) {
    const sig = algorithm.sign(secretKey, msg);
    return sig;
  }
  
  function verify(algorithm, publicKey, msg, sig) {
    const isValid = algorithm.verify(publicKey, msg, sig);
    return isValid;
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    document
      .getElementById("generateKeyPair")
      .addEventListener("click", async () => {
        try {
          const selectedAlgorithm = document
            .getElementById("selectorKeyGen")
            .textContent.trim();
          if (!algorithms[selectedAlgorithm]) {
            showError("Invalid algorithm selected for key generation.");
            return;
          }
  
          const algorithm = algorithms[selectedAlgorithm];
          const keys = keygenSign(algorithm);
  
          document.getElementById("signingPublickeyGen").value = uint8ArrayToHex(
            keys.publicKey
          );
          document.getElementById("signingPrivatekeyGen").value =
            uint8ArrayToHex(keys.secretKey);
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
  
        const algorithm = algorithms[selectedAlgorithm];
  
        const privateKeyHex = document
          .getElementById("privatekeyInput")
          .value.trim();
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
  
        const signature = sign(algorithm, privateKey, messageBytes);
  
        document.getElementById("signatureOutput").value =
          uint8ArrayToHex(signature);
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
  
        const algorithm = algorithms[selectedAlgorithm];
  
        const publicKeyHex = document
          .getElementById("publickeyInput")
          .value.trim();
        if (!publicKeyHex) {
          showError("Public key cannot be empty.");
          return;
        }
  
        const publicKey = hexToUint8Array(publicKeyHex);
        const receivedMessage = document
          .getElementById("receivedMessageInput")
          .value.trim();
        if (!receivedMessage) {
          showError("Message cannot be empty.");
          return;
        }
  
        const messageBytes = new TextEncoder().encode(receivedMessage);
        const signatureHex = document
          .getElementById("signatureInput")
          .value.trim();
        if (!signatureHex) {
          showError("Signature cannot be empty.");
          return;
        }
  
        const signature = hexToUint8Array(signatureHex);
  
        const isValid = verify(algorithm, publicKey, messageBytes, signature);

        const checkIcon = document.getElementById("checkIcon");
        const xmarkIcon = document.getElementById("xmarkIcon");
        if (isValid) {
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