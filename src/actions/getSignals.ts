import type { Action, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { TinkClawClient } from "../client";

export const getSignals: Action = {
  name: "GET_TINKCLAW_SIGNALS",
  description: "Get real-time AI trading signals from TinkClaw for a given symbol",
  similes: [
    "check signals",
    "what are the signals for",
    "trading signals",
    "market signals",
    "signal check",
    "what does tinkclaw say about",
  ],
  examples: [
    [
      { user: "user", content: { text: "What are the TinkClaw signals for BTC?" } },
      { user: "assistant", content: { text: "Let me check the TinkClaw signals for BTC..." } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    return text.includes("signal") || text.includes("tinkclaw");
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<void> => {
    if (!callback) return;
    const apiKey = runtime.getSetting("TINKCLAW_API_KEY") || "";
    const client = new TinkClawClient({ apiKey });

    // Extract symbol from message
    const text = (message.content?.text || "").toUpperCase();
    const symbolMatch = text.match(/\b(BTC|ETH|SOL|AAPL|MSFT|NVDA|TSLA|EUR\/USD|GBP\/USD|XAU\/USD)\b/);
    const symbol = symbolMatch ? symbolMatch[1].replace("/", "") : undefined;

    try {
      const signals = await client.getSignals(symbol);

      if (signals.x402) {
        await callback({
          text: `This request requires x402 payment of ${signals.payment_required.amount_human} TKCL. Configure x402 payments or use an API key.`,
        });
        return;
      }

      const summary = symbol
        ? `TinkClaw signals for ${symbol}: Direction: ${signals.direction || "N/A"}, Confidence: ${signals.confidence || "N/A"}%, Regime: ${signals.regime || "N/A"}`
        : `TinkClaw is tracking ${signals.symbols?.length || 0} symbols. Use a specific symbol for detailed signals.`;

      await callback({ text: summary });
    } catch (error) {
      await callback({ text: `Failed to fetch TinkClaw signals: ${error}` });
    }
  },
};
