import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const PythonClassFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional()
});

const PythonClassInputSchema = z.object({
  className: z.string(),
  fields: z.array(PythonClassFieldSchema).min(1),
  generateRepr: z.boolean().default(false)
});

type PythonClassInput = z.infer<typeof PythonClassInputSchema>;

export class PythonClassGenerator extends BaseGenerator<PythonClassInput> {
  constructor(context: GeneratorContext, input: PythonClassInput) {
    super(context, PythonClassInputSchema.parse(input));
  }

  generate() {
    const input = this.input as PythonClassInput;
    const lines: string[] = [];
    const tab = '    ';

    lines.push('class ' + input.className + ':');
    lines.push(tab + '"""' + input.className + ' class."""');
    lines.push('');

    lines.push(tab + 'def __init__(self,');
    for (let i = 0; i < input.fields.length; i++) {
      const f = input.fields[i];
      const defVal = f.defaultValue !== undefined ? ' = ' + this.formatPythonValue(f.defaultValue) : '';
      const comma = i === input.fields.length - 1 ? '' : ',';
      lines.push(tab + tab + f.name + ': ' + f.type + defVal + comma);
    }
    lines.push(tab + ') -> None:');
    for (const f of input.fields) lines.push(tab + tab + 'self.' + f.name + ' = ' + f.name);
    lines.push('');

    if (input.generateRepr) {
      const fieldStrs = input.fields.map(f => f.name + '={self.' + f.name + '!r}');
      lines.push(tab + 'def __repr__(self) -> str:');
      lines.push(tab + tab + 'return f"' + input.className + '(' + fieldStrs.join(', ') + ')"');
    }

    return this.success(lines.join('\n'));
  }

  private formatPythonValue(value: unknown): string {
    if (typeof value === 'string') return '"' + value + '"';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (value === null) return 'None';
    return 'None';
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'python-class',
      description: 'Generate Python class with __init__.',
      inputSchema: PythonClassInputSchema,
      examples: [{ description: 'Python class', input: { className: 'User', fields: [{ name: 'id', type: 'str' }, { name: 'name', type: 'str' }] }, outputPreview: 'class User:\n    def __init__(self, id: str, name: str) -> None:\n        self.id = id\n        self.name = name' }]
    };
  }
}
