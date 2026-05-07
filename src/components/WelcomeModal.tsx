import { useEffect, useRef } from 'react'

interface Props {
  onStart: () => void
}

export default function WelcomeModal({ onStart }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null

    const focusable = () =>
      Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )

    focusable()[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onStart(); return }
      if (e.key !== 'Tab') return
      const els = focusable()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      prev?.focus()
    }
  }, [onStart])

  return (
    <div className="welcome-backdrop">
      <div
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        ref={modalRef}
      >
        <div className="welcome-modal__bar">
          <div className="terminal__dots" aria-hidden="true">
            <span className="terminal__dot terminal__dot--close" />
            <span className="terminal__dot terminal__dot--min" />
            <span className="terminal__dot terminal__dot--max" />
          </div>
          <span className="welcome-modal__bar-title">welcome</span>
        </div>
        <div className="welcome-modal__body">
          <p className="welcome-modal__prompt">
            <span className="welcome-modal__sigil">λ</span>
            <span id="welcome-title">Personal AI Chat</span>
          </p>
          <p className="welcome-modal__desc">
            A terminal-style chat interface powered by a Spring Boot backend.
            Pick a personality — <em>helper</em>, <em>pirate</em>, or <em>coder</em> —
            and start a conversation. Sessions are maintained server-side so context
            carries across messages.
          </p>
          <button className="welcome-modal__btn" onClick={onStart}>
            Start chatting
          </button>
        </div>
      </div>
    </div>
  )
}
