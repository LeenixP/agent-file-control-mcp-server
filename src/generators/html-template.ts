import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

interface HtmlElement { tag: string; attributes?: Record<string, string>; content?: string | HtmlElement[]; }

const HtmlElementSchema: z.ZodType<HtmlElement> = z.object({
  tag: z.string(),
  attributes: z.record(z.string(), z.string()).optional(),
  content: z.union([z.string(), z.array(z.lazy(() => HtmlElementSchema))]).optional()
});

const HtmlTemplateInputSchema = z.object({
  title: z.string().default('Page'),
  body: z.array(HtmlElementSchema).optional(),
  tabWidth: z.number().default(2)
});

type HtmlTemplateInput = z.infer<typeof HtmlTemplateInputSchema>;

export class HtmlTemplateGenerator extends BaseGenerator<HtmlTemplateInput> {
  constructor(context: GeneratorContext, input: HtmlTemplateInput) {
    super(context, HtmlTemplateInputSchema.parse(input));
  }

  generate() {
    const input = this.input as HtmlTemplateInput;
    const lines: string[] = [];
    const tab = ' '.repeat(input.tabWidth);

    lines.push('<!DOCTYPE html>');
    lines.push('<html lang="en">');
    lines.push(tab + '<head>');
    lines.push(tab + tab + '<title>' + input.title + '</title>');
    lines.push(tab + '</head>');
    lines.push(tab + '<body>');
    if (input.body) {
      for (const el of input.body) {
        this.renderElement(el, lines, 2, tab);
      }
    }
    lines.push(tab + '</body>');
    lines.push('</html>');

    return this.success(lines.join('\n'));
  }

  private renderElement(el: HtmlElement, lines: string[], depth: number, tab: string) {
    const indent = tab.repeat(depth);
    const attrs = el.attributes ? Object.entries(el.attributes).map(([k, v]) => k + '="' + v + '"').join(' ') : '';
    const attrStr = attrs ? ' ' + attrs : '';
    if (!el.content) lines.push(indent + '<' + el.tag + attrStr + '>');
    else if (typeof el.content === 'string') lines.push(indent + '<' + el.tag + attrStr + '>' + el.content + '</' + el.tag + '>');
    else {
      lines.push(indent + '<' + el.tag + attrStr + '>');
      for (const child of el.content) this.renderElement(child, lines, depth + 1, tab);
      lines.push(indent + '</' + el.tag + '>');
    }
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'html-template',
      description: 'Generate HTML document.',
      inputSchema: HtmlTemplateInputSchema,
      examples: [{ description: 'Simple HTML', input: { title: 'My App', body: [{ tag: 'h1', content: 'Welcome' }] }, outputPreview: '<h1>Welcome</h1>' }]
    };
  }
}
