/**
 * Error handling utilities
 */

/**
 * Format error for tool response
 * @param error - Error object or message
 * @returns Formatted error message string
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.name}: ${error.message}`;
  }
  return `Error: ${String(error)}`;
}

/**
 * Create permission denied error message
 * @param path - File/directory path
 * @param operation - Operation type (read, write, delete)
 */
export function permissionDenied(path: string, operation: string): string {
  return `Error: Permission denied - cannot ${operation} ${path}`;
}

/**
 * Create path not found error message
 * @param path - File/directory path
 * @param type - Expected type (file, directory)
 */
export function pathNotFound(path: string, type: 'file' | 'directory' | 'path' = 'path'): string {
  return `Error: ${type} not found - ${path}`;
}

/**
 * Create path already exists error message
 * @param path - File/directory path
 */
export function pathAlreadyExists(path: string): string {
  return `Error: Path already exists - ${path}`;
}

/**
 * Create invalid line range error message
 * @param startLine - Start line number
 * @param endLine - End line number
 * @param totalLines - Total lines in file
 */
export function invalidLineRange(startLine: number, endLine: number, totalLines: number): string {
  return `Error: Line range ${startLine}-${endLine} exceeds file range (${totalLines} lines total)`;
}

/**
 * Create search pattern not found error message
 * @param patternPreview - Preview of search pattern (first 100 chars)
 */
export function searchPatternNotFound(patternPreview: string): string {
  return `Error: Pattern not found, file unchanged\nSearch pattern preview: ${patternPreview}`;
}