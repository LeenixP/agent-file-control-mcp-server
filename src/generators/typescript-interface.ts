import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const TypeScriptInterfaceFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  optional: z.boolean().optional()
});

const TypeScriptInterfaceInputSchema = z.object({
  interfaceName: z.string(),
  fields: z.array(TypeScriptInterfaceFieldSchema).min(1),
  export: z.boolean().default(true)
});

type TypeScriptInterfaceInput = z.infer<typeof TypeScriptInterfaceInputSchema>;

export class TypeScriptInterfaceGenerator extends BaseGenerator<TypeScriptInterfaceInput> {
  constructor(context: GeneratorContext, input: TypeScriptInterfaceInput) {
    super(context, TypeScriptInterfaceInputSchema.parse(input));
  }

  generate() {
    const input = this.input as TypeScriptInterfaceInput;
    const lines: string[] = [];
    const tab = '  ';

    const exportKeyword = input.export ? 'export ' : '';
    lines.push(exportKeyword + 'interface ' + input.interfaceName + ' {');
    for (const f of input.fields) {
      const optionalMark = f.optional ? '?' : '';
      lines.push(tab + f.name + optionalMark + ': ' + f.type + ';');
    }
    lines.push('}');

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'typescript-interface',
      description: 'Generate TypeScript interface.',
      inputSchema: TypeScriptInterfaceInputSchema,
      examples: [{ description: 'TS interface', input: { interfaceName: 'User', fields: [{ name: 'id', type: 'string' }, { name: 'name', type: 'string', optional: true }] }, outputPreview: 'export interface User {\n  id: string;\n  name?: string;\n}' }]
    };
  }
}
