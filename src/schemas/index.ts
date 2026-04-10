import { z } from 'zod';

export const WriteFileSchema = z.object({
  path: z.string().describe('Target file absolute path'),
  content_b64: z.string().describe('File content in base64 encoding'),
  executable: z.boolean().default(false).describe('Set chmod +x permission'),
  create_dirs: z.boolean().default(true).describe('Auto-create parent directories'),
  encoding: z.string().default('utf-8').describe('Text encoding (utf-8 by default; use "binary" for binary files)')
}).strict();

export const AppendFileSchema = z.object({
  path: z.string().describe('Target file absolute path'),
  content_b64: z.string().describe('Content to append in base64 encoding'),
  create_if_missing: z.boolean().default(true).describe('Create file if it does not exist')
}).strict();

export const ReadFileSchema = z.object({
  path: z.string().describe('File absolute path to read'),
  as_b64: z.boolean().default(false).describe('Return as base64 (for binary files or files with special characters)'),
  encoding: z.string().default('utf-8').describe('Text encoding'),
  start_line: z.number().int().min(1).optional().describe('Start line number (1-based, inclusive)'),
  end_line: z.number().int().min(1).optional().describe('End line number (1-based, inclusive)')
}).strict();

export const SearchReplaceSchema = z.object({
  path: z.string().describe('Target file absolute path'),
  old_b64: z.string().describe('Content to search for (base64 encoded)'),
  new_b64: z.string().describe('Replacement content (base64 encoded)'),
  count: z.number().int().default(-1).describe('Number of replacements (-1 for all, 1 for first occurrence)'),
  encoding: z.string().default('utf-8').describe('File encoding')
}).strict();

export const PatchLinesSchema = z.object({
  path: z.string().describe('Target file absolute path'),
  start_line: z.number().int().min(1).describe('Start line number (1-based, inclusive)'),
  end_line: z.number().int().min(1).describe('End line number (1-based, inclusive)'),
  new_content_b64: z.string().describe('Replacement content in base64 (can be multi-line)'),
  encoding: z.string().default('utf-8').describe('File encoding')
}).strict();

export const FileInfoSchema = z.object({
  path: z.string().describe('File or directory absolute path')
}).strict();

export const ListDirSchema = z.object({
  path: z.string().describe('Directory absolute path'),
  recursive: z.boolean().default(false).describe('List subdirectories recursively'),
  max_depth: z.number().int().min(1).max(10).default(3).describe('Maximum recursion depth'),
  show_hidden: z.boolean().default(false).describe('Show hidden files (starting with .)'),
  pattern: z.string().optional().describe('File name filter pattern (e.g., "*.ts")')
}).strict();

export const CopyMoveSchema = z.object({
  src: z.string().describe('Source file/directory absolute path'),
  dst: z.string().describe('Destination absolute path'),
  overwrite: z.boolean().default(false).describe('Overwrite if destination exists')
}).strict();

export const DeleteSchema = z.object({
  path: z.string().describe('File or directory absolute path to delete'),
  recursive: z.boolean().default(false).describe('Delete directories recursively (dangerous)')
}).strict();

export const MkdirSchema = z.object({
  path: z.string().describe('Directory absolute path to create')
}).strict();

export const EncodeStringSchema = z.object({
  text: z.string().describe('String to encode to base64')
}).strict();

export const DecodeB64Schema = z.object({
  b64: z.string().describe('Base64 string to decode'),
  encoding: z.string().default('utf-8').describe('Text encoding for output')
}).strict();

export type WriteFileInput = z.infer<typeof WriteFileSchema>;
export type AppendFileInput = z.infer<typeof AppendFileSchema>;
export type ReadFileInput = z.infer<typeof ReadFileSchema>;
export type SearchReplaceInput = z.infer<typeof SearchReplaceSchema>;
export type PatchLinesInput = z.infer<typeof PatchLinesSchema>;
export type FileInfoInput = z.infer<typeof FileInfoSchema>;
export type ListDirInput = z.infer<typeof ListDirSchema>;
export type CopyMoveInput = z.infer<typeof CopyMoveSchema>;
export type DeleteInput = z.infer<typeof DeleteSchema>;
export type MkdirInput = z.infer<typeof MkdirSchema>;
export type EncodeStringInput = z.infer<typeof EncodeStringSchema>;
export type DecodeB64Input = z.infer<typeof DecodeB64Schema>;