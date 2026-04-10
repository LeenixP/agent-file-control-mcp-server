import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const DockerfileStageSchema = z.object({
  from: z.string(),
  as: z.string().optional(),
  commands: z.array(z.object({
    instruction: z.string(),
    args: z.union([z.string(), z.array(z.string())]),
    comment: z.string().optional()
  }))
});

const DockerfileInputSchema = z.object({
  headerComment: z.string().optional(),
  stages: z.array(DockerfileStageSchema).min(1)
});

type DockerfileInput = z.infer<typeof DockerfileInputSchema>;

export class DockerfileGenerator extends BaseGenerator<DockerfileInput> {
  constructor(context: GeneratorContext, input: DockerfileInput) {
    super(context, DockerfileInputSchema.parse(input));
  }

  generate() {
    const input = this.input as DockerfileInput;
    const lines: string[] = [];

    if (input.headerComment) {
      lines.push('# ' + input.headerComment);
      lines.push('');
    }

    for (let i = 0; i < input.stages.length; i++) {
      const stage = input.stages[i];
      if (i > 0) lines.push('');
      lines.push(stage.as ? 'FROM ' + stage.from + ' AS ' + stage.as : 'FROM ' + stage.from);
      for (const cmd of stage.commands) {
        if (cmd.comment) lines.push('# ' + cmd.comment);
        const argsStr = Array.isArray(cmd.args) ? cmd.args.join(' ') : cmd.args;
        lines.push(cmd.instruction + ' ' + argsStr);
      }
    }

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'dockerfile',
      description: 'Generate Dockerfile with multi-stage support.',
      inputSchema: DockerfileInputSchema,
      examples: [
        {
          description: 'Simple Dockerfile',
          input: { stages: [{ from: 'node:20-alpine', commands: [{ instruction: 'WORKDIR', args: '/app' }] }] },
          outputPreview: 'FROM node:20-alpine\nWORKDIR /app'
        }
      ]
    };
  }
}
