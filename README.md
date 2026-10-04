# SOCIAL OS

SOCIAL OS is a local-first MVP for turning a brand brief into a campaign strategy, 7-day content calendar, creative direction, and Miro-ready workspace.

## Run locally

```powershell
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`

To run them separately:

```powershell
npm run dev:client
npm run dev:server
```

## Environment

Copy `.env.example` to `.env` for the local API port and future provider integrations:

```text
PORT=8787
AI_API_KEY=
HF_TOKEN=
MIRO_ACCESS_TOKEN=
MIRO_BOARD_ID=
```

`HF_TOKEN` is optional until image generation is used. Put the replacement Hugging Face token only in the local `.env` file; never place it in `.env.example`, React code, browser storage, logs, or API responses. The previously exposed token should be revoked.

The current MVP uses the connected Miro MCP board at `https://miro.com/app/board/uXjVEervLkQ=/` for the campaign workspace, so Miro access tokens and board IDs are not required by the app. Brand and campaign state are saved in browser `localStorage`. Miro Workspace renders a local preview of the MCP-created structure.

## Available API routes

- `POST /api/campaign/generate`
- `POST /api/content/generate`
- `POST /api/creative/generate`
- `POST /api/images/generate`
- `GET /api/miro/test`
- `POST /api/miro/sync`
- `GET /api/campaigns/:campaignId/miro-payload`

## What is functional

- Responsive SaaS dashboard and sidebar navigation
- Brand Studio form with local persistence
- Demo campaign generation with structured strategy, pillars, and seven calendar items
- Content calendar with selectable details
- Creative Studio with three visual directions and explicit Hugging Face image generation
- Campaign-derived creative prompts and generated image metadata persisted with the campaign
- Generated images served from `/generated-assets/:fileName`
- Approval/status states in the calendar data
- Miro preview workspace and modal
- Backend endpoints with validation and credential-aware Miro fallback
- Unique campaign IDs, campaign collection persistence, and explicit Miro sync states
- `Sync to Miro` and `Copy Miro Sync Payload` controls on the campaign completion view

Campaign text generation remains demo-safe. Image generation uses the official `@huggingface/inference` SDK and `black-forest-labs/FLUX.1-schnell` through Hugging Face Inference Providers. The backend writes generated assets to `generated-assets/`; the browser only receives a safe image ID, URL, and prompt.

## Campaign-to-Miro synchronization

The browser does not call a Miro REST API or a fictional MCP URL. Campaign generation stores the complete campaign, then prepares a structured `MiroSyncPayload` for the Copilot agent. The payload includes the campaign identity, brand, objective, audience, duration, pillars, and all seven calendar records (platform, format, topic, hook, caption, CTA, and status).

Use **Sync to Miro** to prepare the handoff and show the sync state. If direct MCP execution is unavailable, use **Copy Miro Sync Payload** and provide the JSON to the Copilot agent. The agent uses the connected Miro MCP workflow to create or update a clearly labeled campaign section on the configured board. The deterministic section key (`social-os-campaign-{campaignId}`) makes re-sync idempotent, while the existing shared `Campaign Strategy` and `7-Day Content Calendar` remain intact.

Retrieve a complete payload for a campaign with:

```text
GET http://localhost:8787/api/campaigns/{campaignId}/miro-payload
```
