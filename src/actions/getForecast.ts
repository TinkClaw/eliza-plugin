import type { Action, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { TinkClawClient } from "../client";

export const getForecast: Action = {
  name: "GET_TINKCLAW_FORECAST",
  description: "Get AI-powered price forecast for a symbol from TinkClaw",
  similes: ["price forecast", "prediction", "where is price going", "forecast"],
  examples: [
    [
      { user: "user", content: { text: "What's the forecast for ETH?" } },
      { user: "assistant", content: { text: "Let me check TinkClaw's AI forecast for ETH..." } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    return text.includes("forecast") || text.includes("prediction") || text.includes("where");
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

    const text = (message.content?.text || "").toUpperCase();
    const symbolMatch = text.match(/\b(BTC|ETH|SOL|AAPL|MSFT|NVDA|TSLA)\b/);

    if (!symbolMatch) {
      await callback({ text: "Please specify a symbol (e.g., BTC, ETH, SOL, AAPL)." });
      return;
    }

    try {
      const forecast = await client.getForecast(symbolMatch[1]);

      if (forecast.x402) {
        await callback({
          text: `This request requires x402 payment of ${forecast.payment_required.amount_human} TKCL.`,
        });
        return;
      }

      await callback({
        text: `TinkClaw forecast for ${symbolMatch[1]}: Direction: ${forecast.direction || "N/A"}, Confidence: ${forecast.confidence || "N/A"}%, Timeframe: ${forecast.timeframe || "N/A"}.`,
      });
    } catch (error) {
      await callback({ text: `Failed to fetch forecast: ${error}` });
    }
  },
};
