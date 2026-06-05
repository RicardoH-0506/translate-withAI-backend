Here is the new `README.md` content you can copy and use for your GitHub repository:

---

```markdown
# Diglossify — AI Translation & Transcription Backend

An enterprise-grade backend service for real-time text translation and audio transcription, powered by Cohere and Groq AI. Built with Node.js, Express, and TypeScript following **Clean Architecture** and **Screaming Architecture** principles.

---

## Features

- **Text Translation (REST)** — Translate text between multiple languages via a stateless HTTP endpoint, with automatic source language detection.
- **Audio Transcription & Translation (WebSocket)** — Stream binary audio chunks in real time; the server transcribes them with Whisper (via Groq) and then translates the result with Cohere.
- **Zod Validation** — Schema-based request validation on all inputs.
- **Rate Limiting** — Configurable per-IP limits to protect against abuse.
- **CORS Control** — Allowlist-based origin validation.
- **Security Hardening** — `X-Powered-By` header disabled, environment-based secrets.
- **Fully Typed** — Written in TypeScript end-to-end.
- **Tested** — Integration test suite using Vitest and Supertest.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | LTS |
| Framework | Express | 5.1.0 |
| Language | TypeScript | ^6.0.3 |
| AI — Translation | Cohere (`command-a-translate-08-2025`) | ^7.19.0 |
| AI — Transcription | Groq (`whisper-large-v3-turbo`) | ^1.2.0 |
| WebSocket | ws | ^8.21.0 |
| Validation | Zod | 4.1.11 |
| Rate Limiting | express-rate-limit | ^8.2.1 |
| Testing | Vitest + Supertest | ^4.0.18 / ^7.2.2 |
| Package Manager | pnpm | 10.17.1 |

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- pnpm `10.17.1+`
- A [Cohere](https://cohere.com/) API key
- A [Groq](https://console.groq.com/) API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RicardoH-0506/diglossify-backend.git
cd diglossify-backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
COHERE_API_KEY=your_cohere_api_key
GROQ_API_KEY=your_groq_api_key
PORT=1234
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_CONNECTIONS_PER_IP=5
```

### Running the Server

```bash
# Development (with hot reload)
pnpm dev

# Production (compile first, then run)
pnpm build
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint
pnpm lint
pnpm lint:fix
```

The server will be available at:
- HTTP: `http://localhost:1234`
- WebSocket: `ws://localhost:1234`

---

## Project Structure

The project follows **Screaming Architecture** — the folder structure communicates the domain intent, not the framework.

```
diglossify-backend/
├── src/
│   └── features/
│       └── translation/          # All translation domain logic
│           ├── translation.api.ts        # AI provider calls (Cohere, Groq)
│           ├── translation.logic.ts      # Domain validation & language mapping
│           ├── translation.routes.ts     # Express router (POST /translate)
│           ├── translation.ws.ts         # WebSocket server setup & protocol
│           ├── translation.schemas.ts    # Zod schemas
│           ├── translation.prompts.ts    # AI prompt engineering
│           └── translation.types.ts      # Shared TypeScript types
├── tests/
│   └── pipeline.spec.ts          # Integration tests (HTTP + WebSocket)
├── server.ts                     # Entry point — HTTP + WebSocket bootstrap
├── package.json
├── tsconfig.json
├── vitest.config.js
├── eslint.config.mjs
└── .env.example
```

Node.js sub-path imports are configured in `package.json` for clean internal imports:

```json
"imports": {
  "#core/*": "./src/core/*",
  "#application/*": "./src/application/*",
  "#infrastructure/*": "./src/infrastructure/*",
  "#presentation/*": "./src/presentation/*",
  "#shared/*": "./src/shared/*"
}
```

---

## Architecture

A single TCP port handles both HTTP and WebSocket traffic. The server bootstraps Express and attaches the WebSocket server to the same underlying `http.Server` instance.

```
Client
  │
  ├── POST /translate ──► corsMiddleware ──► rateLimit ──► translationRouter
  │                                                              │
  │                                                    Zod parse ──► validateLanguage
  │                                                              │
  │                                                       translateText() [Cohere]
  │
  └── ws:// ──────────────► verifyClient (origin check)
                                    │
                          { type: "setup" }  ──► store session (fromLang, toLang)
                          Binary chunks      ──► accumulate audioChunks[]
                          { type: "stop" }   ──► transcribeAudio() [Groq Whisper]
                                                       │
                                                 translateText() [Cohere]
                                                       │
                                             { type: "result", ... }
```

---

## API Reference

### `GET /`

Health check and service metadata.

**Response `200 OK`:**
```json
{
  "name": "AI Translation & Transcription API",
  "version": "1.2.0",
  "status": "healthy",
  "uptime": 123.45,
  "environment": "production",
  "endpoints": {
    "translation": "/translate"
  }
}
```

---

### `POST /translate`

Translate text between languages.

**Request Body:**
```json
{
  "fromLang": "en",
  "toLang": "es",
  "text": "Hello, world!",
  "messages": []
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `fromLang` | string | Yes | Source language code or name. Use `"auto"` for detection. |
| `toLang` | string | Yes | Target language code or name. |
| `text` | string | Yes | Text to translate (min 1 character). |
| `messages` | array | No | Optional conversation history for context. |

**Success Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "text": "Hello, world!",
    "translatedText": "¡Hola, mundo!",
    "fromLang": "en",
    "toLang": "es"
  }
}
```

**Error Response `500`:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Rate Limit Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640995200
```

---

### WebSocket `ws://[host]:[port]`

Real-time audio transcription and translation pipeline.

#### Connection Constraints
- Max **5 concurrent connections per IP**. Exceeding this closes the connection with code `1008`.
- Server sends a `ping` every 30 seconds; clients must respond with `pong`.

#### Protocol Flow

**1. Setup** (must be sent first):
```json
{ "type": "setup", "fromLang": "en", "toLang": "es" }
```

**2. Stream Audio** — Send raw binary audio chunks (max **1 MB** per chunk).

**3. Stop** — Signal end of stream:
```json
{ "type": "stop" }
```

#### Server Messages

| Type | Description | Shape |
|---|---|---|
| `status` | Pipeline progress update | `{ "type": "status", "message": "..." }` |
| `result` | Final output | `{ "type": "result", "text": "...", "translatedText": "...", "fromLang": "...", "toLang": "..." }` |
| `error` | Validation or processing failure | `{ "type": "error", "message": "..." }` |

---

## Security

| Measure | Detail |
|---|---|
| CORS | Allowlist via `ALLOWED_ORIGINS` env var; all `localhost` origins allowed in dev |
| Rate Limiting | 100 req / 15 min per IP (global); configurable via env |
| WebSocket Connections | Max 5 per IP |
| Audio Chunk Size | Max 1 MB per binary message |
| Header Security | `X-Powered-By` disabled |
| Input Validation | Zod schemas on all HTTP and WebSocket inputs |
| Secrets | All API keys via environment variables only |

---

## Testing

Integration tests cover both the HTTP and WebSocket pipelines using Supertest and the `ws` client.

```bash
pnpm test
```

Tests are located in `tests/pipeline.spec.ts` and run with Vitest.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure all new features include tests and pass linting (`pnpm lint`).

---

## Author

**Ricardo H** — [@RicardoH-0506](https://github.com/RicardoH-0506)

---

## License

MIT License
