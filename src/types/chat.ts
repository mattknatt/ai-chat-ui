export type Role = 'user' | 'assistant'

export type Personality = 'helper' | 'pirate' | 'coder'

export const PERSONALITIES: Personality[] = ['helper', 'pirate', 'coder']

export interface Message {
  id: string
  role: Role
  content: string
}

export interface ChatRequest {
  personality: Personality
  message: string
  sessionId?: string
}

export interface ChatResponse {
  response: string
  sessionId: string
}
