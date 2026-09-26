/**
 * SHA-256 Checksum Calculator for Files
 *
 * Computes authentic SHA-256 digest directly from file bytes without multiple string conversions.
 * Features:
 * 1. Native expo-crypto if module is available
 * 2. Subtle Web Crypto if supported
 * 3. Pure JS FIPS PUB 180-4 compliant SHA-256 fallback (zero dependencies, 100% precision)
 */

export interface FileHashResult {
  sha256: string;
  sizeBytes: number;
  arrayBuffer: ArrayBuffer;
}

// Safely resolve expo-crypto native module if present in binary
let ExpoCrypto: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ExpoCrypto = require('expo-crypto');
} catch {
  // Native module not linked in current dev binary
}

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256PureJs(bytes: Uint8Array): string {
  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a;
  let h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  const len = bytes.length;
  const bitLen = len * 8;
  const newLen = (((len + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(newLen);
  padded.set(bytes);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen, false);

  const w = new Int32Array(64);

  for (let i = 0; i < newLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + (j << 2), false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 =
        ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^
        ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^
        (w[j - 15] >>> 3);
      const s1 =
        ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^
        ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^
        (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}

/**
 * Calculates SHA-256 hash and size of a file given its local URI.
 */
export async function calculateFileSha256(uri: string): Promise<FileHashResult> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Không thể đọc dữ liệu ảnh.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const sizeBytes = arrayBuffer.byteLength;

  if (sizeBytes === 0) {
    throw new Error('Tập tin ảnh không có dữ liệu.');
  }

  const uint8View = new Uint8Array(arrayBuffer);
  let sha256 = '';

  // 1. Try native expo-crypto if linked
  if (ExpoCrypto?.digest && ExpoCrypto?.CryptoDigestAlgorithm?.SHA256) {
    try {
      const hashBuffer = await ExpoCrypto.digest(
        ExpoCrypto.CryptoDigestAlgorithm.SHA256,
        uint8View
      );
      const hashBytes = new Uint8Array(hashBuffer);
      const hexParts: string[] = [];
      for (let i = 0; i < hashBytes.length; i++) {
        hexParts.push(hashBytes[i].toString(16).padStart(2, '0'));
      }
      sha256 = hexParts.join('');
    } catch {
      // Fall through to JS implementation
    }
  }

  // 2. Try subtle crypto if available
  if (!sha256 && typeof globalThis.crypto?.subtle?.digest === 'function') {
    try {
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashBytes = new Uint8Array(hashBuffer);
      const hexParts: string[] = [];
      for (let i = 0; i < hashBytes.length; i++) {
        hexParts.push(hashBytes[i].toString(16).padStart(2, '0'));
      }
      sha256 = hexParts.join('');
    } catch {
      // Fall through
    }
  }

  // 3. Guaranteed fallback: pure JS implementation
  if (!sha256) {
    sha256 = sha256PureJs(uint8View);
  }

  return {
    sha256,
    sizeBytes,
    arrayBuffer,
  };
}
