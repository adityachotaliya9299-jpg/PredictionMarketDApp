import { formatEther, parseEther } from "viem";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatETH(wei: bigint, decimals = 4): string {
  const eth = parseFloat(formatEther(wei));
  if (eth === 0) return "0 ETH";
  if (eth < 0.0001) return "< 0.0001 ETH";
  return `${eth.toFixed(decimals)} ETH`;
}

export function formatUSD(wei: bigint, ethPrice = 3000): string {
  const eth = parseFloat(formatEther(wei));
  const usd = eth * ethPrice;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usd);
}

export function formatProbability(prob: bigint): string {
  // prob is scaled by 1e18
  const pct = Number(prob) / 1e16; // → percentage
  return `${pct.toFixed(1)}%`;
}

export function formatProbabilityNumber(prob: bigint): number {
  return Number(prob) / 1e16;
}

export function formatTimeLeft(expirationTime: bigint): string {
  const expMs = Number(expirationTime) * 1000;
  const now = Date.now();
  if (now > expMs) return "Expired";
  return formatDistanceToNow(expMs, { addSuffix: true });
}

export function formatTimestamp(ts: bigint): string {
  if (ts === 0n) return "—";
  return format(new Date(Number(ts) * 1000), "MMM d, yyyy HH:mm");
}

export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function isExpired(expirationTime: bigint): boolean {
  return BigInt(Math.floor(Date.now() / 1000)) > expirationTime;
}

export function validateETHAmount(value: string): string | null {
  if (!value || value === "") return "Amount is required";
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return "Enter a valid amount";
  if (num < 0.0001) return "Minimum 0.0001 ETH";
  try {
    parseEther(value as `${number}`);
    return null;
  } catch {
    return "Invalid amount";
  }
}

export function calcFeeAmount(weiAmount: bigint, feeBps: bigint): bigint {
  return (weiAmount * feeBps) / 10000n;
}

export function calcNetAmount(weiAmount: bigint, feeBps: bigint): bigint {
  return weiAmount - calcFeeAmount(weiAmount, feeBps);
}

export function formatOutcome(outcome: number): string {
  return ["UNRESOLVED", "YES", "NO", "INVALID"][outcome] ?? "UNRESOLVED";
}
