// Single source of truth for Cloudsway MaaS pricing.
// Used by both the Dashboard (estimated cost widgets/exports) and the
// Billing page (current-month estimate) so numbers always match invoices.

export type ModelKey = "MaaS-MJ" | "MaaS_image_1" | "MaaS_Cl_Opus";

export interface ModelPricing {
  /** USD per 1,000 input tokens */
  inputPer1k: number;
  /** USD per 1,000 output tokens */
  outputPer1k: number;
  /** Optional flat fee per request (e.g. image/video models charged per call) */
  perRequest?: number;
}

/**
 * Tariff sheet — keep in sync with the contract / monthly invoices.
 * If pricing changes, update here and both the Dashboard estimate and
 * the Billing "current month" estimate will follow automatically.
 */
export const PRICING: Record<ModelKey, ModelPricing> = {
  "MaaS-MJ":       { inputPer1k: 0,     outputPer1k: 0,     perRequest: 0.04 },
  "MaaS_image_1":  { inputPer1k: 0,     outputPer1k: 0,     perRequest: 0.02 },
  "MaaS_Cl_Opus":  { inputPer1k: 0.015, outputPer1k: 0.075, perRequest: 0    },
};

export const CURRENCY = "USD";

export const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

/** Cost for a single request given model + token usage. */
export const costForRequest = (
  model: ModelKey,
  inputTokens: number,
  outputTokens: number,
): number => {
  const p = PRICING[model];
  if (!p) return 0;
  return (
    (p.perRequest ?? 0) +
    (inputTokens / 1000) * p.inputPer1k +
    (outputTokens / 1000) * p.outputPer1k
  );
};
