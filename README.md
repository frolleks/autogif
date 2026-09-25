# autogif

Discord bot that replies to every message with a reaction GIF: TypeSafe Jev reads the mood, an LLM writes a search query, and KLIPY finds the GIF.

## Setup

1. `bun install`, then `cp .env.example .env` and fill in:
   - `DISCORD_TOKEN`: [Discord Developer Portal](https://discord.com/developers/applications) → your app → Bot → Reset Token.
   - `OPENROUTER_API_KEY`: [openrouter.ai/keys](https://openrouter.ai/keys). The key needs credit.
   - `KLIPY_API_KEY`: KLIPY Partner Panel ([partner.klipy.com](https://partner.klipy.com)).
2. In the Developer Portal, go to Bot → Privileged Gateway Intents and turn on **Message Content Intent**.
3. Invite the bot: OAuth2 → URL Generator, scope `bot`, permissions **Send Messages** and **Read Message History**.
4. Start it with `bun run index.ts`.

Note: KLIPY test keys are limited to 100 requests/hour. Request production access before using the bot in a busy server.
