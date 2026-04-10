import fs from 'fs';
import path from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  FileInfoSchema,
  ListDirSchema,
  FileInfoInput,
  ListDirInput
} from '../schemas/index.js';
import { formatError, pathNotFound } from '../utils/errors.js';
import { pathExists, isFile, isDirectory } from '../utils/path.js';
import { getFileStats } from '../utils/file.js';

export function registerInfoTools(server: McpServer): void {
  server.registerTool(
    'afc_file_info',
    {
      title: 'Get File/Directory Info',
      description: `Return metadata for a file or directory: size, permissions, line count (for files), executable status, etc.

Args:
  - path: File or directory absolute path

Returns: JSON object with metadata`,
      inputSchema: FileInfoSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: FileInfoInput) => {
      if (!pathExists(params.path)) {
        return { content: [{ type: 'text', text: pathNotFound(params.path, 'path') }] };
      }

      try {
        const stats = getFileStats(params.path);
        if (!stats) {
          return { content: [{ type: 'text', text: `Error: Cannot get stats for ${params.path}` }] };
        }

        const info: Record<string, unknown> = {
          path: path.resolve(params.path),
          type: stats.isDirectory ? 'directory' : stats.isFile ? 'file' : 'other',
          size_bytes: stats.size,
          permissions: stats.permissions,
          executable: stats.isExecutable
        };

        if (stats.isFile && stats.lines !== undefined) {
          info.lines = stats.lines;
          info.encoding = stats.encoding;
        }

        if (stats.isDirectory) {
          const entries = fs.readdirSync(params.path);
          info.children_count = entries.length;
          info.children_preview = entries.sort().slice(0, 50);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(info, null, 2)
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_list_dir',
    {
      title: 'List Directory Contents',
      description: `List directory contents with optional recursion and filtering.

Args:
  - path: Directory absolute path
  - recursive: List subdirectories recursively (default: false)
  - max_depth: Maximum recursion depth (default: 3)
  - show_hidden: Show hidden files (default: false)
  - pattern: File name filter pattern (e.g., "*.ts")

Returns: Directory listing with file sizes`,
      inputSchema: ListDirSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: ListDirInput) => {
      if (!pathExists(params.path)) {
        return { content: [{ type: 'text', text: pathNotFound(params.path, 'directory') }] };
      }
      if (!isDirectory(params.path)) {
        return { content: [{ type: 'text', text: `Error: Not a directory - ${params.path}` }] };
      }

      const listDirRecursive = (dirPath: string, depth: number): string[] => {
        const result: string[] = [];
        const indent = '  '.repeat(depth);
        try {
          const entries = fs.readdirSync(dirPath).sort();

          for (const name of entries) {
            if (!params.show_hidden && name.startsWith('.')) continue;

            const fullPath = path.join(dirPath, name);
            const isDir = isDirectory(fullPath);

            if (params.pattern && !isDir) {
              const regex = new RegExp(
                '^' + params.pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
              );
              if (!regex.test(name)) continue;
            }

            let line = `${indent}${name}`;
            if (isDir) {
              line += '/';
            } else {
              try {
                const size = fs.statSync(fullPath).size;
                line += `  (${size} bytes)`;
              } catch {
                // Size unavailable
              }
            }
            result.push(line);

            if (isDir && params.recursive && depth < params.max_depth) {
              result.push(...listDirRecursive(fullPath, depth + 1));
            }
          }
        } catch (e) {
          result.push(`${indent}[Permission denied]`);
        }

        return result;
      };

      const lines = listDirRecursive(params.path, 0);
      return {
        content: [{
          type: 'text',
          text: `# ${params.path} (${lines.length} items)\n${lines.join('\n')}`
        }]
      };
    }
  );
}