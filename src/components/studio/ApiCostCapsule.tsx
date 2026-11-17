import { Coins, RotateCcw } from "lucide-react";

import { INR_PER_USD, resetApiCost, useApiCost } from "@/lib/apiCost";

function formatUsd(value: number): string {
  return `$${value.toFixed(value < 1 ? 4 : 2)}`;
}

function formatInr(usd: number): string {
  return `₹${(usd * INR_PER_USD).toFixed(2)}`;
}

/** Running estimate of Gemini API spend for images generated on this device. */
export function ApiCostCapsule() {
  const { totalUsd, images, inputTokens, outputTokens } = useApiCost();

  const handleReset = () => {
    if (window.confirm("Reset the API cost tracker to $0?")) resetApiCost();
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
      title={`Estimated Gemini API cost on this device\n${images} image${images === 1 ? "" : "s"} · ${inputTokens.toLocaleString()} input / ${outputTokens.toLocaleString()} output tokens\nBased on gemini-nano-banana-2.1 list prices at 1 USD = ₹${INR_PER_USD}; check your Google billing for exact charges.`}
    >
      <Coins className="h-3.5 w-3.5" />
      <span>API cost</span>
      <span className="tabular-nums font-semibold">{formatUsd(totalUsd)}</span>
      <span className="text-primary/60">/</span>
      <span className="tabular-nums font-semibold">{formatInr(totalUsd)}</span>
      <span className="text-primary/60">·</span>
      <span className="tabular-nums">
        {images} img{images === 1 ? "" : "s"}
      </span>
      {images > 0 ? (
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset API cost tracker"
          className="ml-0.5 rounded-full p-0.5 text-primary/60 hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}
