/**
 * Crypto utility that works in both secure (HTTPS) and insecure (HTTP) contexts.
 * Uses crypto.subtle when available, falls back to js-sha1/js-sha256/js-sha512.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsSha1 = require("js-sha1") as { (input: string | ArrayBuffer): string; hmac: (key: string, input: string) => string }
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsSha256 = require("js-sha256") as {
  (input: string | ArrayBuffer): string
  sha256: (input: string | ArrayBuffer) => string
  sha224: (input: string | ArrayBuffer) => string
  hmac: (key: string, input: string) => string
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsSha512 = require("js-sha512") as {
  (input: string | ArrayBuffer): string
  sha512: (input: string | ArrayBuffer) => string
  sha384: (input: string | ArrayBuffer) => string
  hmac: (key: string, input: string) => string
}

function bytesToHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

function hasSubtleCrypto(): boolean {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined"
}

/** Hash text — uses crypto.subtle in secure contexts, pure JS fallback otherwise */
export async function hashText(algorithm: string, text: string): Promise<string> {
  if (hasSubtleCrypto()) {
    const data = new TextEncoder().encode(text)
    const buf = await crypto.subtle.digest(algorithm, data)
    return bytesToHex(buf)
  }
  switch (algorithm) {
    case "SHA-1": return jsSha1(text)
    case "SHA-256": return jsSha256(text)
    case "SHA-384": return jsSha512.sha384(text)
    case "SHA-512": return jsSha512(text)
    default: throw new Error(`Unsupported algorithm: ${algorithm}`)
  }
}

/** Hash a file/buffer — uses crypto.subtle in secure contexts, pure JS fallback otherwise */
export async function hashBuffer(algorithm: string, buffer: ArrayBuffer): Promise<string> {
  if (hasSubtleCrypto()) {
    const buf = await crypto.subtle.digest(algorithm, buffer)
    return bytesToHex(buf)
  }
  switch (algorithm) {
    case "SHA-1": return jsSha1(buffer)
    case "SHA-256": return jsSha256(buffer)
    case "SHA-384": return jsSha512.sha384(buffer)
    case "SHA-512": return jsSha512(buffer)
    default: throw new Error(`Unsupported algorithm: ${algorithm}`)
  }
}

/** Compute HMAC — uses crypto.subtle in secure contexts, pure JS fallback otherwise */
export async function hmacSign(algorithm: string, key: string, message: string): Promise<string> {
  if (hasSubtleCrypto()) {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: algorithm }, false, ["sign"])
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message))
    return bytesToHex(signature)
  }
  switch (algorithm) {
    case "SHA-256": return jsSha256.hmac(key, message)
    case "SHA-384":
    case "SHA-512": return jsSha512.hmac(key, message)
    default: throw new Error(`Unsupported HMAC algorithm: ${algorithm}`)
  }
}