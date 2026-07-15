"use client";

import { formatProbabilityNumber } from "@/lib/utils";

interface ProbabilityChartProps {
  probability: [bigint, bigint];
  totalPool: bigint;
}

export function ProbabilityChart({ probability, totalPool }: ProbabilityChartProps) {
  const yesPct = formatProbabilityNumber(probability[0]);
  const noPct = 100 - yesPct;

  return (
    <div className="space-y-4">
      {/* Big probability display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-black font-mono text-emerald-400">{yesPct.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">YES Probability</div>
        </div>
        <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-black font-mono text-red-400">{noPct.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">NO Probability</div>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-red-500/20">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${yesPct}%`,
            background: "linear-gradient(90deg, var(--up), var(--accent))",
          }}
        />
        {/* Midpoint line */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
      </div>

      <div className="flex justify-between text-xs text-gray-600 font-mono px-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
