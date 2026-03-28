"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { FACTORY_ABI, FACTORY_ADDRESS, MARKET_ABI, ORACLE_ABI, ORACLE_ADDRESS } from "@/lib/contracts";

// ─── Create Market ────────────────────────────────────────────────────────────
export function useCreateMarket() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createMarket = async (question: string, category: string, expirationTime: bigint) => {
    return writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createMarket",
      args: [question, category, expirationTime],
      gas: BigInt(3000000),
    });
  };

  return { createMarket, isPending, isConfirming, isSuccess, hash };
}

// ─── Buy Shares ───────────────────────────────────────────────────────────────
export function useBuyShares(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyYes = async (ethAmount: string) => {
    if (!marketAddress) throw new Error("No market address");
    return writeContractAsync({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "buyYesShares",
      value: parseEther(ethAmount as `${number}`),
    });
  };

  const buyNo = async (ethAmount: string) => {
    if (!marketAddress) throw new Error("No market address");
    return writeContractAsync({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "buyNoShares",
      value: parseEther(ethAmount as `${number}`),
    });
  };

  return { buyYes, buyNo, isPending, isConfirming, isSuccess, hash };
}

// ─── Resolve Market ───────────────────────────────────────────────────────────
export function useResolveMarket(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolveMarket = async () => {
    if (!marketAddress) throw new Error("No market address");
    return writeContractAsync({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "resolveMarket",
    });
  };

  return { resolveMarket, isPending, isConfirming, isSuccess, hash };
}

// ─── Claim Reward ─────────────────────────────────────────────────────────────
export function useClaimReward(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimReward = async () => {
    if (!marketAddress) throw new Error("No market address");
    return writeContractAsync({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "claimReward",
    });
  };

  return { claimReward, isPending, isConfirming, isSuccess, hash };
}

// ─── Oracle: Set Resolution (Admin) ──────────────────────────────────────────
export function useSetOracleResolution() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setResolution = async (marketId: `0x${string}`, outcome: number) => {
    return writeContractAsync({
      address: ORACLE_ADDRESS,
      abi: ORACLE_ABI,
      functionName: "setResolution",
      args: [marketId, outcome],
    });
  };

  return { setResolution, isPending, isConfirming, isSuccess, hash };
}

// ─── Factory Admin ────────────────────────────────────────────────────────────
export function useFactoryAdmin() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pauseFactory = () =>
    writeContractAsync({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "pause" });

  const unpauseFactory = () =>
    writeContractAsync({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "unpause" });

  const setFeeBps = (feeBps: bigint) =>
    writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "setFeeBps",
      args: [feeBps],
    });

  const setOracle = (oracle: `0x${string}`) =>
    writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "setOracle",
      args: [oracle],
    });

  const setFeeCollector = (collector: `0x${string}`) =>
    writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "setFeeCollector",
      args: [collector],
    });

  const pauseMarket = (marketId: `0x${string}`) =>
    writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "pauseMarket",
      args: [marketId],
    });

  const unpauseMarket = (marketId: `0x${string}`) =>
    writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "unpauseMarket",
      args: [marketId],
    });

  const deactivateMarket = (marketId: `0x${string}`) =>
    writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "deactivateMarket",
      args: [marketId],
    });

  return {
    pauseFactory,
    unpauseFactory,
    setFeeBps,
    setOracle,
    setFeeCollector,
    pauseMarket,
    unpauseMarket,
    deactivateMarket,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// ─── Collect Fees ─────────────────────────────────────────────────────────────
export function useCollectFees(marketAddress?: `0x${string}`) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const collectFees = async () => {
    if (!marketAddress) throw new Error("No market address");
    return writeContractAsync({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "collectFees",
    });
  };

  return { collectFees, isPending, isConfirming, isSuccess, hash };
}
