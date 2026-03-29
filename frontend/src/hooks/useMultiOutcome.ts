"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { MULTI_FACTORY_ADDRESS, MULTI_FACTORY_ABI, MULTI_MARKET_ABI, MULTI_ORACLE_ADDRESS, MULTI_ORACLE_ABI } from "@/lib/contracts";

const C = 11155111;

export function useMultiMarkets() {
  return useReadContract({
    address: MULTI_FACTORY_ADDRESS, abi: MULTI_FACTORY_ABI,
    functionName: "getAllMarkets", chainId: C
  });
}

export function useMultiMarketCount() {
  return useReadContract({
    address: MULTI_FACTORY_ADDRESS, abi: MULTI_FACTORY_ABI,
    functionName: "getMarketCount", chainId: C
  });
}

export function useMultiMarketDetail(marketAddress?: `0x${string}`) {
  const { address } = useAccount();
  const info = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "getMarketInfo", chainId: C, query: { enabled: !!marketAddress } });
  const status = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "getMarketStatus", chainId: C, query: { enabled: !!marketAddress } });
  const outcomes = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "getOutcomes", chainId: C, query: { enabled: !!marketAddress } });
  const pools = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "getAllOutcomePools", chainId: C, query: { enabled: !!marketAddress } });
  const payout = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "getExpectedPayout", args: address ? [address] : undefined, chainId: C, query: { enabled: !!marketAddress && !!address } });
  const claimed = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "hasClaimed", args: address ? [address] : undefined, chainId: C, query: { enabled: !!marketAddress && !!address } });
  const feeBps = useReadContract({ address: marketAddress, abi: MULTI_MARKET_ABI, functionName: "feeBps", chainId: C, query: { enabled: !!marketAddress } });

  const infoData = info.data as any;
  const statusData = status.data as any;

  return {
    question: infoData?.[1] ?? "",
    expirationTime: infoData?.[2] ?? BigInt(0),
    resolved: infoData?.[3] ?? false,
    totalPool: infoData?.[4] ?? BigInt(0),
    winningOutcome: statusData?.[0] ?? 0,
    paused: statusData?.[1] ?? false,
    outcomeCount: statusData?.[2] ?? BigInt(0),
    outcomes: (outcomes.data as string[] | undefined) ?? [],
    pools: (pools.data as bigint[] | undefined) ?? [],
    expectedPayout: (payout.data as bigint | undefined) ?? BigInt(0),
    hasClaimed: (claimed.data as boolean | undefined) ?? false,
    feeBps: (feeBps.data as bigint | undefined) ?? BigInt(200),
    isLoading: info.isLoading || outcomes.isLoading || pools.isLoading,
    refetch: () => { info.refetch(); status.refetch(); outcomes.refetch(); pools.refetch(); payout.refetch(); },
  };
}

export function useBuyMultiShares(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyShares = async (outcomeIndex: number, ethAmount: string) => {
    return writeContractAsync({
      address: marketAddress!,
      abi: MULTI_MARKET_ABI,
      functionName: "buyShares",
      args: [outcomeIndex as unknown as never],
      value: parseEther(ethAmount as `${number}`),
      gas: BigInt(300000),
    });
  };

  return { buyShares, isPending, isConfirming, isSuccess };
}

export function useResolveMultiMarket(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const resolve = async () => writeContractAsync({ address: marketAddress!, abi: MULTI_MARKET_ABI, functionName: "resolve", gas: BigInt(200000) });
  return { resolve, isPending, isConfirming, isSuccess };
}

export function useClaimMultiReward(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claimReward = async () => writeContractAsync({ address: marketAddress!, abi: MULTI_MARKET_ABI, functionName: "claimReward", gas: BigInt(200000) });
  return { claimReward, isPending, isConfirming, isSuccess };
}

export function useCreateMultiMarket() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createMarket = async (question: string, outcomes: string[], expirationTime: bigint) => {
    return writeContractAsync({
      address: MULTI_FACTORY_ADDRESS,
      abi: MULTI_FACTORY_ABI,
      functionName: "createMarket",
      args: [question, outcomes, expirationTime],
      gas: BigInt(3000000),
    });
  };

  return { createMarket, isPending, isConfirming, isSuccess };
}

export function useResolveViaOracle(marketId?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolve = async (winningOutcomeIndex: number) => {
    return writeContractAsync({
      address: MULTI_ORACLE_ADDRESS,
      abi: MULTI_ORACLE_ABI,
      functionName: "resolve",
      args: [marketId!, winningOutcomeIndex as unknown as never],
    });
  };

  return { resolve, isPending, isConfirming, isSuccess };
}
