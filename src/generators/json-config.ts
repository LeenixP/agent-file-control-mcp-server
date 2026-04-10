import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const JsonConfigInputSchema = z.object({
  data: z.record(z.any()),
  indent: z.number().default(2),
  headerComment: z.string().optional()
});

type JsonConfigInput = z.infer<typeof JsonConfigInputSchema>;

export class JsonConfigGenerator extends BaseGenerator<JsonConfigInput> {
  constructor(context: GeneratorContext, input: JsonConfigInput) {
    super(context, JsonConfigInputSchema.parse(input));
  }

  generate() {
    const input = this.input as JsonConfigInput;
    let content = '';

    if (input.headerComment) {
      content = '// ' + input.headerComment + '\n';
    }
    content += JSON.stringify(input.data, null, input.indent);
    return this.success(content);
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'json-config',
      description: 'Generate JSON configuration file.',
      inputSchema: JsonConfigInputSchema,
      examples: [
        {
          description: 'Simple JSON',
          input: { data: { appName: 'MyApp', version: '1.0.0' } },
          outputPreview: '{ "appName": "MyApp", "version": "1.0.0" }'
        }
      ]
    };
  }
}
