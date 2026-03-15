import type { Action, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { TinkClawClient } from "../client";

export const getRegime: Action = {
  name: "GET_TINKCLAW_REGIME",
  description: "Get current market regime detection from TinkClaw (bull/bear/ranging/volatile)",
  similes: ["market regime", "regime detection", "market state", "is market bullish"],
  examples: [
    [
      { user: "user", content: { text: "What's the current market regime?" } },
      { user: "assistant", content: { text: "Let me check TinkClaw's regime detection..." } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    return text.includes("regime") || text.includes("market state") || text.includes("bullish") || text.includes("bearish");
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

    try {
      const regime = await client.getRegime();

      if (regime.x402) {
        await callback({
          text: `This request requires x402 payment of ${regime.payment_required.amount_human} TKCL.`,
        });
        return;
      }

      await callback({
        text: `Market Regime: ${regime.regime?.label || "Unknown"} (confidence: ${(regime.regime?.confidence * 100).toFixed(1)}%). Forecast: ${regime.forecast?.most_likely_next || "N/A"}.`,
      });
    } catch (error) {
      await callback({ text: `Failed to fetch regime: ${error}` });
    }
  },
};
