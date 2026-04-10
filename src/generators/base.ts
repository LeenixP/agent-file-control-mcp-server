import { z } from 'zod';

export type GeneratorType = string;

export interface GeneratorContext {
  path: string;
  encoding: BufferEncoding;
  executable: boolean;
  metadata?: Record<string, unknown>;
}

export interface GeneratorResult {
  success: boolean;
  content: string;
  lines: number;
  bytes: number;
  error?: string;
}

export interface GeneratorInfo {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  examples: GeneratorExample[];
}

export interface GeneratorExample {
  description: string;
  input: Record<string, unknown>;
  outputPreview: string;
}

export abstract class BaseGenerator<TInput = unknown> {
  protected context: GeneratorContext;
  protected input: TInput;

  constructor(context: GeneratorContext, input: TInput) {
    this.context = context;
    this.input = input;
  }

  abstract generate(): GeneratorResult;

  static getInfo(): GeneratorInfo {
    throw new Error('Subclass must implement static getInfo()');
  }

  protected calculateStats(content: string): { lines: number; bytes: number } {
    const lines = content.split('\n').length;
    const bytes = Buffer.byteLength(content, this.context.encoding);
    return { lines, bytes };
  }

  protected success(content: string): GeneratorResult {
    const stats = this.calculateStats(content);
    return {
      success: true,
      content,
      lines: stats.lines,
      bytes: stats.bytes
    };
  }

  protected error(message: string): GeneratorResult {
    return {
      success: false,
      content: '',
      lines: 0,
      bytes: 0,
      error: message
    };
  }
}
