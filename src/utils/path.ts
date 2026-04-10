/**
 * Path handling utilities
 */

import fs from 'fs';
import path from 'path';

/**
 * Ensure parent directory exists for a path
 * @param filePath - Target file path
 * @returns Error message if failed, null if successful
 */
export function ensureParentDir(filePath: string): string | null {
  const parent = path.dirname(path.resolve(filePath));
  if (parent && parent !== '.' && parent !== path.resolve(filePath)) {
    try {
      fs.mkdirSync(parent, { recursive: true });
    } catch (e) {
      return `Error: Failed to create parent directory - ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return null;
}

/**
 * Check if path exists
 */
export function pathExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Check if path is a file
 */
export function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export function isDirectory(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get absolute path
 */
export function getAbsolutePath(filePath: string): string {
  return path.resolve(filePath);
}