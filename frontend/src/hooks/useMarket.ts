"use client";
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, MARKET_ABI } from "@/lib/contracts";
import type { MarketMetadata, MarketInfo } from "@/types/market";
const C = 11155111;
export function useAllMarkets() { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"getAllMarkets", chainId:C }); }
export function useActiveMarkets() { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"getActiveMarkets", chainId:C }); }
export function useMarketCount() { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"getMarketCount", chainId:C }); }
export function useFactoryFeeBps() { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"feeBps", chainId:C }); }
export function useFactoryPaused() { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"paused", chainId:C }); }
export function useFactoryOwner() { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"owner", chainId:C }); }
export function useMarketsByCreator(creator?: `0x${string}`) { return useReadContract({ address:FACTORY_ADDRESS, abi:FACTORY_ABI, functionName:"getMarketsByCreator", args:creator?[creator]:undefined, chainId:C, query:{enabled:!!creator} }); }
export function useMarketInfo(a?: `0x${string}`) { return useReadContract({ address:a, abi:MARKET_ABI, functionName:"getMarketInfo", chainId:C, query:{enabled:!!a} }); }
export function useMarketProbability(a?: `0x${string}`) { return useReadContract({ address:a, abi:MARKET_ABI, functionName:"calculateProbability", chainId:C, query:{enabled:!!a} }); }
export function useUserPosition(ma?: `0x${string}`) {
  const {address} = useAccount();
  const s = useReadContract({ address:ma, abi:MARKET_ABI, functionName:"getUserShares", args:address?[address]:undefined, chainId:C, query:{enabled:!!ma&&!!address} });
  const c = useReadContract({ address:ma, abi:MARKET_ABI, functionName:"hasClaimed", args:address?[address]:undefined, chainId:C, query:{enabled:!!ma&&!!address} });
  const p = useReadContract({ address:ma, abi:MARKET_ABI, functionName:"getExpectedPayout", args:address?[address]:undefined, chainId:C, query:{enabled:!!ma&&!!address} });
  return { yesShares:s.data?.[0]??0n, noShares:s.data?.[1]??0n, hasClaimed:c.data??false, expectedPayout:p.data??0n, isLoading:s.isLoading, refetch:()=>{s.refetch();c.refetch();p.refetch();} };
}
export function useMarketDetail(ma?: `0x${string}`) {
  const {address} = useAccount();
  const contracts = [
    {address:ma,abi:MARKET_ABI,functionName:"getMarketInfo" as const,chainId:C},
    {address:ma,abi:MARKET_ABI,functionName:"calculateProbability" as const,chainId:C},
    {address:ma,abi:MARKET_ABI,functionName:"feeBps" as const,chainId:C},
    ...(address?[
      {address:ma,abi:MARKET_ABI,functionName:"getUserShares" as const,args:[address] as [`0x${string}`],chainId:C},
      {address:ma,abi:MARKET_ABI,functionName:"hasClaimed" as const,args:[address] as [`0x${string}`],chainId:C},
      {address:ma,abi:MARKET_ABI,functionName:"getExpectedPayout" as const,args:[address] as [`0x${string}`],chainId:C},
    ]:[]),
  ];
  const r = useReadContracts({ contracts, query:{enabled:!!ma} });
  const d = r.data;
  return {
    marketInfo:d?.[0]?.result as MarketInfo|undefined,
    probability:d?.[1]?.result as [bigint,bigint]|undefined,
    feeBps:d?.[2]?.result as bigint|undefined,
    yesShares:(d?.[3]?.result as [bigint,bigint]|undefined)?.[0]??0n,
    noShares:(d?.[3]?.result as [bigint,bigint]|undefined)?.[1]??0n,
    hasClaimed:(d?.[4]?.result as boolean|undefined)??false,
    expectedPayout:(d?.[5]?.result as bigint|undefined)??0n,
    isLoading:r.isLoading, refetch:r.refetch,
  };
}
