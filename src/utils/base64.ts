/**
 * Base64 encoding/decoding utilities
 * All file content operations use base64 to bypass JSON parsing issues with special characters
 */

/**
 * Decode base64 string to Buffer
 * @param b64 - Base64 encoded string
 * @returns Tuple of [decoded Buffer, error message if failed]
 */
export function decodeBase64(b64: string, field: string = "content_b64"): [Buffer, string | null] {
  try {
    return [Buffer.from(b64, 'base64'), null];
  } catch (e) {
    return [Buffer.alloc(0), `Error: ${field} base64 decode failed - ${e instanceof Error ? e.message : String(e)}`];
  }
}

/**
 * Encode Buffer or string to base64
 * @param data - Buffer or string to encode
 * @returns Base64 encoded string
 */
export function encodeBase64(data: Buffer | string): string {
  const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  return buffer.toString('base64');
}

/**
 * Decode base64 to text with specified encoding
 * @param b64 - Base64 encoded string
 * @param encoding - Text encoding (default utf-8)
 * @returns Tuple of [decoded text, error message if failed]
 */
export function decodeBase64ToText(b64: string, encoding: BufferEncoding = 'utf-8'): [string, string | null] {
  const [buffer, err] = decodeBase64(b64);
  if (err) return ['', err];
  try {
    return [buffer.toString(encoding), null];
  } catch (e) {
    return ['', `Error: Cannot decode with ${encoding} encoding`];
  }
}