import type { ChatRequest, ChatResponse, Personality } from '../types/chat'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const CHAT_ENDPOINT = `${API_BASE}/api/v1/chat`

export async function sendChatMessage(
  message: string,
  personality: Personality,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const body: ChatRequest = { personality, message, sessionId }

  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as ChatResponse
}
