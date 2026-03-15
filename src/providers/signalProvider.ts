import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { TinkClawClient } from "../client";

export const signalProvider: Provider = {
  get: async (runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string> => {
    const apiKey = runtime.getSetting("TINKCLAW_API_KEY") || "";
    if (!apiKey) {
      return "TinkClaw signals not configured. Set TINKCLAW_API_KEY in agent settings.";
    }

    const client = new TinkClawClient({ apiKey });

    try {
      const [signals, regime] = await Promise.all([
        client.getSignals().catch(() => null),
        client.getRegime().catch(() => null),
      ]);

      const parts: string[] = ["[TinkClaw Market Intelligence]"];

      if (regime?.regime) {
        parts.push(`Market Regime: ${regime.regime.label} (${(regime.regime.confidence * 100).toFixed(0)}% confidence)`);
      }

      if (signals?.symbols) {
        const top = signals.symbols.slice(0, 5);
        parts.push(`Active Signals: ${top.map((s: any) => `${s.symbol}: ${s.direction}`).join(", ")}`);
      }

      return parts.join("\n");
    } catch {
      return "TinkClaw signals temporarily unavailable.";
    }
  },
};
