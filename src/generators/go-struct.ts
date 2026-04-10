import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const GoStructFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  jsonTag: z.string().optional(),
  omitempty: z.boolean().optional(),
  comment: z.string().optional()
});

const GoStructInputSchema = z.object({
  package: z.string().default('main'),
  structName: z.string(),
  fields: z.array(GoStructFieldSchema).min(1)
});

type GoStructInput = z.infer<typeof GoStructInputSchema>;

export class GoStructGenerator extends BaseGenerator<GoStructInput> {
  constructor(context: GeneratorContext, input: GoStructInput) {
    super(context, GoStructInputSchema.parse(input));
  }

  generate() {
    const input = this.input as GoStructInput;
    const lines: string[] = [];
    const tab = '    ';

    lines.push('package ' + input.package);
    lines.push('');

    lines.push('type ' + input.structName + ' struct {');
    for (const f of input.fields) {
      let line = tab + f.name + ' ' + f.type;
      if (f.jsonTag) {
        const omitempty = f.omitempty ? ',omitempty' : '';
        line += ' `json:"' + f.jsonTag + omitempty + '"`';
      }
      if (f.comment) line += ' // ' + f.comment;
      lines.push(line);
    }
    lines.push('}');

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'go-struct',
      description: 'Generate Go struct with JSON tags.',
      inputSchema: GoStructInputSchema,
      examples: [
        {
          description: 'Go struct',
          input: { package: 'config', structName: 'Server', fields: [{ name: 'Host', type: 'string', jsonTag: 'host' }, { name: 'Port', type: 'int', jsonTag: 'port' }] },
          outputPreview: 'package config\n\ntype Server struct {\n    Host string `json:"host"`\n    Port int `json:"port"`\n}'
        }
      ]
    };
  }
}
