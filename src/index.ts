import process from 'node:process'

// MARK: - Constants
const ESC = '\x1B['

const FG = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  grey: 90,
  normal: 39,
} as const

const BG = {
  black: 40,
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47,
  grey: 100,
} as const

const STYLE = {
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  reset: [0, 0],
} as const

// MARK: - Types

/**
 * Styler is used to style text with ANSI escape codes.
 */
export interface Styler {
  (text: string): string
  (strings: TemplateStringsArray, ...values: any[]): string

  // Foreground
  readonly black: Styler
  readonly red: Styler
  readonly green: Styler
  readonly yellow: Styler
  readonly blue: Styler
  readonly magenta: Styler
  readonly cyan: Styler
  readonly white: Styler
  readonly grey: Styler
  readonly normal: Styler

  // Background
  readonly bgBlack: Styler
  readonly bgRed: Styler
  readonly bgGreen: Styler
  readonly bgYellow: Styler
  readonly bgBlue: Styler
  readonly bgMagenta: Styler
  readonly bgCyan: Styler
  readonly bgWhite: Styler

  // Styles
  readonly bold: Styler
  readonly dim: Styler
  readonly italic: Styler
  readonly underline: Styler
  readonly inverse: Styler
  readonly hidden: Styler
  readonly strikethrough: Styler
  readonly reset: Styler
}

// Internal only
interface StylerInternal extends Styler {
  _open: string
  _close: string
  _replacements: Record<string, string>
}

// MARK: - Env Detection

function isColorSupported(): boolean {
  if (typeof process === 'undefined')
    return false

  const { env, stdout, argv, platform } = process

  const isNoColor = !!env.NO_COLOR || (argv && argv.includes('--no-color')) || !!env.NODE_DISABLE_COLORS
  const isForceColor = !!env.FORCE_COLOR || (argv && argv.includes('--color'))

  return !isNoColor && (
    isForceColor
    || platform === 'win32'
    || (!!stdout?.isTTY && env.TERM !== 'dumb')
    || !!env.CI
  )
}

const ENABLED = isColorSupported()

// MARK: - Once Setup

const styles: Record<string, { open: string, close: string }> = {}

function add(name: string, open: number, close: number) {
  styles[name] = {
    open: `${ESC}${open}m`,
    close: `${ESC}${close}m`,
  }
}

for (const [name, code] of Object.entries(FG)) {
  add(name, code, 39)
}

for (const [name, code] of Object.entries(BG)) {
  add(`bg${name.charAt(0).toUpperCase()}${name.slice(1)}`, code, 49)
}

for (const [name, [open, close]] of Object.entries(STYLE)) {
  add(name, open, close)
}

// MARK: - Styler

const proto = {}

const escapeRegex = (s: string) => s.replace(/\[/g, '\\[')

// Factory
function createStyler(open: string, close: string, regex: RegExp | null, replacements: Record<string, string>): Styler {
  const fn = function (strings: TemplateStringsArray | string, ...values: any[]) {
    let text: string
    if (typeof strings === 'string' && values.length === 0) {
      text = strings
    }
    else if (Array.isArray(strings) && (strings as any).raw) {
      text = strings[0]
      const len = values.length
      for (let i = 0; i < len; i++) {
        text += values[i] + strings[i + 1]
      }
    }
    else {
      text = String(strings)
    }

    if (!ENABLED) {
      return text
    }

    if (regex && regex.test(text)) {
      regex.lastIndex = 0
      text = text.replace(regex, match => replacements[match] || match)
    }

    return open + text + close
  } as StylerInternal

  fn._open = open
  fn._close = close
  fn._replacements = replacements

  Object.setPrototypeOf(fn, proto)
  return fn
}

// Base
const base = createStyler('', '', null, {})

for (const name in styles) {
  const { open, close } = styles[name]!

  Object.defineProperty(proto, name, {
    get() {
      const parent = this as StylerInternal
      const parentOpen = parent._open
      const parentClose = parent._close
      const parentReplacements = parent._replacements

      const newOpen = parentOpen + open
      const newClose = close + parentClose

      const newReplacements = { ...parentReplacements }

      // Handle RESET (0m) TODO: verify behavior
      const resetKey = `${ESC}0m`
      const existingReset = newReplacements[resetKey] || resetKey
      newReplacements[resetKey] = existingReset + open

      const closeKey = close
      const existingClose = newReplacements[closeKey] || closeKey
      newReplacements[closeKey] = existingClose + open

      const keys = Object.keys(newReplacements).map(escapeRegex)
      const regex = new RegExp(keys.join('|'), 'g')

      const next = createStyler(newOpen, newClose, regex, newReplacements)

      Object.defineProperty(this, name, {
        value: next,
        enumerable: true,
        configurable: false,
      })

      return next
    },
    enumerable: true,
    configurable: false,
  })
}

// MARK: - Utilities

// eslint-disable-next-line no-control-regex
const RE_ANSI = /\x1B\[\d+m/g

/**
 * Strip ANSI escape codes from a string
 * @param str - The string to strip ANSI escape codes from
 * @returns The string with ANSI escape codes removed
 */
export function strip(str: string): string {
  return str.replace(RE_ANSI, '')
}

/**
 * Get the raw length of a string, ignoring ANSI escape codes
 * @param str - The string to get the raw length of
 * @returns The raw length of the string
 */
export function rawLen(str: string): number {
  return strip(str).length
}

// MARK: - Exports

export const black: Styler = base.black
export const red: Styler = base.red
export const green: Styler = base.green
export const yellow: Styler = base.yellow
export const blue: Styler = base.blue
export const magenta: Styler = base.magenta
export const cyan: Styler = base.cyan
export const white: Styler = base.white
export const grey: Styler = base.grey
export const normal: Styler = base.normal

export const bgBlack: Styler = base.bgBlack
export const bgRed: Styler = base.bgRed
export const bgGreen: Styler = base.bgGreen
export const bgYellow: Styler = base.bgYellow
export const bgBlue: Styler = base.bgBlue
export const bgMagenta: Styler = base.bgMagenta
export const bgCyan: Styler = base.bgCyan
export const bgWhite: Styler = base.bgWhite

export const bold: Styler = base.bold
export const dim: Styler = base.dim
export const italic: Styler = base.italic
export const underline: Styler = base.underline
export const inverse: Styler = base.inverse
export const hidden: Styler = base.hidden
export const strikethrough: Styler = base.strikethrough
export const reset: Styler = base.reset
