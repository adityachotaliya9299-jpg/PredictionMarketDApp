"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { PRED_STAKING_ADDRESS, PRED_STAKING_ABI, GOVERNANCE_ADDRESS, GOVERNANCE_ABI, PRED_TOKEN_ADDRESS, PRED_TOKEN_ABI, PRED_FAUCET_ADDRESS, PRED_FAUCET_ABI } from "@/lib/contracts";

const C = 11155111;

// ─── Staking Hooks ────────────────────────────────────────────────────────────
export function useStakeInfo(address?: `0x${string}`) {
  const result = useReadContract({
    address: PRED_STAKING_ADDRESS, abi: PRED_STAKING_ABI,
    functionName: "getStakeInfo", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
  const data = result.data as [bigint, bigint, bigint] | undefined;
  return {
    staked: data?.[0] ?? BigInt(0),
    pendingReward: data?.[1] ?? BigInt(0),
    share: data?.[2] ?? BigInt(0),
    stakedFmt: data ? Number(formatEther(data[0])).toFixed(2) : "0.00",
    rewardFmt: data ? Number(formatEther(data[1])).toFixed(6) : "0.000000",
    sharePct: data ? (Number(data[2]) / 100).toFixed(2) : "0.00",
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}

export function useTotalStaked() {
  return useReadContract({
    address: PRED_STAKING_ADDRESS, abi: PRED_STAKING_ABI,
    functionName: "totalStaked", chainId: C
  });
}

export function useStakePRED() {
  const { writeContractAsync, isPending, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash });
  const stake = async (amount: string) => writeContractAsync({
    address: PRED_STAKING_ADDRESS, abi: PRED_STAKING_ABI,
    functionName: "stake", args: [parseEther(amount as `${number}`)],
    gas: BigInt(200000),
  });
  const error = writeError || txError;
  return { stake, isPending, isConfirming, isSuccess, isError: isTxError, error };
}

export function useUnstakePRED() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const unstake = async (amount: string) => writeContractAsync({
    address: PRED_STAKING_ADDRESS, abi: PRED_STAKING_ABI,
    functionName: "unstake", args: [parseEther(amount as `${number}`)],
    gas: BigInt(200000),
  });
  return { unstake, isPending, isConfirming, isSuccess };
}

export function useClaimStakingReward() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claim = async () => writeContractAsync({
    address: PRED_STAKING_ADDRESS, abi: PRED_STAKING_ABI,
    functionName: "claimReward",
    gas: BigInt(60000),
  });
  return { claim, isPending, isConfirming, isSuccess };
}

export function useApprovePRED() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const approve = async (amount: string) => writeContractAsync({
    address: PRED_TOKEN_ADDRESS, abi: PRED_TOKEN_ABI,
    functionName: "approve",
    args: [PRED_STAKING_ADDRESS, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
    gas: BigInt(60000),
  });
  return { approve, isPending, isConfirming, isSuccess };
}

export function usePREDAllowance(owner?: `0x${string}`) {
  return useReadContract({
    address: PRED_TOKEN_ADDRESS, abi: PRED_TOKEN_ABI,
    functionName: "allowance",
    args: owner ? [owner, PRED_STAKING_ADDRESS] : undefined,
    chainId: C, query: { enabled: !!owner }
  });
}

// ─── Governance Hooks ─────────────────────────────────────────────────────────
export function useAllProposals() {
  return useReadContract({
    address: GOVERNANCE_ADDRESS, abi: GOVERNANCE_ABI,
    functionName: "getAllProposals", chainId: C,
    query: { refetchInterval: 30000 }
  });
}

export function useProposalCount() {
  return useReadContract({
    address: GOVERNANCE_ADDRESS, abi: GOVERNANCE_ABI,
    functionName: "proposalCount", chainId: C
  });
}

export function useHasVoted(proposalId?: bigint, voter?: `0x${string}`) {
  return useReadContract({
    address: GOVERNANCE_ADDRESS, abi: GOVERNANCE_ABI,
    functionName: "hasVoted",
    args: proposalId !== undefined && voter ? [proposalId, voter] : undefined,
    chainId: C, query: { enabled: proposalId !== undefined && !!voter }
  });
}

export function useCreateProposal() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const propose = async (title: string, description: string) => writeContractAsync({
    address: GOVERNANCE_ADDRESS, abi: GOVERNANCE_ABI,
    functionName: "propose", args: [title, description],
    gas: BigInt(300000),
  });
  return { propose, isPending, isConfirming, isSuccess };
}

export function useCastVote() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const castVote = async (proposalId: bigint, support: boolean) => writeContractAsync({
    address: GOVERNANCE_ADDRESS, abi: GOVERNANCE_ABI,
    functionName: "vote", args: [proposalId, support],
    gas: BigInt(100000),
  });
  return { castVote, isPending, isConfirming, isSuccess };
}

// ─── Faucet Hooks ─────────────────────────────────────────────────────────────
export function useFaucetClaimed(address?: `0x${string}`) {
  return useReadContract({
    address: PRED_FAUCET_ADDRESS, abi: PRED_FAUCET_ABI,
    functionName: "hasClaimed", args: address ? [address] : undefined,
    chainId: C, query: { enabled: !!address }
  });
}

export function useFaucetBalance() {
  return useReadContract({
    address: PRED_FAUCET_ADDRESS, abi: PRED_FAUCET_ABI,
    functionName: "faucetBalance", chainId: C
  });
}

export function useClaimFaucet() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const claim = async () => writeContractAsync({
    address: PRED_FAUCET_ADDRESS, abi: PRED_FAUCET_ABI,
    functionName: "claim",
    gas: BigInt(80000),
  });
  return { claim, isPending, isConfirming, isSuccess };
}
