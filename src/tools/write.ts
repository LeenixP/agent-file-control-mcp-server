import fs from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  WriteFileSchema, 
  AppendFileSchema,
  WriteFileInput,
  AppendFileInput
} from '../schemas/index.js';
import { decodeBase64, encodeBase64 } from '../utils/base64.js';
import { formatError, permissionDenied } from '../utils/errors.js';
import { ensureParentDir, pathExists, isDirectory } from '../utils/path.js';
import { fileSummary, setExecutable } from '../utils/file.js';

export function registerWriteTools(server: McpServer): void {
  server.registerTool(
    'afc_write_file',
    {
      title: 'Write File (base64)',
      description: `Write base64-encoded content to a file, completely bypassing JSON special character issues.

To generate base64:
  - Linux/Mac: echo -n 'content' | base64
  - Node.js: Buffer.from('content').toString('base64')
  - Python: import base64; print(base64.b64encode(b'content').decode())

Args:
  - path: Target file absolute path
  - content_b64: File content in base64 encoding
  - executable: Set chmod +x permission (default: false)
  - create_dirs: Auto-create parent directories (default: true)
  - encoding: Text encoding (default: utf-8; use "binary" for binary files)

Returns: Success message with file size and line count, or error message`,
      inputSchema: WriteFileSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: WriteFileInput) => {
      const [raw, err] = decodeBase64(params.content_b64);
      if (err) return { content: [{ type: 'text', text: err }] };

      if (params.create_dirs) {
        const dirErr = ensureParentDir(params.path);
        if (dirErr) return { content: [{ type: 'text', text: dirErr }] };
      }

      try {
        if (params.encoding === 'binary') {
          fs.writeFileSync(params.path, raw);
        } else {
          fs.writeFileSync(params.path, raw.toString(params.encoding as BufferEncoding), { encoding: params.encoding as BufferEncoding });
        }

        if (params.executable) {
          setExecutable(params.path);
        }

        const exeNote = params.executable ? ' [+x]' : '';
        return {
          content: [{ 
            type: 'text', 
            text: `OK: Written ${fileSummary(params.path, raw)}${exeNote}` 
          }]
        };
      } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'EACCES') {
          return { content: [{ type: 'text', text: permissionDenied(params.path, 'write') }] };
        }
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_append_file',
    {
      title: 'Append to File (base64)',
      description: `Append base64-encoded content to the end of a file.

Args:
  - path: Target file absolute path
  - content_b64: Content to append in base64 encoding
  - create_if_missing: Create file if it does not exist (default: true)

Returns: Success message with bytes appended, or error message`,
      inputSchema: AppendFileSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (params: AppendFileInput) => {
      const [raw, err] = decodeBase64(params.content_b64);
      if (err) return { content: [{ type: 'text', text: err }] };

      if (!pathExists(params.path) && !params.create_if_missing) {
        return { content: [{ type: 'text', text: `Error: File does not exist - ${params.path}` }] };
      }

      try {
        fs.appendFileSync(params.path, raw);
        return {
          content: [{ 
            type: 'text', 
            text: `OK: Appended ${raw.length} bytes to ${params.path}` 
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );
}