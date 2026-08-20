import { generateLetterStyle } from '../lib/letterStyle'
import { pickLetterSprite } from '../lib/letterSprites'
import { hashSeed, mulberry32 } from '../lib/random'

interface RansomLetterProps {
  char: string
  seedKey: string
}

export default function RansomLetter({ char, seedKey }: RansomLetterProps) {
  const sprite = pickLetterSprite(char, seedKey)

  if (sprite) {
    const rand = mulberry32(hashSeed(`rotate-${seedKey}`))
    const rotate = (rand() - 0.5) * 12
    const translateY = (rand() - 0.5) * 6

    return (
      <span
        className="inline-flex items-center justify-center select-none align-middle mx-0.5 my-0.5"
        style={{ transform: `rotate(${rotate}deg) translateY(${translateY}px)` }}
      >
        <img
          src={sprite}
          alt={char}
          draggable={false}
          className="block"
          style={{ height: 56, width: 'auto' }}
        />
      </span>
    )
  }

  const style = generateLetterStyle(seedKey)

  return (
    <span
      className="inline-flex items-center justify-center select-none align-middle px-[0.5em] py-[0.2em] mx-0.5 my-0.5"
      style={{
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        fontSize: `${style.fontSize}px`,
        color: style.color,
        backgroundColor: style.background,
        borderRadius: style.borderRadius,
        clipPath: style.clipPath,
        border: style.clipPath ? 'none' : `2.5px solid ${style.outline}`,
        transform: `rotate(${style.rotate}deg) translateY(${style.translateY}px)`,
        filter: `drop-shadow(2px 3px 0 ${style.outline}) drop-shadow(2px 3px 4px rgba(0,0,0,0.25))`,
        lineHeight: 1,
      }}
    >
      {char}
    </span>
  )
}
