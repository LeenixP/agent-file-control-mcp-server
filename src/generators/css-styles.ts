import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const CssRuleSchema = z.object({
  selector: z.string(),
  properties: z.record(z.string(), z.string()),
  comment: z.string().optional()
});

const CssStylesInputSchema = z.object({
  headerComment: z.string().optional(),
  rules: z.array(CssRuleSchema).min(1),
  tabWidth: z.number().default(4)
});

type CssStylesInput = z.infer<typeof CssStylesInputSchema>;

export class CssStylesGenerator extends BaseGenerator<CssStylesInput> {
  constructor(context: GeneratorContext, input: CssStylesInput) {
    super(context, CssStylesInputSchema.parse(input));
  }

  generate() {
    const input = this.input as CssStylesInput;
    const lines: string[] = [];
    const tab = ' '.repeat(input.tabWidth);

    if (input.headerComment) {
      lines.push('/* ' + input.headerComment + ' */');
      lines.push('');
    }

    for (const rule of input.rules) {
      if (rule.comment) lines.push('/* ' + rule.comment + ' */');
      lines.push(rule.selector + ' {');
      for (const [prop, value] of Object.entries(rule.properties)) {
        lines.push(tab + prop + ': ' + value + ';');
      }
      lines.push('}');
      lines.push('');
    }

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'css-styles',
      description: 'Generate CSS stylesheet with selectors and properties.',
      inputSchema: CssStylesInputSchema,
      examples: [
        {
          description: 'Simple CSS',
          input: { rules: [{ selector: '.container', properties: { 'max-width': '1200px' } }] },
          outputPreview: '.container { max-width: 1200px; }'
        }
      ]
    };
  }
}
