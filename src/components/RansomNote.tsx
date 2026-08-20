import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import RansomLetter from './RansomLetter'
import { ROW_HEIGHT } from '../lib/letterStyle'
import paperBg from '../assets/paper-bg.png'

interface RansomNoteProps {
  text: string
  onTextChange: (text: string) => void
  seed: number
}

const SPACE_WIDTH = 18

// A zero-width marker rendered at every possible cursor position (0..text.length)
// so the custom caret can be placed at the real pixel edge of a letter image
// instead of guessing from a generic font's metrics.
function CaretAnchor({
  index,
  registry,
}: {
  index: number
  registry: React.MutableRefObject<Map<number, HTMLSpanElement>>
}) {
  return (
    <span
      aria-hidden
      className="inline-block w-0"
      ref={(el) => {
        if (el) registry.current.set(index, el)
        else registry.current.delete(index)
      }}
    />
  )
}

const RansomNote = forwardRef<HTMLDivElement, RansomNoteProps>(function RansomNote(
  { text, onTextChange, seed },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const anchorsRef = useRef(new Map<number, HTMLSpanElement>())
  const [cursor, setCursor] = useState(0)
  const [caretRect, setCaretRect] = useState<{ left: number; top: number; height: number } | null>(
    null,
  )

  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  const syncCursor = (el: HTMLTextAreaElement) => {
    setCursor(el.selectionStart ?? el.value.length)
  }

  // The native textarea has its own font/wrapping, so its selectionStart
  // after a click doesn't match where the user actually clicked among the
  // rendered letters. Snap to whichever anchor is really closest instead.
  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const clickX = e.clientX - containerRect.left
    const clickY = e.clientY - containerRect.top

    let bestIndex = 0
    let bestDist = Infinity
    anchorsRef.current.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      const x = rect.left - containerRect.left
      const y = rect.top - containerRect.top + ROW_HEIGHT / 2
      const dist = Math.abs(y - clickY) * 1000 + Math.abs(x - clickX)
      if (dist < bestDist) {
        bestDist = dist
        bestIndex = index
      }
    })

    e.currentTarget.setSelectionRange(bestIndex, bestIndex)
    setCursor(bestIndex)
  }

  // The note's background image has a fixed aspect ratio, so once it's on
  // screen there's a hard pixel limit to how much text fits inside it.
  // Trim the last character whenever the rendered letters overflow that box.
  useLayoutEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content || text.length === 0) return

    const maxHeight = container.clientHeight - 64 // p-8 top + bottom padding
    if (content.scrollHeight > maxHeight) {
      onTextChange(text.slice(0, -1))
    }
  }, [text, onTextChange])

  // Position the custom caret using the real rendered position of the
  // letter image it sits next to, rather than a generic font's metrics.
  useLayoutEffect(() => {
    const container = containerRef.current
    const anchor = anchorsRef.current.get(Math.min(cursor, text.length))
    if (!container || !anchor) {
      setCaretRect(null)
      return
    }
    const containerRect = container.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    setCaretRect({
      left: anchorRect.left - containerRect.left,
      top: anchorRect.top - containerRect.top + (ROW_HEIGHT - 56) / 2,
      height: 56,
    })
  }, [text, cursor])

  let charIndex = 0
  const lines = text.split('\n')

  return (
    <div
      ref={setRefs}
      className="relative p-8 aspect-[1339/1080] w-full overflow-hidden"
    >
      <img
        src={paperBg}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />

      <div
        ref={contentRef}
        className="relative text-center"
        style={{ lineHeight: `${ROW_HEIGHT}px` }}
      >
        {lines.map((line, lineIndex) => {
          if (lineIndex > 0) charIndex += 1 // account for the '\n' between lines

          return (
            <span key={`line-${lineIndex}`}>
              {lineIndex > 0 && <br />}
              {line.length === 0 && <CaretAnchor index={charIndex} registry={anchorsRef} />}
              {line.split(/(\s+)/).map((word, wordIndex) => {
                if (/^\s+$/.test(word)) {
                  return (
                    <span key={`space-${wordIndex}`}>
                      {word.split('').map((_, spaceIndex) => {
                        const thisIndex = charIndex++
                        return (
                          <span key={`space-${wordIndex}-${spaceIndex}`} className="relative">
                            <CaretAnchor index={thisIndex} registry={anchorsRef} />
                            <span
                              aria-hidden
                              className="inline-block align-middle"
                              style={{ width: SPACE_WIDTH }}
                            />
                          </span>
                        )
                      })}
                    </span>
                  )
                }
                return (
                  <span
                    key={`word-${wordIndex}`}
                    className="inline-block max-w-full break-words"
                  >
                    {word.split('').map((char, letterIndex) => {
                      const thisIndex = charIndex++
                      return (
                        <span key={`${lineIndex}-${wordIndex}-${letterIndex}-${char}`} className="relative">
                          <CaretAnchor index={thisIndex} registry={anchorsRef} />
                          <RansomLetter char={char} seedKey={`${seed}-${lineIndex}-${wordIndex}-${letterIndex}-${char}`} />
                        </span>
                      )
                    })}
                  </span>
                )
              })}
            </span>
          )
        })}
        <CaretAnchor index={charIndex} registry={anchorsRef} />
      </div>

      {caretRect && (
        <span
          aria-hidden
          className="absolute w-[2px] bg-neutral-800 animate-caret-blink pointer-events-none"
          style={{ left: caretRect.left, top: caretRect.top, height: caretRect.height }}
        />
      )}

      <textarea
        autoFocus
        value={text}
        onChange={(e) => {
          onTextChange(e.target.value)
          syncCursor(e.target)
        }}
        onClick={handleClick}
        onKeyUp={(e) => syncCursor(e.currentTarget)}
        spellCheck={false}
        className="absolute inset-0 w-full h-full resize-none appearance-none bg-transparent text-transparent text-center outline-none p-8"
        style={{ fontSize: 34, lineHeight: `${ROW_HEIGHT}px`, caretColor: 'transparent' }}
      />
    </div>
  )
})

export default RansomNote
