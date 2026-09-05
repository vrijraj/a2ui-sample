# A2UI × Next.js example

A minimal [Next.js](https://nextjs.org) app that demonstrates [A2UI](https://a2ui.org/) — a protocol for agents to send **declarative UI** that clients render with native components.

This example uses:

- `@a2ui/react` + `@a2ui/web_core` (v0.9 protocol)
- **[shadcn/ui](https://ui.shadcn.com/)** for structure (Button, Card, Input, Badge, …)
- **Google-style CSS** (Roboto, Google Blue, Material-like elevation) — no `@mui/*`
- A mock agent API (`/api/a2ui`) that streams A2UI messages over SSE
- A restaurant booking flow (search → form → confirmation)

No Gemini/OpenAI key is required. The “agent” returns handcrafted A2UI JSON so you can learn the message shape end-to-end.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What to try

1. Click **Find Italian restaurants** — the agent streams `createSurface` / `updateComponents` / `updateDataModel` messages and the React renderer builds a list of cards.
2. Click **Book a table** on a restaurant — the client sends an A2UI action; the mock agent responds with a reservation form.
3. Submit the form — the agent returns a confirmation surface.

## How it works

```
User prompt / UI action
        │
        ▼
 POST /api/a2ui  ──SSE──►  MessageProcessor.processMessages()
                                    │
                                    ▼
                              A2uiSurface (native React widgets)
```

Key files:

| Path | Role |
| --- | --- |
| `src/components/A2uiDemo.tsx` | Client: processor, SSE consumer, surface render |
| `src/app/api/a2ui/route.ts` | Mock agent that streams A2UI JSON |
| `src/lib/a2ui/scenarios.ts` | Declarative UI payloads for each step |

## Next steps

- Swap the mock route for a real LLM agent that emits the same A2UI message types ([spec](https://a2ui.org/specification/v0.9.1-a2ui/)).
- Add a custom catalog beyond the Basic Catalog ([guide](https://a2ui.org/guides/client-setup/)).
- Use A2A / CopilotKit transports if you need a full agent harness ([docs](https://a2ui.org/guides/a2ui-with-any-agent-framework/)).

## License

Example code in this repo is for learning. A2UI itself is Apache 2.0 ([a2ui.org](https://a2ui.org/)).
