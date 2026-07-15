"use client";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures QueryClient is created once per component mount, not per render
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 2 } }
  }));

  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={midnightTheme({ accentColor:"var(--accent)", accentColorForeground:"#14120D", borderRadius:"small" })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
