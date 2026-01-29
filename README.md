## Lumina – Autonomous AI Research Partner

Lumina is a web-based agent crafted with Next.js 14 and Tailwind CSS. It pairs a conversational interface with the OpenAI Responses API to deliver detailed answers, contextual follow-ups, and continuous dialogue across any topic.

### Requirements

- Node.js 18+
- An `OPENAI_API_KEY` environment variable available at build and runtime

### Local Development

```bash
npm install
OPENAI_API_KEY=your-key-here npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start chatting. Messages are persisted client-side for the session and stream through the `/api/chat` endpoint.

### Deployment

1. Configure `OPENAI_API_KEY` in your hosting provider (for Vercel, add it under Project Settings → Environment Variables).
2. Build the project:

   ```bash
   npm run build
   npm run start
   ```

3. Deploy with your preferred workflow. The project is optimized for Vercel and runs entirely edge-friendly.

### Tech Stack

- Next.js App Router
- Tailwind CSS
- OpenAI Responses API (`gpt-4o-mini`)

### Customization Ideas

- Add tool integrations (search, calculators, web scraping).
- Swap OpenAI for another provider by editing `src/app/api/chat/route.ts`.
- Persist conversation history in a database or cloud KV store.
