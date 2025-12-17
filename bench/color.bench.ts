import chalk from 'chalk'
import kleur from 'kleur'
import { bench, describe } from 'vitest'
import * as yocto from 'yoctocolors'
import * as tint from '../src'

const SAMPLE = 'The quick brown fox jumps over the lazy dog'
const VALUE = 42

describe('cached (local variable)', () => {
  const chalkCached = chalk.cyan.bold
  bench('chalk: cached', () => {
    chalkCached(SAMPLE)
  })

  const kleurCached = kleur.cyan().bold
  bench('kleur: cached', () => {
    kleurCached(SAMPLE)
  })

  const tintCached = tint.cyan.bold
  bench('@uttr/tint: cached', () => {
    tintCached(SAMPLE)
  })
})

describe('simple chained styling', () => {
  bench('chalk: chain', () => {
    chalk.cyan.bold(SAMPLE)
  })

  bench('kleur: chain', () => {
    kleur.cyan().bold(SAMPLE)
  })

  bench('yocto: chain (functional)', () => {
    yocto.cyan(yocto.bold(SAMPLE))
  })

  bench('@uttr/tint: chain', () => {
    tint.cyan.bold(SAMPLE)
  })
})

describe('template literal usage', () => {
  bench('chalk: template literal', () => {
    chalk.green.bold`value = ${VALUE}`
  })

  bench('kleur: template literal', () => {
    kleur.green().bold(`value = ${VALUE}`)
  })

  bench('@uttr/tint: template literal', () => {
    tint.green.bold`value = ${VALUE}`
  })
})

describe('cached template literal usage', () => {
  const chalkCachedTemplate = chalk.magenta.underline
  bench('chalk: cached template literal', () => {
    chalkCachedTemplate`value = ${VALUE}`
  })

  const kleurCachedTemplate = kleur.magenta().underline
  bench('kleur: cached template literal', () => {
    kleurCachedTemplate(`value = ${VALUE}`)
  })

  const tintCachedTemplate = tint.magenta.underline
  bench('@uttr/tint: cached template literal', () => {
    tintCachedTemplate`value = ${VALUE}`
  })
})

describe('nested template literal usage', () => {
  bench('chalk: nested template literal', () => {
    chalk.red.bold`hello ${chalk.yellow.italic`world`}`
  })

  bench('kleur: nested template literal', () => {
    kleur.red().bold(`hello ${kleur.yellow().italic('world')}`)
  })

  bench('yocto: nested functional', () => {
    yocto.red(yocto.bold(`hello ${yocto.yellow(yocto.italic('world'))}`))
  })

  bench('@uttr/tint: nested template literal', () => {
    tint.red.bold`hello ${tint.yellow.italic`world`}`
  })
})
