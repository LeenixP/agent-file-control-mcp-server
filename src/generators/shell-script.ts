import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const ShellScriptInputSchema = z.object({
  shebang: z.string().default('#!/bin/bash'),
  headerComment: z.string().optional(),
  variables: z.array(z.object({ name: z.string(), value: z.string(), comment: z.string().optional() })).optional(),
  commands: z.array(z.object({ command: z.string(), comment: z.string().optional() })).min(1),
  strictMode: z.boolean().default(true)
});

type ShellScriptInput = z.infer<typeof ShellScriptInputSchema>;

export class ShellScriptGenerator extends BaseGenerator<ShellScriptInput> {
  constructor(context: GeneratorContext, input: ShellScriptInput) {
    super(context, ShellScriptInputSchema.parse(input));
    this.context.executable = true;
  }

  generate() {
    const input = this.input as ShellScriptInput;
    const lines: string[] = [];

    lines.push(input.shebang);
    lines.push('');

    if (input.headerComment) {
      lines.push('# ' + input.headerComment);
      lines.push('');
    }

    if (input.strictMode) {
      lines.push('set -euo pipefail');
      lines.push('');
    }

    if (input.variables) {
      for (const v of input.variables) {
        if (v.comment) lines.push('# ' + v.comment);
        lines.push(v.name + '="' + v.value + '"');
      }
      lines.push('');
    }

    for (const c of input.commands) {
      if (c.comment) lines.push('# ' + c.comment);
      lines.push(c.command);
    }

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'shell-script',
      description: 'Generate shell script with shebang and commands.',
      inputSchema: ShellScriptInputSchema,
      examples: [
        {
          description: 'Simple script',
          input: { commands: [{ command: 'echo "Hello"' }] },
          outputPreview: '#!/bin/bash\nset -euo pipefail\n\necho "Hello"'
        }
      ]
    };
  }
}
