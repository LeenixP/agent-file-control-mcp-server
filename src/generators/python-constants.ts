import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const PythonConstantItemSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any()), z.record(z.any())]),
  comment: z.string().optional()
});

const PythonConstantsInputSchema = z.object({
  moduleDocstring: z.string().optional(),
  imports: z.array(z.string()).optional(),
  constants: z.array(PythonConstantItemSchema).min(1)
});

type PythonConstantsInput = z.infer<typeof PythonConstantsInputSchema>;

export class PythonConstantsGenerator extends BaseGenerator<PythonConstantsInput> {
  constructor(context: GeneratorContext, input: PythonConstantsInput) {
    super(context, PythonConstantsInputSchema.parse(input));
  }

  generate() {
    const input = this.input as PythonConstantsInput;
    const lines: string[] = [];

    if (input.moduleDocstring) {
      lines.push('"""');
      lines.push(input.moduleDocstring);
      lines.push('"""');
      lines.push('');
    }

    if (input.imports) {
      for (const imp of input.imports) lines.push('import ' + imp);
      lines.push('');
    }

    for (const c of input.constants) {
      if (c.comment) lines.push('# ' + c.comment);
      lines.push(c.name + ' = ' + this.formatPythonValue(c.value));
      lines.push('');
    }

    return this.success(lines.join('\n'));
  }

  private formatPythonValue(value: unknown): string {
    if (typeof value === 'string') {
      if (value.includes('\n')) return '"""' + value.replace(/"/g, '\\"') + '"""';
      return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (value === null) return 'None';
    if (Array.isArray(value)) return '[' + value.map(v => this.formatPythonValue(v)).join(', ') + ']';
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      return '{' + entries.map(([k, v]) => '"' + k + '": ' + this.formatPythonValue(v)).join(', ') + '}';
    }
    return String(value);
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'python-constants',
      description: 'Generate Python module with constants.',
      inputSchema: PythonConstantsInputSchema,
      examples: [{ description: 'Python constants', input: { constants: [{ name: 'APP_NAME', value: 'MyApp' }, { name: 'VERSION', value: '1.0.0' }] }, outputPreview: 'APP_NAME = "MyApp"\nVERSION = "1.0.0"' }]
    };
  }
}
