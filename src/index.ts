#!/usr/bin/env node
/**
 * MCP Server: agent-file-control
 * 
 * Complete file control MCP server using base64 encoding to bypass JSON parsing issues.
 * Supports: write, append, read, search/replace, line patch, file info, directory list,
 *           copy, move, delete, mkdir, and encoding utilities.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerWriteTools } from './tools/write.js';
import { registerReadTools } from './tools/read.js';
import { registerInfoTools } from './tools/info.js';
import { registerManageTools } from './tools/manage.js';
import { registerEncodeTools } from './tools/encode.js';

const server = new McpServer({
  name: 'agent-file-control-mcp-server',
  version: '1.0.0'
});

registerWriteTools(server);
registerReadTools(server);
registerInfoTools(server);
registerManageTools(server);
registerEncodeTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('agent-file-control MCP server running via stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});