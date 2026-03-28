"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBuyShares } from "@/hooks/useTransactions";
import { formatETH, formatProbabilityNumber, validateETHAmount, calcFeeAmount, calcNetAmount } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Zap, Info } from "lucide-react";
import type { MarketInfo } from "@/types/market";

interface TradePanelProps {
  marketAddress: `0x${string}`;
  marketInfo: MarketInfo;
  probability: [bigint, bigint];
  feeBps: bigint;
  onSuccess: () => void;
}

type Side = "YES" | "NO";

const QUICK_AMOUNTS = ["0.01", "0.1", "0.5", "1"];

export function TradePanel({ marketAddress, marketInfo, probability, feeBps, onSuccess }: TradePanelProps) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { buyYes, buyNo, isPending, isConfirming } = useBuyShares(marketAddress);

  const [side, setSide] = useState<Side>("YES");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState(false);

  const yesPct = formatProbabilityNumber(probability[0]);
  const noPct = 100 - yesPct;

  const amountWei = (() => {
    try { return parseEther(amount as `${number}`); } catch { return 0n; }
  })();

  const feeAmount = amountWei > 0n ? calcFeeAmount(amountWei, feeBps) : 0n;
  const netAmount = amountWei > 0n ? calcNetAmount(amountWei, feeBps) : 0n;
  const feePct = Number(feeBps) / 100;

  const handleTrade = async () => {
    const err = validateETHAmount(amount);
    if (err) { setError(err); return; }
    setError(null);
    try {
      if (side === "YES") await buyYes(amount);
      else await buyNo(amount);
      setTxSuccess(true);
      setAmount("");
      setTimeout(() => { setTxSuccess(false); onSuccess(); }, 2000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Transaction failed");
    }
  };

  const isLoading = isPending || isConfirming;

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-center space-y-4">
        <p className="text-gray-400 text-sm">Connect wallet to trade</p>
        <ConnectButton />
      </div>
    );
  }

  if (txSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-center space-y-2">
        <div className="text-3xl">✅</div>
        <p className="text-emerald-400 font-bold">Trade Confirmed!</p>
        <p className="text-gray-400 text-sm">Your {side} shares have been purchased.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-5">
      <h3 className="text-white font-bold text-base">Place Trade</h3>

      {/* Side Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("YES")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
            side === "YES"
              ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
              : "bg-white/5 border border-white/5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          YES — {yesPct.toFixed(1)}%
        </button>
        <button
          onClick={() => setSide("NO")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
            side === "NO"
              ? "bg-red-500/20 border border-red-400/40 text-red-400"
              : "bg-white/5 border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
          )}
        >
          <TrendingDown className="w-4 h-4" />
          NO — {noPct.toFixed(1)}%
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Amount (ETH)</span>
          <span>
            Balance:{" "}
            <button
              className="text-cyan-400 hover:text-cyan-300"
              onClick={() => balance && setAmount(parseFloat(formatETH(balance.value, 6).replace(" ETH", "")).toString())}
            >
              {balance ? formatETH(balance.value, 4) : "—"}
            </button>
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(null); }}
            placeholder="0.0"
            min="0"
            step="0.001"
            className={cn(
              "w-full bg-black/30 border rounded-xl px-4 py-3 text-white text-lg font-mono",
              "placeholder:text-gray-600 outline-none transition-all",
              error ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-cyan-400/50"
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">ETH</span>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all",
                amount === q
                  ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30"
                  : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-transparent"
              )}
            >
              {q}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Fee Breakdown */}
      {amountWei > 0n && (
        <div className="bg-black/20 rounded-xl p-3 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-gray-500">
            <span>Protocol fee ({feePct}%)</span>
            <span className="text-red-400">-{formatETH(feeAmount, 6)}</span>
          </div>
          <div className="flex justify-between text-gray-400 border-t border-white/5 pt-2">
            <span>Shares received</span>
            <span className={cn("font-bold", side === "YES" ? "text-emerald-400" : "text-red-400")}>
              {formatETH(netAmount, 6)} {side}
            </span>
          </div>
        </div>
      )}

      {/* Potential info */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/5 rounded-xl p-3">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-400" />
        <span>
          Parimutuel market — winners split the entire pool proportional to their shares.
          Higher pool = more upside for winners.
        </span>
      </div>

      {/* Submit */}
      <button
        onClick={handleTrade}
        disabled={isLoading || !amount}
        className={cn(
          "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
          side === "YES"
            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400"
            : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400",
          (isLoading || !amount) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {isPending ? "Confirm in wallet..." : "Confirming..."}
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Buy {side} {amount ? `— ${amount} ETH` : ""}
          </>
        )}
      </button>
    </div>
  );
}
