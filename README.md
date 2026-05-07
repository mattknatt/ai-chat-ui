# chat-frontend

A terminal-style chat UI built with React and Vite. Connects to a Spring Boot backend deployed on [Fly.io](https://fly.io) that handles AI chat sessions via an LLM gateway.

## Stack

- React 19 + TypeScript
- Vite
- Catppuccin Mocha theme

## Backend

The backend is a Spring Boot app deployed at `https://spring-llm-gateway.fly.dev`. It exposes a single endpoint:

```
POST /api/v1/chat
```

```json
{
  "message": "Hello",
  "personality": "helper",
  "sessionId": "optional-session-id"
}
```

Sessions are maintained server-side — passing the returned `sessionId` back in subsequent requests preserves conversation context.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

To preview the production build (calls the Fly backend directly):

```bash
npm run preview
```

## Personalities

| Name | Description |
|---|---|
| `helper` | General-purpose assistant |
| `pirate` | Responds in pirate speak |
| `coder` | Focused on programming help |
