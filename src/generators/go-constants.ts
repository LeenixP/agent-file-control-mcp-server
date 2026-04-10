import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const GoConstantItemSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  type: z.string().optional(),
  comment: z.string().optional()
});

const GoConstantsInputSchema = z.object({
  package: z.string().default('main'),
  imports: z.array(z.string()).optional(),
  constants: z.array(GoConstantItemSchema).min(1),
  constBlock: z.boolean().default(true)
});

type GoConstantsInput = z.infer<typeof GoConstantsInputSchema>;

export class GoConstantsGenerator extends BaseGenerator<GoConstantsInput> {
  constructor(context: GeneratorContext, input: GoConstantsInput) {
    super(context, GoConstantsInputSchema.parse(input));
  }

  generate() {
    const input = this.input as GoConstantsInput;
    const lines: string[] = [];
    const tab = '    ';

    lines.push('package ' + input.package);
    lines.push('');

    if (input.imports && input.imports.length > 0) {
      lines.push('import (');
      for (const imp of input.imports) lines.push(tab + '"' + imp + '"');
      lines.push(')');
      lines.push('');
    }

    if (input.constBlock) {
      lines.push('const (');
      for (const c of input.constants) {
        const comment = c.comment ? ' // ' + c.comment : '';
        const typeAnn = c.type ? ' ' + c.type : '';
        lines.push(tab + c.name + typeAnn + ' = ' + this.formatGoValue(c.value) + comment);
      }
      lines.push(')');
    } else {
      for (const c of input.constants) {
        const comment = c.comment ? ' // ' + c.comment : '';
        lines.push('const ' + c.name + ' = ' + this.formatGoValue(c.value) + comment);
      }
    }

    return this.success(lines.join('\n'));
  }

  private formatGoValue(value: unknown): string {
    if (typeof value === 'string') {
      const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === null) return 'nil';
    return String(value);
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'go-constants',
      description: 'Generate Go constant definitions. Unicode characters are handled correctly.',
      inputSchema: GoConstantsInputSchema,
      examples: [
        {
          description: 'Go constants with unicode',
          input: {
            package: 'tui',
            constants: [
              { name: 'radioOn', value: '\u25cf', comment: 'Selected' },
              { name: 'radioOff', value: '\u25cb', comment: 'Unselected' },
              { name: 'cursorStr', value: '\u25b8 ' },
              { name: 'checkMark', value: '\u2713' }
            ]
          },
          outputPreview: 'package tui\n\nconst (\n    radioOn   = "\u25cf" // Selected\n    radioOff  = "\u25cb" // Unselected\n    cursorStr = "\u25b8 "\n    checkMark = "\u2713"\n)'
        }
      ]
    };
  }
}
