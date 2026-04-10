import fs from 'fs';
import path from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CopyMoveSchema,
  DeleteSchema,
  MkdirSchema,
  CopyMoveInput,
  DeleteInput,
  MkdirInput
} from '../schemas/index.js';
import { formatError, pathNotFound, pathAlreadyExists, permissionDenied } from '../utils/errors.js';
import { ensureParentDir, pathExists, isDirectory } from '../utils/path.js';

export function registerManageTools(server: McpServer): void {
  server.registerTool(
    'afc_copy',
    {
      title: 'Copy File or Directory',
      description: `Copy a file or directory to a destination path.

Args:
  - src: Source file/directory absolute path
  - dst: Destination absolute path
  - overwrite: Overwrite if destination exists (default: false)

Returns: Success message or error`,
      inputSchema: CopyMoveSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: CopyMoveInput) => {
      if (!pathExists(params.src)) {
        return { content: [{ type: 'text', text: pathNotFound(params.src, 'path') }] };
      }
      if (pathExists(params.dst) && !params.overwrite) {
        return { content: [{ type: 'text', text: pathAlreadyExists(params.dst) }] };
      }

      try {
        const dstErr = ensureParentDir(params.dst);
        if (dstErr) return { content: [{ type: 'text', text: dstErr }] };

        if (isDirectory(params.src)) {
          if (pathExists(params.dst)) {
            fs.rmSync(params.dst, { recursive: true });
          }
          fs.cpSync(params.src, params.dst, { recursive: true });
        } else {
          fs.copyFileSync(params.src, params.dst);
        }

        return {
          content: [{
            type: 'text',
            text: `OK: Copied ${params.src} -> ${params.dst}`
          }]
        };
      } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'EACCES') {
          return { content: [{ type: 'text', text: permissionDenied(params.src, 'copy from') }] };
        }
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_move',
    {
      title: 'Move/Rename File or Directory',
      description: `Move or rename a file or directory.

Args:
  - src: Source file/directory absolute path
  - dst: Destination absolute path
  - overwrite: Overwrite if destination exists (default: false)

Returns: Success message or error`,
      inputSchema: CopyMoveSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (params: CopyMoveInput) => {
      if (!pathExists(params.src)) {
        return { content: [{ type: 'text', text: pathNotFound(params.src, 'path') }] };
      }
      if (pathExists(params.dst) && !params.overwrite) {
        return { content: [{ type: 'text', text: pathAlreadyExists(params.dst) }] };
      }

      try {
        const dstErr = ensureParentDir(params.dst);
        if (dstErr) return { content: [{ type: 'text', text: dstErr }] };

        fs.renameSync(params.src, params.dst);

        return {
          content: [{
            type: 'text',
            text: `OK: Moved ${params.src} -> ${params.dst}`
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_delete',
    {
      title: 'Delete File or Directory',
      description: `Delete a file or directory. Directories require recursive=true.

Args:
  - path: File or directory absolute path
  - recursive: Delete directories recursively (default: false, required for directories)

Returns: Success message or error`,
      inputSchema: DeleteSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: DeleteInput) => {
      if (!pathExists(params.path)) {
        return {
          content: [{
            type: 'text',
            text: `OK: Path does not exist, nothing to delete - ${params.path}`
          }]
        };
      }

      try {
        if (isDirectory(params.path)) {
          if (!params.recursive) {
            return {
              content: [{
                type: 'text',
                text: `Error: ${params.path} is a directory, set recursive=true to delete`
              }]
            };
          }
          fs.rmSync(params.path, { recursive: true });
        } else {
          fs.unlinkSync(params.path);
        }

        return {
          content: [{
            type: 'text',
            text: `OK: Deleted ${params.path}`
          }]
        };
      } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'EACCES') {
          return { content: [{ type: 'text', text: permissionDenied(params.path, 'delete') }] };
        }
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_mkdir',
    {
      title: 'Create Directory',
      description: `Create a directory (equivalent to mkdir -p).

Args:
  - path: Directory absolute path to create

Returns: Success message or error`,
      inputSchema: MkdirSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: MkdirInput) => {
      try {
        fs.mkdirSync(params.path, { recursive: true });
        return {
          content: [{
            type: 'text',
            text: `OK: Directory ready - ${params.path}`
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );
}