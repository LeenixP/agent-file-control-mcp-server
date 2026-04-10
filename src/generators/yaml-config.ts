import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const YamlConfigInputSchema = z.object({
  data: z.record(z.any()),
  headerComment: z.string().optional(),
  indent: z.number().default(2)
});

type YamlConfigInput = z.infer<typeof YamlConfigInputSchema>;

export class YamlConfigGenerator extends BaseGenerator<YamlConfigInput> {
  constructor(context: GeneratorContext, input: YamlConfigInput) {
    super(context, YamlConfigInputSchema.parse(input));
  }

  generate() {
    const input = this.input as YamlConfigInput;
    const lines: string[] = [];
    const indentStr = ' '.repeat(input.indent);

    if (input.headerComment) {
      lines.push('# ' + input.headerComment);
      lines.push('');
    }

    lines.push(this.formatYaml(input.data, 0, indentStr));
    return this.success(lines.join('\n'));
  }

  private formatYaml(value: unknown, depth: number, indentStr: string): string {
    const indent = indentStr.repeat(depth);
    if (typeof value === 'string') return indent + value;
    if (typeof value === 'number') return indent + String(value);
    if (typeof value === 'boolean') return indent + (value ? 'true' : 'false');
    if (value === null) return indent + 'null';
    if (Array.isArray(value)) {
      return value.map(v => indent + '- ' + this.formatYaml(v, depth + 1, indentStr)).join('\n');
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      return entries.map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return indent + k + ':\n' + this.formatYaml(v, depth + 1, indentStr);
        }
        return indent + k + ': ' + this.formatYaml(v, 0, indentStr).trim();
      }).join('\n');
    }
    return indent + String(value);
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'yaml-config',
      description: 'Generate YAML configuration file.',
      inputSchema: YamlConfigInputSchema,
      examples: [
        {
          description: 'Simple YAML',
          input: { data: { appName: 'MyApp', settings: { debug: true } } },
          outputPreview: 'appName: MyApp\nsettings:\n  debug: true'
        }
      ]
    };
  }
}
