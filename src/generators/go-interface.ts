import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const GoMethodSchema = z.object({
  name: z.string(),
  params: z.array(z.string()).optional(),
  returns: z.array(z.string()).optional()
});

const GoInterfaceInputSchema = z.object({
  package: z.string().default('main'),
  interfaceName: z.string(),
  methods: z.array(GoMethodSchema).min(1)
});

type GoInterfaceInput = z.infer<typeof GoInterfaceInputSchema>;

export class GoInterfaceGenerator extends BaseGenerator<GoInterfaceInput> {
  constructor(context: GeneratorContext, input: GoInterfaceInput) {
    super(context, GoInterfaceInputSchema.parse(input));
  }

  generate() {
    const input = this.input as GoInterfaceInput;
    const lines: string[] = [];
    const tab = '    ';

    lines.push('package ' + input.package);
    lines.push('');

    lines.push('type ' + input.interfaceName + ' interface {');
    for (const m of input.methods) {
      const params = m.params ? m.params.join(', ') : '';
      const returns = m.returns ? ' (' + m.returns.join(', ') + ')' : '';
      lines.push(tab + m.name + '(' + params + ')' + returns);
    }
    lines.push('}');

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'go-interface',
      description: 'Generate Go interface definition.',
      inputSchema: GoInterfaceInputSchema,
      examples: [{ description: 'Go interface', input: { package: 'service', interfaceName: 'Store', methods: [{ name: 'Get', params: ['id string'], returns: ['*Item', 'error'] }] }, outputPreview: 'type Store interface {\n    Get(id string) (*Item, error)\n}' }]
    };
  }
}
