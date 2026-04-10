import { z } from 'zod';
import { BaseGenerator, GeneratorContext, GeneratorInfo, GeneratorType } from './base.js';
import { GoConstantsGenerator } from './go-constants.js';
import { GoStructGenerator } from './go-struct.js';
import { GoInterfaceGenerator } from './go-interface.js';
import { PythonConstantsGenerator } from './python-constants.js';
import { PythonClassGenerator } from './python-class.js';
import { TypeScriptInterfaceGenerator } from './typescript-interface.js';
import { TypeScriptConstantsGenerator } from './typescript-constants.js';
import { JsonConfigGenerator } from './json-config.js';
import { YamlConfigGenerator } from './yaml-config.js';
import { ShellScriptGenerator } from './shell-script.js';
import { HtmlTemplateGenerator } from './html-template.js';
import { CssStylesGenerator } from './css-styles.js';
import { MarkdownDocGenerator } from './markdown-doc.js';
import { DockerfileGenerator } from './dockerfile.js';
import { GitignoreGenerator } from './gitignore.js';

export type GeneratorConstructor<TInput = unknown> = new (
  context: GeneratorContext,
  input: TInput
) => BaseGenerator<TInput>;

export interface RegisteredGenerator {
  type: GeneratorType;
  constructor: GeneratorConstructor;
  info: GeneratorInfo;
}

export class GeneratorRegistry {
  private generators: Map<GeneratorType, RegisteredGenerator> = new Map();

  constructor() {
    this.registerBuiltInGenerators();
  }

  private registerBuiltInGenerators(): void {
    this.register('go-constants', GoConstantsGenerator);
    this.register('go-struct', GoStructGenerator);
    this.register('go-interface', GoInterfaceGenerator);
    this.register('python-constants', PythonConstantsGenerator);
    this.register('python-class', PythonClassGenerator);
    this.register('typescript-interface', TypeScriptInterfaceGenerator);
    this.register('typescript-constants', TypeScriptConstantsGenerator);
    this.register('json-config', JsonConfigGenerator);
    this.register('yaml-config', YamlConfigGenerator);
    this.register('shell-script', ShellScriptGenerator);
    this.register('html-template', HtmlTemplateGenerator);
    this.register('css-styles', CssStylesGenerator);
    this.register('markdown-doc', MarkdownDocGenerator);
    this.register('dockerfile', DockerfileGenerator);
    this.register('gitignore', GitignoreGenerator);
  }

  register<TInput = unknown>(
    type: GeneratorType,
    constructor: GeneratorConstructor<TInput>
  ): void {
    const info = (constructor as any).getInfo() as GeneratorInfo;
    
    this.generators.set(type, {
      type,
      constructor: constructor as GeneratorConstructor,
      info
    });
  }

  get(type: GeneratorType): RegisteredGenerator | undefined {
    return this.generators.get(type);
  }

  has(type: GeneratorType): boolean {
    return this.generators.has(type);
  }

  list(): GeneratorInfo[] {
    return Array.from(this.generators.values()).map(g => g.info);
  }

  listTypes(): GeneratorType[] {
    return Array.from(this.generators.keys());
  }

  create<TInput = unknown>(
    type: GeneratorType,
    context: GeneratorContext,
    input: TInput
  ): BaseGenerator<TInput> | null {
    const registered = this.generators.get(type);
    if (!registered) return null;
    return new (registered.constructor as GeneratorConstructor<TInput>)(context, input);
  }

  getSchema(type: GeneratorType): z.ZodType<any> | undefined {
    const registered = this.generators.get(type);
    return registered?.info.inputSchema;
  }
}

export const generatorRegistry = new GeneratorRegistry();
