"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Verity",
  projectId: "99d0f6e45d84da0c3341e8ba35298dd1",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/CEY1poWNVc8Tw6UImufyn"),
  },
  ssr: false,
});
