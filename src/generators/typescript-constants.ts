import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const TypeScriptConstantItemSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any())]),
  type: z.string().optional()
});

const TypeScriptConstantsInputSchema = z.object({
  imports: z.array(z.string()).optional(),
  constants: z.array(TypeScriptConstantItemSchema).min(1),
  export: z.boolean().default(true)
});

type TypeScriptConstantsInput = z.infer<typeof TypeScriptConstantsInputSchema>;

export class TypeScriptConstantsGenerator extends BaseGenerator<TypeScriptConstantsInput> {
  constructor(context: GeneratorContext, input: TypeScriptConstantsInput) {
    super(context, TypeScriptConstantsInputSchema.parse(input));
  }

  generate() {
    const input = this.input as TypeScriptConstantsInput;
    const lines: string[] = [];

    if (input.imports) {
      for (const imp of input.imports) lines.push(imp);
      lines.push('');
    }

    for (const c of input.constants) {
      const exportKeyword = input.export ? 'export ' : '';
      const typeAnn = c.type ? ': ' + c.type : '';
      lines.push(exportKeyword + 'const ' + c.name + typeAnn + ' = ' + this.formatTsValue(c.value) + ';');
    }

    return this.success(lines.join('\n'));
  }

  private formatTsValue(value: unknown): string {
    if (typeof value === 'string') {
      const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === null) return 'null';
    if (Array.isArray(value)) return '[' + value.map(v => this.formatTsValue(v)).join(', ') + ']';
    return String(value);
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'typescript-constants',
      description: 'Generate TypeScript constants.',
      inputSchema: TypeScriptConstantsInputSchema,
      examples: [{ description: 'TS constants', input: { constants: [{ name: 'APP_NAME', value: 'MyApp', type: 'string' }] }, outputPreview: 'export const APP_NAME: string = "MyApp";' }]
    };
  }
}
