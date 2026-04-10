import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  EncodeStringSchema,
  DecodeB64Schema,
  EncodeStringInput,
  DecodeB64Input
} from '../schemas/index.js';
import { decodeBase64ToText, encodeBase64 } from '../utils/base64.js';
import { formatError } from '../utils/errors.js';

export function registerEncodeTools(server: McpServer): void {
  server.registerTool(
    'afc_encode_string',
    {
      title: 'Encode String to Base64',
      description: `Encode a string to base64.

Note: This tool itself uses JSON transport, so it's not suitable for content with many special characters. For complex content, use:
  - Linux/Mac: echo -n 'content' | base64
  - Python: import base64; print(base64.b64encode(b'content').decode())

Args:
  - text: String to encode

Returns: Base64 encoded string`,
      inputSchema: EncodeStringSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: EncodeStringInput) => {
      const encoded = encodeBase64(params.text);
      return { content: [{ type: 'text', text: encoded }] };
    }
  );

  server.registerTool(
    'afc_decode_b64',
    {
      title: 'Decode Base64 to String',
      description: `Decode a base64 string to text, useful for verifying encoded content.

Args:
  - b64: Base64 string to decode
  - encoding: Text encoding for output (default: utf-8)

Returns: Decoded text or error`,
      inputSchema: DecodeB64Schema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: DecodeB64Input) => {
      const [text, err] = decodeBase64ToText(params.b64, params.encoding as BufferEncoding);
      if (err) return { content: [{ type: 'text', text: err }] };

      try {
        return { content: [{ type: 'text', text: text }] };
      } catch (e) {
        return {
          content: [{
            type: 'text',
            text: `Error: Cannot decode with ${params.encoding} encoding, total ${Buffer.from(params.b64, 'base64').length} bytes`
          }]
        };
      }
    }
  );
}