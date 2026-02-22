/**
 * Auto-continue logic for list editing.
 *
 * When a user presses Enter at the end of a list line,
 * the editor should continue with the same prefix (checkbox or bullet).
 * When they press Enter on an empty list line, it should be removed.
 *
 * These are pure functions — the React Native / Web integration
 * happens in the respective hooks/components.
 */

/**
 * Given the current line text, returns the prefix string to insert
 * on the next line for auto-continuation.
 *
 * Returns null if the line is not a list item or has no content
 * (empty list lines should be removed, not continued).
 */
export function getAutoContinuePrefix(currentLine: string): string | null {
  // Empty list lines should be removed, not continued
  if (shouldRemoveEmptyLine(currentLine)) {
    return null;
  }

  // Auto-continue checkbox with content: "- [ ] text" or "- [x] text" + Enter → new "- [ ] "
  if (currentLine.match(/^- \[ \] .+/) || currentLine.match(/^- \[x\] .+/i)) {
    return '- [ ] ';
  }

  // Auto-continue bullet with content: "• text" + Enter → new "• "
  if (currentLine.match(/^[•\-\*] .+/)) {
    return '• ';
  }

  return null;
}

/**
 * Returns true if the current line is an empty list line that should
 * be removed when Enter is pressed (instead of continued).
 *
 * Empty list lines: "- [ ] ", "- [x] ", "• ", "- ", "* "
 */
export function shouldRemoveEmptyLine(currentLine: string): boolean {
  return (
    currentLine === '- [ ] ' ||
    currentLine === '- [x] ' ||
    currentLine === '• ' ||
    currentLine === '- ' ||
    currentLine === '* '
  );
}
