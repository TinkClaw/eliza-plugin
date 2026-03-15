import type { Action, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { TinkClawClient } from "../client";

export const makePrediction: Action = {
  name: "TINKCLAW_PREDICT",
  description: "Make a prediction on TinkClaw (up/down) for a given symbol — recorded on proof chain",
  similes: ["predict", "I think", "going up", "going down", "bullish on", "bearish on"],
  examples: [
    [
      { user: "user", content: { text: "I'm bullish on BTC, make a prediction" } },
      { user: "assistant", content: { text: "Recording your UP prediction for BTC on TinkClaw's proof chain..." } },
    ],
  ],
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text || "").toLowerCase();
    return (text.includes("predict") || text.includes("bullish") || text.includes("bearish")) &&
           !text.includes("forecast");
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

    const text = (message.content?.text || "");
    const upper = text.toUpperCase();
    const lower = text.toLowerCase();

    const symbolMatch = upper.match(/\b(BTC|ETH|SOL|AAPL|MSFT|NVDA|TSLA)\b/);
    if (!symbolMatch) {
      await callback({ text: "Please specify a symbol to predict (e.g., BTC, ETH, SOL)." });
      return;
    }

    const direction = lower.includes("bullish") || lower.includes("up") || lower.includes("long")
      ? "up" : "down";

    try {
      const result = await client.makePrediction(symbolMatch[1], direction);
      await callback({
        text: `Prediction recorded: ${direction.toUpperCase()} on ${symbolMatch[1]}. Proof hash: ${result.proof_hash || "pending"}. This prediction is immutable and verifiable on TinkClaw's proof chain.`,
      });
    } catch (error) {
      await callback({ text: `Failed to record prediction: ${error}` });
    }
  },
};
