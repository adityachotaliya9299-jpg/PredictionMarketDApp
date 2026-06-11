"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  USDC_FACTORY_ADDRESS, USDC_FACTORY_ABI,
  USDC_MARKET_ABI, USDC_ADDRESS, USDC_ABI,
  SCALAR_FACTORY_ADDRESS, SCALAR_FACTORY_ABI,
} from "@/lib/contracts";

const C = 11155111;

// ─── USDC Hooks ───────────────────────────────────────────────────────────────
export function useUSDCMarkets() {
  return useReadContract({
    address: USDC_FACTORY_ADDRESS, abi: USDC_FACTORY_ABI,
    functionName: "getAllMarkets", chainId: C
  });
}

export function useUSDCBalance(address?: `0x${string}`) {
  const result = useReadContract({
    address: USDC_ADDRESS, abi: USDC_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
  return {
    data: result.data as bigint | undefined,
    formatted: result.data ? Number(formatUnits(result.data as bigint, 6)).toFixed(2) : "0.00",
    isLoading: result.isLoading,
  };
}

export function useUSDCAllowance(owner?: `0x${string}`, spender?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS, abi: USDC_ABI,
    functionName: "allowance", args: owner && spender ? [owner, spender] : undefined,
    chainId: C, query: { enabled: !!owner && !!spender }
  });
}

export function useApproveUSDC(spender?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const approve = async (amount: string) => writeContractAsync({
    address: USDC_ADDRESS, abi: USDC_ABI,
    functionName: "approve",
    args: [spender!, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
    gas: BigInt(80000),
  });
  return { approve, isPending, isConfirming, isSuccess };
}

export function useCreateUSDCMarket() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const createMarket = async (question: string, category: string, expirationTime: bigint) =>
    writeContractAsync({
      address: USDC_FACTORY_ADDRESS, abi: USDC_FACTORY_ABI,
      functionName: "createMarket", args: [question, category, expirationTime],
      gas: BigInt(3000000),
    });
  return { createMarket, isPending, isConfirming, isSuccess };
}

export function useUSDCMarketDetail(marketAddress?: `0x${string}`) {
  const { address } = useAccount();
  const info = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "getMarketInfo", chainId: C, query: { enabled: !!marketAddress } });
  const yesPool = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "totalYesShares", chainId: C, query: { enabled: !!marketAddress } });
  const noPool = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "totalNoShares", chainId: C, query: { enabled: !!marketAddress } });
  const userYes = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "yesShares", args: address ? [address] : undefined, chainId: C, query: { enabled: !!marketAddress && !!address } });
  const userNo = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "noShares", args: address ? [address] : undefined, chainId: C, query: { enabled: !!marketAddress && !!address } });
  const claimed = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "hasClaimed", args: address ? [address] : undefined, chainId: C, query: { enabled: !!marketAddress && !!address } });
  const feeBps = useReadContract({ address: marketAddress, abi: USDC_MARKET_ABI, functionName: "feeBps", chainId: C, query: { enabled: !!marketAddress } });

  const infoData = info.data as any;
  const yesPoolAmt = (yesPool.data as bigint | undefined) ?? BigInt(0);
  const noPoolAmt = (noPool.data as bigint | undefined) ?? BigInt(0);
  const totalPool = yesPoolAmt + noPoolAmt;
  const yesPct = totalPool > BigInt(0) ? Number(yesPoolAmt * BigInt(100) / totalPool) : 50;

  return {
    question: infoData?.[1] ?? "",
    category: infoData?.[2] ?? "",
    expirationTime: infoData?.[3] ?? BigInt(0),
    resolved: infoData?.[4] ?? false,
    totalPool,
    yesPool: yesPoolAmt,
    noPool: noPoolAmt,
    yesPct,
    noPct: 100 - yesPct,
    userYesShares: (userYes.data as bigint | undefined) ?? BigInt(0),
    userNoShares: (userNo.data as bigint | undefined) ?? BigInt(0),
    hasClaimed: (claimed.data as boolean | undefined) ?? false,
    feeBps: (feeBps.data as bigint | undefined) ?? BigInt(200),
    isLoading: info.isLoading,
    refetch: () => { info.refetch(); yesPool.refetch(); noPool.refetch(); userYes.refetch(); userNo.refetch(); },
  };
}

export function useBuyUSDCShares(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const buyYes = async (usdcAmount: string) => writeContractAsync({
    address: marketAddress!, abi: USDC_MARKET_ABI,
    functionName: "buyYesShares",
    args: [parseUnits(usdcAmount, 6)],
    gas: BigInt(200000),
  });
  const buyNo = async (usdcAmount: string) => writeContractAsync({
    address: marketAddress!, abi: USDC_MARKET_ABI,
    functionName: "buyNoShares",
    args: [parseUnits(usdcAmount, 6)],
    gas: BigInt(200000),
  });
  return { buyYes, buyNo, isPending, isConfirming, isSuccess };
}

export function useClaimUSDCReward(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claimReward = async () => writeContractAsync({
    address: marketAddress!, abi: USDC_MARKET_ABI,
    functionName: "claimReward", gas: BigInt(150000),
  });
  return { claimReward, isPending, isConfirming, isSuccess };
}

// ─── Scalar Hooks ─────────────────────────────────────────────────────────────
export function useScalarMarkets() {
  return useReadContract({
    address: SCALAR_FACTORY_ADDRESS, abi: SCALAR_FACTORY_ABI,
    functionName: "getAllMarkets", chainId: C
  });
}

export function useCreateScalarMarket() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const createMarket = async (question: string, ranges: string[], priceFeed: string, expirationTime: bigint) =>
    writeContractAsync({
      address: SCALAR_FACTORY_ADDRESS, abi: SCALAR_FACTORY_ABI,
      functionName: "createScalarMarket",
      args: [question, ranges, priceFeed as `0x${string}`, expirationTime],
      gas: BigInt(3000000),
    });
  return { createMarket, isPending, isConfirming, isSuccess };
}
