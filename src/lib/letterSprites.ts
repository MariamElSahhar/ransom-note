import { hashSeed, mulberry32 } from './random'

// Every PNG in assets/letters becomes a variant for its character. Files
// named "g.png", "g-1.png", "g-2.png" all group under "g".
const modules = import.meta.glob('../assets/letters/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// "%" can't live in a URL-safe filename, so it's stored under a plain name.
const SPECIAL_NAMES: Record<string, string> = { percent: '%' }
// Non-letter assets bundled alongside the pack (pack preview thumbnail, etc).
const EXCLUDED_NAMES = new Set(['magazine-letter-cutouts-ransom-note-cover'])

const spriteMap = new Map<string, string[]>()

for (const path in modules) {
  const filename = path.split('/').pop()!.replace(/\.png$/i, '')
  const base = filename.replace(/-\d+$/, '').toLowerCase()
  if (EXCLUDED_NAMES.has(base)) continue
  const char = SPECIAL_NAMES[base] ?? base
  const list = spriteMap.get(char) ?? []
  list.push(modules[path])
  spriteMap.set(char, list)
}

// Deterministic per seedKey so a given letter instance always picks the
// same variant across re-renders, but different instances (and shuffles)
// can land on different variants.
export function pickLetterSprite(char: string, seedKey: string): string | undefined {
  const list = spriteMap.get(char.toLowerCase())
  if (!list || list.length === 0) return undefined
  const rand = mulberry32(hashSeed(`sprite-${seedKey}`))
  return list[Math.floor(rand() * list.length)]
}
