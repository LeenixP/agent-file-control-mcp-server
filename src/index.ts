#!/usr/bin/env node
/**
 * MCP Server: agent-file-control
 * 
 * Complete file control MCP server using base64 encoding to bypass JSON parsing issues.
 * Supports: write, append, read, search/replace, line patch, file info, directory list,
 *           copy, move, delete, mkdir, encoding utilities, and file generators.
 * 
 * Generators: go-constants, go-struct, go-interface, python-constants, python-class,
 *             typescript-interface, typescript-constants, json-config, yaml-config,
 *             shell-script, html-template, css-styles, markdown-doc, dockerfile, gitignore
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createRequire } from 'module';

import { registerWriteTools } from './tools/write.js';
import { registerReadTools } from './tools/read.js';
import { registerInfoTools } from './tools/info.js';
import { registerManageTools } from './tools/manage.js';
import { registerEncodeTools } from './tools/encode.js';
import { registerGenerateTools } from './tools/generate.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const server = new McpServer({
  name: 'agent-file-control-mcp-server',
  version: packageJson.version
});

registerWriteTools(server);
registerReadTools(server);
registerInfoTools(server);
registerManageTools(server);
registerEncodeTools(server);
registerGenerateTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('agent-file-control MCP server running via stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});