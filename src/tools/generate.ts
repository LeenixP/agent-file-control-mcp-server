import fs from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WriteGeneratedSchema, ListGeneratorsSchema, WriteGeneratedInput, ListGeneratorsInput } from '../schemas/index.js';
import { generatorRegistry } from '../generators/registry.js';
import { formatError } from '../utils/errors.js';
import { ensureParentDir, pathExists } from '../utils/path.js';

export function registerGenerateTools(server: McpServer): void {
  server.registerTool(
    'afc_write_generated',
    {
      title: 'Write Generated File',
      description: `Generate file content using built-in generators. Bypasses JSON-RPC escaping issues for complex code.

Available generators:
- go-constants: Go constant definitions (package, imports, const block)
- go-struct: Go struct with JSON tags and methods
- go-interface: Go interface definitions
- python-constants: Python module constants
- python-class: Python class with __init__, __repr__, __eq__
- typescript-interface: TypeScript interface definitions
- typescript-constants: TypeScript constant definitions
- json-config: JSON configuration files
- yaml-config: YAML configuration files
- shell-script: Shell scripts with variables and functions
- html-template: HTML documents
- css-styles: CSS style sheets
- markdown-doc: Markdown documentation
- dockerfile: Dockerfile with multi-stage support
- gitignore: .gitignore with language presets

Use afc_list_generators for detailed info on each generator's input schema.`,
      inputSchema: WriteGeneratedSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: WriteGeneratedInput) => {
      if (!generatorRegistry.has(params.generator)) {
        const available = generatorRegistry.listTypes().join(', ');
        return {
          content: [{
            type: 'text',
            text: `Error: Unknown generator "${params.generator}". Available: ${available}`
          }]
        };
      }

      const context = {
        path: params.path,
        encoding: params.encoding as BufferEncoding,
        executable: params.executable
      };

      const generator = generatorRegistry.create(params.generator, context, params.input);
      if (!generator) {
        return {
          content: [{
            type: 'text',
            text: `Error: Failed to create generator "${params.generator}"`
          }]
        };
      }

      const result = generator.generate();

      if (!result.success) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${result.error || 'Generation failed'}`
          }]
        };
      }

      if (params.dry_run) {
        return {
          content: [{
            type: 'text',
            text: `Preview of generated content (${result.lines} lines, ${result.bytes} bytes):\n\n---\n${result.content}\n---`
          }]
        };
      }

      if (params.create_dirs) {
        const dirErr = ensureParentDir(params.path);
        if (dirErr) {
          return { content: [{ type: 'text', text: dirErr }] };
        }
      }

      try {
        fs.writeFileSync(params.path, result.content, { encoding: params.encoding as BufferEncoding });
        
        if (params.executable) {
          fs.chmodSync(params.path, 0o755);
        }

        const exeNote = params.executable ? ' (executable)' : '';
        return {
          content: [{
            type: 'text',
            text: `OK: Generated and written ${params.path} (${result.lines} lines, ${result.bytes} bytes)${exeNote}\nGenerator: ${params.generator}`
          }]
        };
      } catch (e) {
        return { content: [{ type: 'text', text: formatError(e) }] };
      }
    }
  );

  server.registerTool(
    'afc_list_generators',
    {
      title: 'List Available Generators',
      description: `List all available file generators with their descriptions and input schemas.

Use detailed=true to include examples for each generator.`,
      inputSchema: ListGeneratorsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: ListGeneratorsInput) => {
      const generators = generatorRegistry.list();
      
      if (params.detailed) {
        const details = generators.map(g => {
          let exampleStr = '';
          if (g.examples.length > 0) {
            exampleStr = '\n\nExamples:\n' + g.examples.map(ex => 
              `  - ${ex.description}:\n    Input: ${JSON.stringify(ex.input)}\n    Output:\n${ex.outputPreview.split('\n').map(l => '      ' + l).join('\n')}`
            ).join('\n');
          }
          return `${g.name}:\n  ${g.description}${exampleStr}`;
        }).join('\n\n');
        
        return {
          content: [{
            type: 'text',
            text: `Available Generators:\n\n${details}`
          }]
        };
      } else {
        const list = generators.map(g => `${g.name}: ${g.description}`).join('\n');
        return {
          content: [{
            type: 'text',
            text: `Available Generators:\n\n${list}\n\nUse afc_list_generators(detailed=true) for more info.`
          }]
        };
      }
    }
  );
}
