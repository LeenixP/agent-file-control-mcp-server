import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo } from './base.js';

const GitignoreInputSchema = z.object({
  language: z.enum(['go', 'python', 'node', 'rust', 'java', 'typescript', 'general']).optional(),
  customPatterns: z.array(z.string()).optional(),
  headerComment: z.string().optional()
});

type GitignoreInput = z.infer<typeof GitignoreInputSchema>;

const PRESETS: Record<string, string[]> = {
  go: ['*.exe', '*.test', '*.out', '/vendor'],
  python: ['__pycache__/', '*.py[cod]', '.venv/', 'dist/', '*.egg'],
  node: ['node_modules/', 'dist/', 'build/', '*.log'],
  rust: ['target/', '**/*.rs.bk'],
  java: ['*.class', '/target/', '.gradle/'],
  typescript: ['node_modules/', 'dist/', '*.tsbuildinfo'],
  general: ['.DS_Store', '.idea/', '.vscode/', '*.swp', '.env', '*.log']
};

export class GitignoreGenerator extends BaseGenerator<GitignoreInput> {
  constructor(context: GeneratorContext, input: GitignoreInput) {
    super(context, GitignoreInputSchema.parse(input));
  }

  generate() {
    const input = this.input as GitignoreInput;
    const lines: string[] = [];

    if (input.headerComment) {
      lines.push('# ' + input.headerComment);
      lines.push('');
    }

    if (input.language) {
      lines.push('# ' + input.language.toUpperCase() + ' patterns');
      for (const p of PRESETS[input.language] || []) lines.push(p);
      lines.push('');
    }

    lines.push('# General patterns');
    for (const p of PRESETS.general) lines.push(p);
    lines.push('');

    if (input.customPatterns) {
      lines.push('# Custom patterns');
      for (const p of input.customPatterns) lines.push(p);
    }

    return this.success(lines.join('\n'));
  }

  static getInfo(): GeneratorInfo {
    return {
      name: 'gitignore',
      description: 'Generate .gitignore with language presets.',
      inputSchema: GitignoreInputSchema,
      examples: [
        {
          description: 'Python gitignore',
          input: { language: 'python' },
          outputPreview: '# PYTHON patterns\n__pycache__/\n*.py[cod]'
        }
      ]
    };
  }
}
