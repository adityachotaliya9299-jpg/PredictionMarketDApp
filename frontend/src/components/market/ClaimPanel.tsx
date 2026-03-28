"use client";

import { useState } from "react";
import { useClaimReward, useResolveMarket } from "@/hooks/useTransactions";
import { formatETH, formatOutcome } from "@/lib/utils";
import { Outcome, getMarketStatus, type MarketInfo } from "@/types/market";
import { cn } from "@/lib/utils";
import { Gift, CheckCircle, RefreshCw, Trophy } from "lucide-react";

// re-export formatOutcome here to avoid import cycle
function outcomeLabel(o: Outcome): string {
  return ["UNRESOLVED","YES","NO","INVALID"][o] ?? "UNRESOLVED";
}

interface ClaimPanelProps {
  marketAddress: `0x${string}`;
  marketInfo: MarketInfo;
  yesShares: bigint;
  noShares: bigint;
  hasClaimed: boolean;
  expectedPayout: bigint;
  onSuccess: () => void;
}

export function ClaimPanel({
  marketAddress,
  marketInfo,
  yesShares,
  noShares,
  hasClaimed,
  expectedPayout,
  onSuccess,
}: ClaimPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const { claimReward, isPending: claimPending, isConfirming: claimConfirming } = useClaimReward(marketAddress);
  const { resolveMarket, isPending: resolvePending, isConfirming: resolveConfirming } = useResolveMarket(marketAddress);

  const status = getMarketStatus(marketInfo);
  const isLoading = claimPending || claimConfirming || resolvePending || resolveConfirming;
  const userWon =
    (marketInfo.outcome === Outcome.YES && yesShares > 0n) ||
    (marketInfo.outcome === Outcome.NO && noShares > 0n) ||
    (marketInfo.outcome === Outcome.INVALID && (yesShares + noShares) > 0n);

  const handleClaim = async () => {
    setError(null);
    try {
      await claimReward();
      setClaimed(true);
      onSuccess();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Claim failed");
    }
  };

  const handleResolve = async () => {
    setError(null);
    try {
      await resolveMarket();
      onSuccess();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Resolve failed");
    }
  };

  if (claimed || hasClaimed) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-emerald-400 font-bold">Reward Claimed!</p>
            <p className="text-gray-400 text-xs">Your winnings have been sent to your wallet.</p>
          </div>
        </div>
      </div>
    );
  }

  // Market expired but not yet resolved — show resolve button
  if (status === "expired") {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 space-y-4">
        <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Market Ready to Resolve
        </h3>
        <p className="text-gray-400 text-xs">
          This market has expired. If the oracle has submitted a result, anyone can trigger resolution.
        </p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          onClick={handleResolve}
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-bold text-sm bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isLoading ? "Resolving..." : "Resolve Market"}
        </button>
      </div>
    );
  }

  // Market resolved — show claim if user has winning shares
  if (status === "resolved") {
    if (!userWon || (yesShares === 0n && noShares === 0n)) {
      return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-2">
          <p className="text-gray-400 font-semibold text-sm">Market Resolved</p>
          <p className="text-gray-600 text-xs">
            Outcome: <span className="text-white font-bold">{outcomeLabel(marketInfo.outcome)}</span>
          </p>
          {yesShares + noShares > 0n && !userWon && (
            <p className="text-gray-500 text-xs">You were on the losing side. Better luck next time!</p>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400" />
          <div>
            <p className="text-white font-bold">You Won! 🎉</p>
            <p className="text-gray-400 text-xs">
              Outcome: <span className="text-emerald-400 font-bold">{outcomeLabel(marketInfo.outcome)}</span>
            </p>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-3 space-y-2 text-sm font-mono">
          <div className="flex justify-between text-gray-400">
            <span>Your YES shares</span>
            <span>{yesShares > 0n ? formatETH(yesShares) : "—"}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Your NO shares</span>
            <span>{noShares > 0n ? formatETH(noShares) : "—"}</span>
          </div>
          <div className="flex justify-between text-emerald-400 font-bold border-t border-white/5 pt-2">
            <span>Expected Payout</span>
            <span>{formatETH(expectedPayout)}</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          onClick={handleClaim}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Gift className="w-4 h-4" />
          )}
          {isLoading ? "Claiming..." : `Claim ${formatETH(expectedPayout)}`}
        </button>
      </div>
    );
  }

  return null;
}
