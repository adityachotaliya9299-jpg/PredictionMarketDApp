export enum Outcome {
  UNRESOLVED = 0,
  YES = 1,
  NO = 2,
  INVALID = 3,
}

export interface MarketMetadata {
  marketId: `0x${string}`;
  marketAddress: `0x${string}`;
  question: string;
  category: string;
  creator: `0x${string}`;
  createdAt: bigint;
  expirationTime: bigint;
  active: boolean;
}

export interface MarketInfo {
  marketId: `0x${string}`;
  question: string;
  expirationTime: bigint;
  resolutionTime: bigint;
  outcome: Outcome;
  paused: boolean;
  totalYesShares: bigint;
  totalNoShares: bigint;
  totalPool: bigint;
}

export interface UserPosition {
  yesShares: bigint;
  noShares: bigint;
  hasClaimed: boolean;
  expectedPayout: bigint;
}

export type MarketStatus = "open" | "expired" | "resolved" | "paused" | "invalid";

export function getMarketStatus(info: MarketInfo): MarketStatus {
  if (info.paused) return "paused";
  if (info.outcome === Outcome.INVALID) return "invalid";
  if (info.outcome !== Outcome.UNRESOLVED) return "resolved";
  if (BigInt(Date.now()) / 1000n > info.expirationTime) return "expired";
  return "open";
}

export function formatOutcome(outcome: Outcome): string {
  switch (outcome) {
    case Outcome.YES: return "YES";
    case Outcome.NO: return "NO";
    case Outcome.INVALID: return "INVALID";
    default: return "Unresolved";
  }
}

export const CATEGORIES = [
  "Crypto",
  "Politics",
  "Sports",
  "Science",
  "Entertainment",
  "Economics",
  "Technology",
  "General",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Crypto: "var(--warn)",
  Politics: "var(--down)",
  Sports: "var(--up)",
  Science: "var(--accent-2)",
  Entertainment: "var(--accent-3)",
  Economics: "var(--accent)",
  Technology: "#ec4899",
  General: "var(--faint)",
};
