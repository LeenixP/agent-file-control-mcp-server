export function generateDiff(
  oldLines: string[],
  newLines: string[],
  startLine: number,
  contextLines: number = 3
): string {
  const result: string[] = [];
  const oldLen = oldLines.length;
  const newLen = newLines.length;
  const maxLen = Math.max(oldLen, newLen);

  for (let i = 0; i < maxLen; i++) {
    const lineNum = startLine + i;
    const oldContent = oldLines[i];
    const newContent = newLines[i];

    if (oldContent !== undefined && newContent !== undefined && oldContent !== newContent) {
      result.push(`  ${lineNum} -    ${oldContent}`);
      result.push(`  ${lineNum} +    ${newContent}`);
    } else if (oldContent !== undefined && newContent === undefined) {
      result.push(`  ${lineNum} -    ${oldContent}`);
    } else if (oldContent === undefined && newContent !== undefined) {
      result.push(`  ${lineNum} +    ${newContent}`);
    }
  }

  return result.join('\n');
}

export function generatePatchDiff(
  oldLines: string[],
  newLines: string[],
  startLine: number
): string {
  const result: string[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const lineNum = startLine + i;
    const oldContent = oldLines[i];
    const newContent = newLines[i];

    if (oldContent !== undefined && newContent === undefined) {
      result.push(`  ${String(lineNum).padStart(4)} -    ${oldContent}`);
    } else if (oldContent === undefined && newContent !== undefined) {
      result.push(`  ${String(lineNum).padStart(4)} +    ${newContent}`);
    } else if (oldContent !== undefined && newContent !== undefined && oldContent !== newContent) {
      result.push(`  ${String(lineNum).padStart(4)} -    ${oldContent}`);
      result.push(`  ${String(lineNum).padStart(4)} +    ${newContent}`);
    }
  }

  return result.join('\n');
}