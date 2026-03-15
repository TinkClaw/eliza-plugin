/**
 * TinkClaw API Client
 *
 * Supports two auth modes:
 * 1. API Key (Bearer token) — for registered agents
 * 2. x402 (pay-per-request) — no signup, pay with $TKCL on Solana
 */

export interface TinkClawConfig {
  /** API base URL */
  baseUrl?: string;
  /** API key (Bearer token) — mutually exclusive with x402 */
  apiKey?: string;
  /** x402 payment config — mutually exclusive with apiKey */
  x402?: {
    /** Solana keypair (base58 secret key) for signing payments */
    secretKey: string;
    /** Auto-pay for x402 requests */
    autoPay: boolean;
  };
}

const DEFAULT_BASE_URL = "https://api.tinkclaw.com";

export class TinkClawClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: TinkClawConfig = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 402) {
      // x402 Payment Required — return payment instructions
      const paymentInfo = await response.json();
      return { x402: true, ...paymentInfo };
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getSignals(symbol?: string): Promise<any> {
    const path = symbol ? `/api/signals/${symbol}` : "/api/signals";
    return this.request(path);
  }

  async getRegime(): Promise<any> {
    return this.request("/api/regime");
  }

  async getForecast(symbol: string): Promise<any> {
    return this.request(`/api/forecast/${symbol}`);
  }

  async getPatterns(symbol: string): Promise<any> {
    return this.request(`/api/patterns/${symbol}`);
  }

  async getFlow(symbol: string): Promise<any> {
    return this.request(`/api/flow/${symbol}`);
  }

  async getConfluence(symbol: string): Promise<any> {
    return this.request(`/api/confluence/${symbol}`);
  }

  async getCandles(symbol: string): Promise<any> {
    return this.request(`/api/candles/${symbol}`);
  }

  async makePrediction(symbol: string, direction: "up" | "down"): Promise<any> {
    return this.request("/api/agent/predict", {
      method: "POST",
      body: JSON.stringify({ symbol, direction }),
    });
  }

  async getProofChain(): Promise<any> {
    return this.request("/api/proof/chain");
  }

  async verifyPrediction(predictionId: string): Promise<any> {
    return this.request(`/api/proof/verify/${predictionId}`);
  }

  async getSymbols(): Promise<any> {
    return this.request("/api/agent/symbols");
  }
}
