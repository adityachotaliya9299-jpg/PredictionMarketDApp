"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  PRED_TOKEN_ADDRESS, PRED_TOKEN_ABI,
  LIQUIDITY_MINING_ADDRESS, LIQUIDITY_MINING_ABI,
  REFERRAL_SYSTEM_ADDRESS, REFERRAL_SYSTEM_ABI,
  CHAINLINK_ORACLE_ADDRESS, CHAINLINK_ORACLE_ABI,
} from "@/lib/contracts";

const C = 11155111;

// ─── PRED Token ───────────────────────────────────────────────────────────────
export function usePREDBalance(address?: `0x${string}`) {
  return useReadContract({
    address: PRED_TOKEN_ADDRESS, abi: PRED_TOKEN_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
}

export function usePREDTotalSupply() {
  return useReadContract({
    address: PRED_TOKEN_ADDRESS, abi: PRED_TOKEN_ABI,
    functionName: "totalSupply", chainId: C
  });
}

// ─── Liquidity Mining ─────────────────────────────────────────────────────────
export function usePendingRewards(address?: `0x${string}`) {
  return useReadContract({
    address: LIQUIDITY_MINING_ADDRESS, abi: LIQUIDITY_MINING_ABI,
    functionName: "getPendingRewards", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
}

export function useTotalClaimed(address?: `0x${string}`) {
  return useReadContract({
    address: LIQUIDITY_MINING_ADDRESS, abi: LIQUIDITY_MINING_ABI,
    functionName: "totalClaimed", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
}

export function useRewardRates() {
  const creator = useReadContract({ address: LIQUIDITY_MINING_ADDRESS, abi: LIQUIDITY_MINING_ABI, functionName: "creatorReward", chainId: C });
  const trader = useReadContract({ address: LIQUIDITY_MINING_ADDRESS, abi: LIQUIDITY_MINING_ABI, functionName: "traderReward", chainId: C });
  return { creatorReward: creator.data, traderReward: trader.data };
}

export function useClaimPREDRewards() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claim = async () => writeContractAsync({
    address: LIQUIDITY_MINING_ADDRESS, abi: LIQUIDITY_MINING_ABI,
    functionName: "claimRewards",
  });
  return { claim, isPending, isConfirming, isSuccess };
}

// ─── Referral System ──────────────────────────────────────────────────────────
export function useReferralStats(address?: `0x${string}`) {
  const result = useReadContract({
    address: REFERRAL_SYSTEM_ADDRESS, abi: REFERRAL_SYSTEM_ABI,
    functionName: "getReferralStats", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
  const data = result.data as [string, bigint, bigint, bigint] | undefined;
  return {
    referrer: data?.[0],
    referralCount: data?.[1] ?? BigInt(0),
    pendingEarnings: data?.[2] ?? BigInt(0),
    totalEarnings: data?.[3] ?? BigInt(0),
    isLoading: result.isLoading,
  };
}

export function useClaimReferralEarnings() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claim = async () => writeContractAsync({
    address: REFERRAL_SYSTEM_ADDRESS, abi: REFERRAL_SYSTEM_ABI,
    functionName: "claimEarnings",
  });
  return { claim, isPending, isConfirming, isSuccess };
}

// ─── Chainlink Price Feeds ────────────────────────────────────────────────────
export function useETHPrice() {
  const ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306" as `0x${string}`;
  return useReadContract({
    address: CHAINLINK_ORACLE_ADDRESS, abi: CHAINLINK_ORACLE_ABI,
    functionName: "getLatestPrice", args: [ETH_FEED], chainId: C,
    query: { refetchInterval: 30000 } // refresh every 30s
  });
}

export function useBTCPrice() {
  const BTC_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43" as `0x${string}`;
  return useReadContract({
    address: CHAINLINK_ORACLE_ADDRESS, abi: CHAINLINK_ORACLE_ABI,
    functionName: "getLatestPrice", args: [BTC_FEED], chainId: C,
    query: { refetchInterval: 30000 }
  });
}

// ─── Combined user stats hook ─────────────────────────────────────────────────
export function useUserRewardStats() {
  const { address } = useAccount();
  const predBalance = usePREDBalance(address);
  const pendingRewards = usePendingRewards(address);
  const totalClaimed = useTotalClaimed(address);
  const referralStats = useReferralStats(address);
  const ethPrice = useETHPrice();
  const btcPrice = useBTCPrice();

  return {
    address,
    predBalance: predBalance.data ?? BigInt(0),
    pendingPRED: pendingRewards.data ?? BigInt(0),
    totalClaimedPRED: totalClaimed.data ?? BigInt(0),
    referralCount: referralStats.referralCount,
    pendingReferralETH: referralStats.pendingEarnings,
    ethPriceRaw: ethPrice.data,
    btcPriceRaw: btcPrice.data,
    // Formatted
    predBalanceFmt: Number(formatEther(predBalance.data ?? BigInt(0))).toFixed(2),
    pendingPREDFmt: Number(formatEther(pendingRewards.data ?? BigInt(0))).toFixed(2),
    ethPriceFmt: ethPrice.data ? `$${(Number(ethPrice.data) / 1e8).toFixed(2)}` : "—",
    btcPriceFmt: btcPrice.data ? `$${(Number(btcPrice.data) / 1e8).toFixed(2)}` : "—",
    isLoading: predBalance.isLoading || pendingRewards.isLoading,
  };
}
