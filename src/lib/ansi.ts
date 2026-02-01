/**
 * Strip ANSI escape codes from text
 *
 * ANSI codes are used for terminal colors and formatting.
 * Example: "\x1B[32mGreen text\x1B[0m" -> "Green text"
 */
export function stripAnsi(text: string): string {
  return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
}
