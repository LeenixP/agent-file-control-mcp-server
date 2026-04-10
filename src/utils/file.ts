/**
 * File operation utilities
 */

import fs from 'fs';

/**
 * Get file summary (size, lines if text file)
 * @param filePath - File path
 * @param content - File content Buffer
 * @returns Summary string
 */
export function fileSummary(filePath: string, content: Buffer): string {
  const size = content.length;
  try {
    const text = content.toString('utf-8');
    const lines = text.split('\n').length;
    return `${filePath} (${size} bytes, ${lines} lines)`;
  } catch {
    return `${filePath} (${size} bytes, binary)`;
  }
}

/**
 * Set executable permission on file
 * @param filePath - File path
 */
export function setExecutable(filePath: string): void {
  const currentMode = fs.statSync(filePath).mode;
  // Add user, group, and other execute permissions
  fs.chmodSync(filePath, currentMode | 0o111);
}

/**
 * Get file statistics
 */
export function getFileStats(filePath: string): {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  isExecutable: boolean;
  permissions: string;
  lines?: number;
  encoding?: string;
} | null {
  try {
    const stats = fs.statSync(filePath);
    const mode = stats.mode;
    const isExecutable = Boolean(mode & 0o111);
    const permissions = '0' + (mode & 0o777).toString(8).slice(-3);
    
    const result = {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      isExecutable,
      permissions
    };
    
    if (stats.isFile()) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return {
          ...result,
          lines: content.split('\n').length,
          encoding: 'utf-8'
        };
      } catch {
        return {
          ...result,
          encoding: 'binary'
        };
      }
    }
    
    return result;
  } catch {
    return null;
  }
}