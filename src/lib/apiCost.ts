import { useSyncExternalStore } from "react";

// Nano Banana 2.1 (gemini-nano-banana-2.1) standard paid-tier rates, USD per 1M tokens.
// Source: published pricing as reported by third-party trackers — verify at ai.google.dev/pricing.
export const RATE_INPUT_PER_M = 1.5;
export const RATE_TEXT_OUTPUT_PER_M = 7.5; // text + thinking output
export const RATE_IMAGE_OUTPUT_PER_M = 30;
// Used only when the API response carries no usage metadata (2K image ≈ 1680 tokens).
export const FALLBACK_COST_PER_IMAGE = 0.0504;
// Fixed display rate for the INR figure: 1 USD = ₹100.
export const INR_PER_USD = 100;

const STORAGE_KEY = "studioflow.apiCost.v1";

export interface ApiCostState {
  totalUsd: number;
  images: number;
  inputTokens: number;
  outputTokens: number;
}

const EMPTY: ApiCostState = { totalUsd: 0, images: 0, inputTokens: 0, outputTokens: 0 };

interface Modality {
  modality?: string;
  tokenCount?: number;
}

interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  candidatesTokensDetails?: Modality[];
}

let state: ApiCostState = load();
const listeners = new Set<() => void>();

const BACKUP_KEY = "studioflow.apiCost.backup.v1";

function readKey(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function load(): ApiCostState {
  try {
    if (typeof window === "undefined") return EMPTY;
    // Fall back to the backup copy if the primary key was lost/cleared.
    const raw = readKey(STORAGE_KEY) ?? readKey(BACKUP_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ApiCostState>;
    return {
      totalUsd: Number(parsed.totalUsd) || 0,
      images: Number(parsed.images) || 0,
      inputTokens: Number(parsed.inputTokens) || 0,
      outputTokens: Number(parsed.outputTokens) || 0,
    };
  } catch {
    return EMPTY;
  }
}

function commit(next: ApiCostState) {
  state = next;
  try {
    const json = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, json);
    window.localStorage.setItem(BACKUP_KEY, json);
  } catch {
    // storage unavailable — keep the in-memory total
  }
  listeners.forEach((listener) => listener());
}

/** Cost of one generateContent response, from its usageMetadata when present. */
export function costFromUsage(usage: UsageMetadata | undefined | null): {
  usd: number;
  inputTokens: number;
  outputTokens: number;
} {
  if (!usage || (!usage.promptTokenCount && !usage.candidatesTokenCount)) {
    return { usd: FALLBACK_COST_PER_IMAGE, inputTokens: 0, outputTokens: 0 };
  }

  const input = usage.promptTokenCount ?? 0;
  const candidates = usage.candidatesTokenCount ?? 0;
  const thoughts = usage.thoughtsTokenCount ?? 0;
  const imageOut =
    usage.candidatesTokensDetails
      ?.filter((d) => d.modality === "IMAGE")
      .reduce((sum, d) => sum + (d.tokenCount ?? 0), 0) ?? candidates;
  const textOut = Math.max(0, candidates - imageOut) + thoughts;

  const usd =
    (input * RATE_INPUT_PER_M + textOut * RATE_TEXT_OUTPUT_PER_M + imageOut * RATE_IMAGE_OUTPUT_PER_M) /
    1_000_000;

  return { usd, inputTokens: input, outputTokens: candidates + thoughts };
}

/** Record one successful image generation. */
export function recordImageCost(usage: UsageMetadata | undefined | null) {
  // Re-read storage first so another tab/window's spend is never overwritten by a stale in-memory total.
  state = load();
  const cost = costFromUsage(usage);
  commit({
    totalUsd: state.totalUsd + cost.usd,
    images: state.images + 1,
    inputTokens: state.inputTokens + cost.inputTokens,
    outputTokens: state.outputTokens + cost.outputTokens,
  });
}

export function resetApiCost() {
  commit(EMPTY);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = load();
    listeners.forEach((listener) => listener());
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useApiCost(): ApiCostState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}
