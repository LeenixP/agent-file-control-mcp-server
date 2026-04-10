import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const MarkdownSectionSchema = z.object({
  heading: z.string(),
  level: z.number().default(2),
  content: z.string().optional()
});

const MarkdownDocInputSchema = z.object({
  title: z.string(),
  sections: z.array(MarkdownSectionSchema).min(1),
  tableOfContents: z.boolean().default(false)
});

type MarkdownDocInput = z.infer<typeof MarkdownDocInputSchema>;

export class MarkdownDocGenerator extends BaseGenerator<MarkdownDocInput> {
  constructor(context: GeneratorContext, input: MarkdownDocInput) {
    super(context, MarkdownDocInputSchema.parse(input));
  }

  generate() {
    const input = this.input as MarkdownDocInput;
    const lines: string[] = [];

    lines.push('# ' + input.title);
    lines.push('');

    if (input.tableOfContents) {
      lines.push('## Table of Contents');
      for (let i = 0; i < input.sections.length; i++) {
        lines.push((i + 1) + '. ' + input.sections[i].heading);
      }
      lines.push('');
    }

    for (const section of input.sections) {
      const level = section.level || 2;
      lines.push('#'.repeat(level) + ' ' + section.heading);
      lines.push('');
      if (section.content) {
        lines.push(section.content);
        lines.push('');
      }
    }

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'markdown-doc',
      description: 'Generate Markdown document.',
      inputSchema: MarkdownDocInputSchema,
      examples: [{ description: 'Simple doc', input: { title: 'API', sections: [{ heading: 'Overview' }] }, outputPreview: '# API\n\n## Overview' }]
    };
  }
}
