import fs from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  ReadFileSchema,
  SearchReplaceSchema,
  PatchLinesSchema,
  ReadFileInput,
  SearchReplaceInput,
  PatchLinesInput
} from '../schemas/index.js';
import { decodeBase64, encodeBase64 } from '../utils/base64.js';
import { formatError, pathNotFound, invalidLineRange, searchPatternNotFound } from '../utils/errors.js';
import { pathExists, isFile } from '../utils/path.js';
import { generatePatchDiff } from '../utils/diff.js';

export function registerReadTools(server: McpServer): void {
  server.registerTool(
    'afc_read_file',
    {
      title: 'Read File',
      description: `Read file contents. Supports line range reading and base64 output.

Args:
  - path: File absolute path to read
  - as_b64: Return as base64 (for binary files or special characters)
  - encoding: Text encoding (default: utf-8)
  - start_line: Start line number (1-based, inclusive)
  - end_line: End line number (1-based, inclusive)

Returns: File content (text or base64), or error message.
For line ranges: "# path lines X-Y" prefix is added`,
      inputSchema: ReadFileSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: ReadFileInput) => {
      if (!pathExists(params.path)) {
        return { content: [{ type: 'text', text: pathNotFound(params.path, 'file') }] };
      }
      if (!isFile(params.path)) {
        return { content: [{ type: 'text', text: `Error: Not a file - ${params.path}` }] };
      }

      try {
        const raw = fs.readFileSync(params.path);

        if (params.as_b64) {
          return { content: [{ type: 'text', text: encodeBase64(raw) }] };
        }

        const text = raw.toString(params.encoding as BufferEncoding);

        if (params.start_line !== undefined || params.end_line !== undefined) {
          const lines = text.split('\n');
          const start = (params.start_line ?? 1) - 1;
          const end = params.end_line ?? lines.length;
          const selectedLines = lines.slice(start, end);
          return {
            content: [{
              type: 'text',
              text: `# ${params.path} lines ${start + 1}-${Math.min(end, lines.length)}\n${selectedLines.join('\n')}`
            }]
          };
        }

        return { content: [{ type: 'text', text: text }] };
      } catch (e) {
        if (e instanceof Error && e.message.includes('encoding')) {
          return {
            content: [{
              type: 'text',
              text: `Error: Cannot decode with ${params.encoding} encoding, use as_b64=true for binary content`
            }]
          };
        }
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_search_replace',
    {
      title: 'Search and Replace in File (base64)',
      description: `Search and replace content in a file. Both old and new content use base64 encoding to avoid JSON escaping issues.

Args:
  - path: Target file absolute path
  - old_b64: Content to search for (base64 encoded)
  - new_b64: Replacement content (base64 encoded)
  - count: Number of replacements (-1 for all, 1 for first)
  - encoding: File encoding (default: utf-8)

Returns: Success message with diff output showing changes, or error if pattern not found`,
      inputSchema: SearchReplaceSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (params: SearchReplaceInput) => {
      const [oldRaw, oldErr] = decodeBase64(params.old_b64, 'old_b64');
      if (oldErr) return { content: [{ type: 'text', text: oldErr }] };

      const [newRaw, newErr] = decodeBase64(params.new_b64, 'new_b64');
      if (newErr) return { content: [{ type: 'text', text: newErr }] };

      if (!pathExists(params.path)) {
        return { content: [{ type: 'text', text: pathNotFound(params.path, 'file') }] };
      }

      try {
        const original = fs.readFileSync(params.path, params.encoding as BufferEncoding);
        const oldStr = oldRaw.toString(params.encoding as BufferEncoding);
        const newStr = newRaw.toString(params.encoding as BufferEncoding);

        const occurrences = original.split(oldStr).length - 1;
        if (occurrences === 0) {
          return {
            content: [{
              type: 'text',
              text: searchPatternNotFound(oldStr.slice(0, 100))
            }]
          };
        }

        let result: string;
        let replaced: number;
        if (params.count === -1) {
          result = original.replaceAll(oldStr, newStr);
          replaced = occurrences;
        } else {
          result = original.replace(oldStr, newStr);
          replaced = 1;
        }

        const oldLines = original.split('\n');
        const newLines = result.split('\n');

        const diffLines: string[] = [];
        let i = 0;
        while (i < oldLines.length || i < newLines.length) {
          if (oldLines[i] !== newLines[i]) {
            if (i < oldLines.length) {
              diffLines.push(`${i + 1} -    ${oldLines[i]}`);
            }
            if (i < newLines.length) {
              diffLines.push(`${i + 1} +    ${newLines[i]}`);
            }
          }
          i++;
        }

        const diffOutput = diffLines.slice(0, 50).join('\n');
        const truncated = diffLines.length > 50 ? `\n... (${diffLines.length - 50} more lines)` : '';

        fs.writeFileSync(params.path, result, { encoding: params.encoding as BufferEncoding });

        return {
          content: [{
            type: 'text',
            text: `OK: Replaced ${replaced}/${occurrences} occurrences in ${params.path}\n\nChanges:\n${diffOutput}${truncated}`
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_patch_lines',
    {
      title: 'Replace Line Range (base64)',
      description: `Replace a specific line range in a file. Use afc_read_file to verify line numbers first.

Args:
  - path: Target file absolute path
  - start_line: Start line number (1-based, inclusive)
  - end_line: End line number (1-based, inclusive)
  - new_content_b64: Replacement content in base64 (can be multi-line)
  - encoding: File encoding (default: utf-8)

Note: If new_content_b64 doesn't end with newline, one is added automatically.

Returns: Success message with diff output showing what changed`,
      inputSchema: PatchLinesSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (params: PatchLinesInput) => {
      const [newRaw, newErr] = decodeBase64(params.new_content_b64, 'new_content_b64');
      if (newErr) return { content: [{ type: 'text', text: newErr }] };

      if (!pathExists(params.path)) {
        return { content: [{ type: 'text', text: pathNotFound(params.path, 'file') }] };
      }

      try {
        const content = fs.readFileSync(params.path, params.encoding as BufferEncoding);
        const lines = content.split('\n');
        const total = lines.length;
        const start = params.start_line - 1;
        const end = params.end_line;

        if (start < 0 || end > total || start >= end) {
          return {
            content: [{
              type: 'text',
              text: invalidLineRange(params.start_line, params.end_line, total)
            }]
          };
        }

        const oldLines = lines.slice(start, end);

        let newText = newRaw.toString(params.encoding as BufferEncoding);
        if (newText.length > 0 && !newText.endsWith('\n')) {
          newText += '\n';
        }

        const newLines = newText.split('\n');
        const result = [...lines.slice(0, start), ...newLines, ...lines.slice(end)];

        const diffOutput = generatePatchDiff(oldLines, newLines, params.start_line);

        fs.writeFileSync(params.path, result.join('\n'), { encoding: params.encoding as BufferEncoding });

        const oldCount = end - start;
        const newCount = newLines.length;

        return {
          content: [{
            type: 'text',
            text: `OK: Replaced ${params.path} lines ${params.start_line}-${params.end_line} (${oldCount} lines -> ${newCount} lines)\n\nChanges:\n${diffOutput}`
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );
}