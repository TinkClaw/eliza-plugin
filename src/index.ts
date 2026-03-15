/**
 * @tinkclaw/eliza-plugin — TinkClaw Signal Intelligence for ElizaOS
 *
 * Gives any ElizaOS agent access to TinkClaw's AI signal engine.
 * Supports both API key auth and x402 pay-per-request (no signup needed).
 *
 * Usage:
 *   import { tinkclawPlugin } from "@tinkclaw/eliza-plugin";
 *   const agent = new Agent({ plugins: [tinkclawPlugin] });
 */

import type { Plugin, Action, Provider } from "@elizaos/core";

export { getSignals } from "./actions/getSignals";
export { getRegime } from "./actions/getRegime";
export { getForecast } from "./actions/getForecast";
export { makePrediction } from "./actions/makePrediction";
export { signalProvider } from "./providers/signalProvider";

import { getSignals } from "./actions/getSignals";
import { getRegime } from "./actions/getRegime";
import { getForecast } from "./actions/getForecast";
import { makePrediction } from "./actions/makePrediction";
import { signalProvider } from "./providers/signalProvider";

export const tinkclawPlugin: Plugin = {
  name: "tinkclaw",
  description: "TinkClaw AI signal intelligence — real-time trading signals, regime detection, and forecasts",
  actions: [getSignals, getRegime, getForecast, makePrediction],
  providers: [signalProvider],
};

export default tinkclawPlugin;
