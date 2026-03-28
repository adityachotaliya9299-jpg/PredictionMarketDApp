"use client";

import Link from "next/link";
import { Clock, TrendingUp, Users, ChevronRight, Lock } from "lucide-react";
import { formatETH, formatTimeLeft, formatProbabilityNumber } from "@/lib/utils";
import { getMarketStatus, CATEGORY_COLORS, type MarketMetadata } from "@/types/market";
import { useMarketInfo, useMarketProbability } from "@/hooks/useMarket";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  market: MarketMetadata;
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  expired: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  resolved: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  paused: "bg-red-400/10 text-red-400 border-red-400/20",
  invalid: "bg-gray-400/10 text-gray-400 border-gray-400/20",
};

const STATUS_LABELS: Record<string, string> = {
  open: "LIVE",
  expired: "EXPIRED",
  resolved: "RESOLVED",
  paused: "PAUSED",
  invalid: "INVALID",
};

export function MarketCard({ market }: MarketCardProps) {
  const { data: info } = useMarketInfo(market.marketAddress);
  const { data: probability } = useMarketProbability(market.marketAddress);

  const status = info ? getMarketStatus(info) : "open";
  const yesPct = probability ? formatProbabilityNumber(probability[0]) : 50;
  const noPct = 100 - yesPct;
  const catColor = CATEGORY_COLORS[market.category] || "#6b7280";

  const poolEth = info ? formatETH(info.totalPool) : "0 ETH";
  const timeLeft = formatTimeLeft(market.expirationTime);

  return (
    <Link href={`/markets/${market.marketAddress}`} className="group block">
      <div
        className={cn(
          "relative h-full rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent",
          "p-5 transition-all duration-300",
          "hover:border-white/10 hover:from-white/[0.07] hover:shadow-xl hover:shadow-black/30",
          status === "paused" && "opacity-60"
        )}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: catColor, backgroundColor: `${catColor}15`, borderColor: `${catColor}30` }}
            >
              {market.category}
            </span>
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", STATUS_STYLES[status])}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" />
        </div>

        {/* Question */}
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-5 group-hover:text-cyan-50 transition-colors">
          {market.question}
        </h3>

        {/* Probability Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-emerald-400 font-bold">YES {yesPct.toFixed(1)}%</span>
            <span className="text-red-400 font-bold">NO {noPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${yesPct}%`,
                background: `linear-gradient(90deg, #10b981, #22d3ee)`,
              }}
            />
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{poolEth}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Paused overlay indicator */}
        {status === "paused" && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Market Paused
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
