interface Props {
  onStart: () => void
}

export default function WelcomeModal({ onStart }: Props) {
  return (
    <div className="welcome-backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-modal">
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
          <button className="welcome-modal__btn" onClick={onStart} autoFocus>
            Start chatting
          </button>
        </div>
      </div>
    </div>
  )
}
