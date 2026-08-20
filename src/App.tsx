import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import RansomNote from './components/RansomNote'
import wood from './assets/wood.jpg'
import scrap from './assets/scrap.png'
import sticker from './assets/sticker.png'

function App() {
  const [text, setText] = useState('')
  const [sessionSeed] = useState(() => Date.now())
  const noteRef = useRef<HTMLDivElement>(null)

  const download = async () => {
    if (!noteRef.current) return
    const dataUrl = await toPng(noteRef.current, {
      pixelRatio: 2,
      filter: (node) => !(node instanceof HTMLTextAreaElement),
    })
    const link = document.createElement('a')
    link.download = 'ransom-note.png'
    link.href = dataUrl
    link.click()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10 gap-6 text-stone-100"
      style={{ backgroundImage: `url(${wood})`, backgroundRepeat: 'repeat' }}
    >
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div
          className="relative flex items-center justify-center shadow"
          style={{
            backgroundImage: `url(${scrap})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 380,
            height: 214,
          }}
        >
          <h1
            className="text-5xl select-none"
            style={{
              fontFamily: "'Myfont', cursive",
              color: '#ae63bf',
            }}
          >
            Ransom Note
          </h1>
        </div>

        <button
          onClick={download}
          disabled={text.length === 0}
          aria-label="Download PNG"
          title="Download PNG"
          className="flex items-center justify-center w-18 h-18 rounded-full overflow-hidden transition-transform hover:scale-105 hover:rotate-3 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0"
          style={{
            backgroundImage: `url(${sticker})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ae63bf"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 19h16" />
          </svg>
        </button>
      </div>

      <div className="w-full max-w-3xl">
        <RansomNote ref={noteRef} text={text} onTextChange={setText} seed={sessionSeed} />
      </div>
    </div>
  )
}

export default App
