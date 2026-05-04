import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { sendChatMessage } from '../services/chatApi'
import { PERSONALITIES } from '../types/chat'
import type { Message, Personality } from '../types/chat'

interface ChatSession {
  id: string
  title: string
  serverSessionId?: string
  personality: Personality
  messages: Message[]
  pending: boolean
  error: string | null
}

function newId(): string {
  return crypto.randomUUID()
}

function blankSession(personality: Personality = 'helper'): ChatSession {
  return {
    id: newId(),
    title: 'new chat',
    personality,
    messages: [],
    pending: false,
    error: null,
  }
}

const PROMPTS: Record<Personality, string> = {
  helper: '~/helper',
  pirate: '~/pirate',
  coder: '~/coder',
}

export default function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [blankSession()])
  const [activeId, setActiveId] = useState<string>(() => sessions[0].id)
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0]

  useEffect(() => {
    if (!sessions.find((s) => s.id === activeId) && sessions[0]) {
      setActiveId(sessions[0].id)
    }
  }, [sessions, activeId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [active?.messages, active?.pending])

  function patchSession(id: string, patch: Partial<ChatSession>) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  }

  function appendMessage(id: string, msg: Message, extra: Partial<ChatSession> = {}) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...extra, messages: [...s.messages, msg] } : s,
      ),
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !active || active.pending) return

    const sid = active.id
    const personality = active.personality
    const serverSid = active.serverSessionId
    const isFirstMessage = active.messages.length === 0

    const userMsg: Message = { id: newId(), role: 'user', content: text }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sid
          ? {
              ...s,
              messages: [...s.messages, userMsg],
              title: isFirstMessage ? text.slice(0, 40) : s.title,
              pending: true,
              error: null,
            }
          : s,
      ),
    )
    setInput('')

    try {
      const res = await sendChatMessage(text, personality, serverSid)
      appendMessage(
        sid,
        { id: newId(), role: 'assistant', content: res.response },
        { serverSessionId: res.sessionId, pending: false },
      )
    } catch (err) {
      patchSession(sid, {
        pending: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  function handleNewChat() {
    const s = blankSession(active?.personality ?? 'helper')
    setSessions((prev) => [...prev, s])
    setActiveId(s.id)
    setInput('')
  }

  function handleDeleteChat(id: string) {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      return filtered.length === 0 ? [blankSession()] : filtered
    })
  }

  function handleChangePersonality(p: Personality) {
    if (!active) return
    patchSession(active.id, { personality: p })
  }

  if (!active) return null

  return (
    <div className="terminal">
      <header className="terminal__bar">
        <div className="terminal__dots" aria-hidden="true">
          <span className="terminal__dot terminal__dot--close" />
          <span className="terminal__dot terminal__dot--min" />
          <span className="terminal__dot terminal__dot--max" />
        </div>
        <div className="terminal__title">{PROMPTS[active.personality]} — chat</div>
        <div className="terminal__controls">
          <label className="terminal__select">
            <span>profile</span>
            <select
              value={active.personality}
              onChange={(e) => handleChangePersonality(e.target.value as Personality)}
              disabled={active.pending}
            >
              {PERSONALITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="terminal__main">
        <aside className="sidebar">
          <div className="sidebar__header">
            <span className="sidebar__title">sessions</span>
            <button
              type="button"
              className="sidebar__new"
              onClick={handleNewChat}
              title="New chat"
            >
              + new
            </button>
          </div>
          <div className="sidebar__list">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`sidebar__item${s.id === activeId ? ' sidebar__item--active' : ''}`}
                onClick={() => setActiveId(s.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveId(s.id)
                  }
                }}
              >
                <span className="sidebar__item__sigil">$</span>
                <span className="sidebar__item__title">
                  {s.title}
                  {s.pending && <span className="sidebar__item__dot" />}
                </span>
                <button
                  type="button"
                  className="sidebar__item__remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(s.id)
                  }}
                  aria-label="Delete chat"
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="terminal__body">
          <div className="terminal__log" ref={listRef}>
            <div className="log-line log-line--meta">
              <span className="log-line__prefix">#</span>
              <span>
                session{' '}
                {active.serverSessionId
                  ? active.serverSessionId.slice(0, 8)
                  : 'new'}{' '}
                · profile {active.personality}
              </span>
            </div>

            {active.messages.map((m) => (
              <div key={m.id} className={`log-line log-line--${m.role}`}>
                <span className="log-line__prefix">
                  {m.role === 'user' ? '❯' : 'λ'}
                </span>
                <pre className="log-line__content">{m.content}</pre>
              </div>
            ))}

            {active.pending && (
              <div className="log-line log-line--assistant">
                <span className="log-line__prefix">λ</span>
                <span className="log-line__cursor" aria-label="thinking" />
              </div>
            )}

            {active.error && (
              <div className="log-line log-line--error">
                <span className="log-line__prefix">!</span>
                <span>{active.error}</span>
              </div>
            )}
          </div>

          <form className="prompt" onSubmit={handleSubmit}>
            <span className="prompt__sigil">
              <span className="prompt__path">{PROMPTS[active.personality]}</span>
              <span className="prompt__caret">❯</span>
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={active.pending ? 'waiting…' : 'type a message'}
              disabled={active.pending}
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className="prompt__send"
              disabled={active.pending || !input.trim()}
            >
              send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
