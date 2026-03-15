# @tinkclaw/eliza-plugin

TinkClaw signal intelligence plugin for [ElizaOS](https://github.com/elizaOS/eliza) agents.

## Features

- Real-time AI trading signals (stocks, crypto, forex)
- Market regime detection (bull/bear/ranging/volatile)
- AI-powered price forecasts
- Prediction recording with cryptographic proof chain
- x402 pay-per-request support (no signup needed)

## Installation

```bash
npm install github:TinkClaw/eliza-plugin
```

## Usage

```typescript
import { tinkclawPlugin } from "tinkclaw-eliza-plugin";

const agent = new Agent({
  plugins: [tinkclawPlugin],
  settings: {
    TINKCLAW_API_KEY: "your-api-key", // or use x402 for pay-per-request
  },
});
```

## Actions

| Action | Description |
|--------|-------------|
| `GET_TINKCLAW_SIGNALS` | Fetch real-time AI trading signals |
| `GET_TINKCLAW_REGIME` | Get market regime detection |
| `GET_TINKCLAW_FORECAST` | Get AI price forecasts |
| `TINKCLAW_PREDICT` | Record a prediction on the proof chain |

## x402 Pay-Per-Request

Agents can access TinkClaw signals without an API key by paying per request in $TKCL tokens on Solana. See [TinkClaw x402 docs](https://tinkclaw.com/token) for pricing.

## License

MIT
