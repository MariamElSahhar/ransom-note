import { hashSeed, mulberry32 } from './random'

const FONTS = [
  { family: "'Anton', sans-serif", weight: 400 },
  { family: "'Bangers', cursive", weight: 400 },
  { family: "'Baloo 2', sans-serif", weight: 800 },
  { family: "'Caveat', cursive", weight: 700 },
  { family: "'Fredoka', sans-serif", weight: 700 },
  { family: "'Kalam', cursive", weight: 700 },
  { family: "'Permanent Marker', cursive", weight: 400 },
  { family: "'Poppins', sans-serif", weight: 900 },
]

// Curated bg/ink/outline triples so contrast always reads well.
const COLOR_COMBOS = [
  { bg: '#bfe7ff', ink: '#b6438f', outline: '#1f2937' },
  { bg: '#ff5f8f', ink: '#ffffff', outline: '#7a1450' },
  { bg: '#7b2ff7', ink: '#ffe066', outline: '#2b0a4d' },
  { bg: '#2d3a55', ink: '#ffffff', outline: '#10141f' },
  { bg: '#ffd23f', ink: '#1f2937', outline: '#7a5a00' },
  { bg: '#ff8c42', ink: '#ffffff', outline: '#7a3c00' },
  { bg: '#06d6a0', ink: '#073b3a', outline: '#024d40' },
  { bg: '#118ab2', ink: '#ffe066', outline: '#063a4a' },
  { bg: '#ef476f', ink: '#ffffff', outline: '#7a1030' },
  { bg: '#f4c4d0', ink: '#6b2d5c', outline: '#7a3c5a' },
  { bg: '#cdeb8e', ink: '#355e1f', outline: '#2e4a12' },
  { bg: '#fff0d9', ink: '#b23b3b', outline: '#8a6b3a' },
  { bg: '#c9b6ff', ink: '#2d0a4d', outline: '#4a2b7a' },
  { bg: '#ffe8f0', ink: '#7b2ff7', outline: '#b6438f' },
]

// Fixed row height (px) shared by the rendered letters and the overlay
// caret so typing stays lined up even though letter sizes vary.
export const ROW_HEIGHT = 72

export type EdgeType = 'blob' | 'torn' | 'chunky'

export interface LetterStyle {
  fontFamily: string
  fontWeight: number
  rotate: number
  fontSize: number
  color: string
  background: string
  outline: string
  translateY: number
  edgeType: EdgeType
  borderRadius?: string
  clipPath?: string
}

function generateBlobRadius(rand: () => number): string {
  const r = () => 25 + Math.floor(rand() * 45) // 25-70%
  return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`
}

function generateChunkyRadius(rand: () => number): string {
  const r = () => 4 + Math.floor(rand() * 16) // 4-20px
  return `${r()}px ${r()}px ${r()}px ${r()}px / ${r()}px ${r()}px ${r()}px ${r()}px`
}

function generateTornClipPath(rand: () => number): string {
  const steps = 9 + Math.floor(rand() * 4) // 9-12 points around the perimeter
  const points: string[] = []
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI
    const radius = 34 + rand() * 18 // 34-52% from center
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`)
  }
  return `polygon(${points.join(', ')})`
}

// Deterministic per (character, position, shuffle version) so re-renders
// stay stable but a shuffle regenerates the whole look.
export function generateLetterStyle(seedKey: string): LetterStyle {
  const rand = mulberry32(hashSeed(seedKey))

  const font = FONTS[Math.floor(rand() * FONTS.length)]
  const combo = COLOR_COMBOS[Math.floor(rand() * COLOR_COMBOS.length)]
  const edgeRoll = rand()
  const edgeType: EdgeType = edgeRoll < 0.4 ? 'blob' : edgeRoll < 0.7 ? 'torn' : 'chunky'

  const base: LetterStyle = {
    fontFamily: font.family,
    fontWeight: font.weight,
    rotate: (rand() - 0.5) * 14,
    fontSize: 14 + Math.floor(rand() * 13),
    color: combo.ink,
    background: combo.bg,
    outline: combo.outline,
    translateY: (rand() - 0.5) * 8,
    edgeType,
  }

  if (edgeType === 'blob') {
    base.borderRadius = generateBlobRadius(rand)
  } else if (edgeType === 'chunky') {
    base.borderRadius = generateChunkyRadius(rand)
  } else {
    base.clipPath = generateTornClipPath(rand)
  }

  return base
}
