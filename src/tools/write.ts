import fs from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  WriteFileSchema, 
  AppendFileSchema,
  WriteFileInput,
  AppendFileInput
} from '../schemas/index.js';
import { decodeBase64 } from '../utils/base64.js';
import { formatError, permissionDenied } from '../utils/errors.js';
import { ensureParentDir, pathExists } from '../utils/path.js';
import { fileSummary, setExecutable } from '../utils/file.js';

function decodeContent(content: string, encoding: 'text' | 'base64'): [Buffer | string, string | null] {
  if (encoding === 'base64') {
    return decodeBase64(content);
  }
  return [content, null];
}

export function registerWriteTools(server: McpServer): void {
  server.registerTool(
    'afc_write_file',
    {
      title: 'Write File',
      description: `Write content to a file.

Two encoding modes:
- content_encoding="text" (default): Plain text string. JSON-RPC automatically handles escaping.
- content_encoding="base64": For content with special characters or binary data.

Args:
  - path: Target file absolute path
  - content: File content (text or base64 encoded)
  - content_encoding: "text" or "base64" (default: "text")
  - executable: Set chmod +x permission (default: false)
  - create_dirs: Auto-create parent directories (default: true)
  - file_encoding: File text encoding (default: utf-8; use "binary" for binary files)

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
      const [raw, err] = decodeContent(params.content, params.content_encoding);
      if (err) return { content: [{ type: 'text', text: err }] };

      if (params.create_dirs) {
        const dirErr = ensureParentDir(params.path);
        if (dirErr) return { content: [{ type: 'text', text: dirErr }] };
      }

      try {
        const contentBuffer = typeof raw === 'string' ? Buffer.from(raw, params.file_encoding as BufferEncoding) : raw;
        
        if (params.file_encoding === 'binary') {
          fs.writeFileSync(params.path, contentBuffer);
        } else {
          fs.writeFileSync(params.path, raw.toString(), { encoding: params.file_encoding as BufferEncoding });
        }

        if (params.executable) {
          setExecutable(params.path);
        }

        const exeNote = params.executable ? ' [+x]' : '';
        const encNote = params.content_encoding === 'base64' ? ' [b64]' : '';
        return {
          content: [{ 
            type: 'text', 
            text: `OK: Written ${fileSummary(params.path, contentBuffer)}${exeNote}${encNote}` 
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
      title: 'Append to File',
      description: `Append content to the end of a file.

Two encoding modes:
- content_encoding="text" (default): Plain text string
- content_encoding="base64": For special characters or binary data

Args:
  - path: Target file absolute path
  - content: Content to append (text or base64 encoded)
  - content_encoding: "text" or "base64" (default: "text")
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
      const [raw, err] = decodeContent(params.content, params.content_encoding);
      if (err) return { content: [{ type: 'text', text: err }] };

      if (!pathExists(params.path) && !params.create_if_missing) {
        return { content: [{ type: 'text', text: `Error: File does not exist - ${params.path}` }] };
      }

      try {
        const contentBuffer = typeof raw === 'string' ? Buffer.from(raw) : raw;
        fs.appendFileSync(params.path, contentBuffer);
        
        const encNote = params.content_encoding === 'base64' ? ' [b64]' : '';
        return {
          content: [{ 
            type: 'text', 
            text: `OK: Appended ${contentBuffer.length} bytes to ${params.path}${encNote}` 
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );
}