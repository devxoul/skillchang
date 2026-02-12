/**
 * Strip ANSI escape codes from text
 *
 * ANSI codes are used for terminal colors and formatting.
 * Example: "\x1B[32mGreen text\x1B[0m" -> "Green text"
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes require matching the ESC control character
const ANSI_REGEX = /\x1B\[[0-9;]*[a-zA-Z]/g

export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '')
}
