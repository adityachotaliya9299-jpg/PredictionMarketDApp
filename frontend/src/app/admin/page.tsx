"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useFactoryOwner,
  useFactoryFeeBps,
  useFactoryPaused,
  useAllMarkets,
} from "@/hooks/useMarket";
import {
  useFactoryAdmin,
  useSetOracleResolution,
} from "@/hooks/useTransactions";
import { FACTORY_ADDRESS, ORACLE_ADDRESS } from "@/lib/contracts";
import { formatETH, shortenAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MarketMetadata } from "@/types/market";
import {
  Shield,
  Settings,
  Pause,
  Play,
  Sliders,
  EyeOff,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const OUTCOME_LABELS = ["UNRESOLVED", "YES", "NO", "INVALID"];

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { data: owner } = useFactoryOwner();
  const { data: feeBps, refetch: refetchFee } = useFactoryFeeBps();
  const { data: isPaused, refetch: refetchPaused } = useFactoryPaused();
  const { data: markets } = useAllMarkets();

  const isAdmin = isConnected && address && owner && address.toLowerCase() === owner.toLowerCase();

  const {
    pauseFactory,
    unpauseFactory,
    setFeeBps,
    setOracle,
    setFeeCollector,
    pauseMarket,
    unpauseMarket,
    deactivateMarket,
    isPending,
  } = useFactoryAdmin();

  const { setResolution, isPending: resolvePending } = useSetOracleResolution();

  const [newFee, setNewFee] = useState("");
  const [newOracle, setNewOracle] = useState("");
  const [newCollector, setNewCollector] = useState("");
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // Per-market resolve state
  const [resolveOutcomes, setResolveOutcomes] = useState<Record<string, string>>({});

  const exec = async (fn: () => Promise<any>, successMsg: string) => {
    setTxError(null);
    setTxSuccess(null);
    try {
      await fn();
      setTxSuccess(successMsg);
      refetchFee();
      refetchPaused();
    } catch (e: any) {
      setTxError(e?.shortMessage || e?.message || "Transaction failed");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-gray-400">Connect your wallet to access the admin panel</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-white font-bold text-xl">Access Denied</h2>
          <p className="text-gray-500 text-sm">
            Only the factory owner ({owner ? shortenAddress(owner) : "—"}) can access this panel.
          </p>
        </div>
      </div>
    );
  }

  const allMarkets = (markets as MarketMetadata[] | undefined) ?? [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Admin Panel</h1>
            <p className="text-gray-500 text-xs">PredictX Factory Control</p>
          </div>
        </div>

        {/* Status banner */}
        {txSuccess && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {txSuccess}
          </div>
        )}
        {txError && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {txError}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Factory Address", value: shortenAddress(FACTORY_ADDRESS), mono: true },
            { label: "Oracle Address", value: shortenAddress(ORACLE_ADDRESS), mono: true },
            { label: "Protocol Fee", value: feeBps !== undefined ? `${Number(feeBps) / 100}%` : "—" },
            { label: "Factory Status", value: isPaused ? "PAUSED" : "ACTIVE", color: isPaused ? "text-red-400" : "text-emerald-400" },
          ].map(({ label, value, mono, color }) => (
            <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1">
              <p className="text-gray-600 text-xs">{label}</p>
              <p className={cn("font-bold text-sm", mono && "font-mono", color || "text-white")}>{value}</p>
            </div>
          ))}
        </div>

        {/* Factory Controls */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-5">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            Factory Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pause / Unpause */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Emergency Controls</p>
              <div className="flex gap-2">
                <button
                  onClick={() => exec(() => pauseFactory(), "Factory paused")}
                  disabled={isPending || !!isPaused}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pause Factory
                </button>
                <button
                  onClick={() => exec(() => unpauseFactory(), "Factory unpaused")}
                  disabled={isPending || !isPaused}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  Unpause
                </button>
              </div>
            </div>

            {/* Update Fee */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Protocol Fee (bps)</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder={feeBps !== undefined ? String(Number(feeBps)) : "200"}
                  min="0"
                  max="500"
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-400/30"
                />
                <button
                  onClick={() => exec(() => setFeeBps(BigInt(newFee || "200")), `Fee updated to ${newFee} bps`)}
                  disabled={isPending || !newFee}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 disabled:opacity-40 transition-all"
                >
                  Update
                </button>
              </div>
              <p className="text-gray-700 text-xs">100 bps = 1% | Max 500</p>
            </div>

            {/* Update Oracle */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Oracle Address</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOracle}
                  onChange={(e) => setNewOracle(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-400/30"
                />
                <button
                  onClick={() => exec(() => setOracle(newOracle as `0x${string}`), "Oracle updated")}
                  disabled={isPending || !newOracle.startsWith("0x")}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 disabled:opacity-40 transition-all"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Update Fee Collector */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Fee Collector</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCollector}
                  onChange={(e) => setNewCollector(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-400/30"
                />
                <button
                  onClick={() => exec(() => setFeeCollector(newCollector as `0x${string}`), "Fee collector updated")}
                  disabled={isPending || !newCollector.startsWith("0x")}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 disabled:opacity-40 transition-all"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Market Management */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Market Management ({allMarkets.length})
          </h2>

          {allMarkets.length === 0 ? (
            <p className="text-gray-600 text-sm">No markets deployed yet.</p>
          ) : (
            <div className="space-y-3">
              {allMarkets.map((m) => (
                <div
                  key={m.marketId}
                  className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-3"
                >
                  {/* Market header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{m.question}</p>
                      <p className="text-gray-600 text-xs font-mono">{shortenAddress(m.marketAddress)}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border shrink-0",
                      m.active
                        ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                        : "bg-gray-400/10 text-gray-400 border-gray-400/20"
                    )}>
                      {m.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => exec(() => pauseMarket(m.marketId), "Market paused")}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/15 disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                    <button
                      onClick={() => exec(() => unpauseMarket(m.marketId), "Market unpaused")}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/15 disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3" /> Unpause
                    </button>
                    <button
                      onClick={() => exec(() => deactivateMarket(m.marketId), "Market deactivated")}
                      disabled={isPending || !m.active}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/15 disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      <EyeOff className="w-3 h-3" /> Deactivate
                    </button>
                  </div>

                  {/* Oracle resolution */}
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-gray-600 text-xs mb-2 font-medium">Set Oracle Resolution</p>
                    <div className="flex gap-2">
                      <select
                        value={resolveOutcomes[m.marketId] ?? "1"}
                        onChange={(e) => setResolveOutcomes((prev) => ({ ...prev, [m.marketId]: e.target.value }))}
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400/30"
                      >
                        <option value="1">YES</option>
                        <option value="2">NO</option>
                        <option value="3">INVALID</option>
                      </select>
                      <button
                        onClick={() =>
                          exec(
                            () =>
                              setResolution(
                                m.marketId,
                                parseInt(resolveOutcomes[m.marketId] ?? "1")
                              ),
                            `Oracle resolved: ${OUTCOME_LABELS[parseInt(resolveOutcomes[m.marketId] ?? "1")]}`
                          )
                        }
                        disabled={resolvePending}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20 hover:bg-blue-400/15 disabled:opacity-40 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Resolve Oracle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
