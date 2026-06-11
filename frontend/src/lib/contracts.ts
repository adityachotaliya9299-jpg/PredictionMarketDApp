// Contract ABIs and deployment addresses
// Update FACTORY_ADDRESS after deploying via `forge script`

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const ORACLE_ADDRESS = (process.env.NEXT_PUBLIC_ORACLE_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// ─── Market Factory ABI ───────────────────────────────────────────────────────
export const FACTORY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_oracle", type: "address" },
      { name: "_feeCollector", type: "address" },
      { name: "_feeBps", type: "uint256" },
      { name: "_owner", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "question", type: "string" },
      { name: "category", type: "string" },
      { name: "expirationTime", type: "uint256" },
    ],
    outputs: [
      { name: "market", type: "address" },
      { name: "marketId", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllMarkets",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "marketId", type: "bytes32" },
          { name: "marketAddress", type: "address" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getActiveMarkets",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "marketId", type: "bytes32" },
          { name: "marketAddress", type: "address" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketsByCreator",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "marketId", type: "bytes32" },
          { name: "marketAddress", type: "address" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "marketId", type: "bytes32" },
          { name: "marketAddress", type: "address" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "expirationTime", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "oracle",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeCollector",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setOracle",
    inputs: [{ name: "newOracle", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeBps",
    inputs: [{ name: "newFeeBps", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeCollector",
    inputs: [{ name: "newCollector", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pauseMarket",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpauseMarket",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deactivateMarket",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "market", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "question", type: "string", indexed: false },
      { name: "expirationTime", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── Prediction Market ABI ────────────────────────────────────────────────────
export const MARKET_ABI = [
  {
    type: "function",
    name: "buyYesShares",
    inputs: [],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "buyNoShares",
    inputs: [],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "resolveMarket",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimReward",
    inputs: [],
    outputs: [{ name: "reward", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMarketInfo",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "marketId", type: "bytes32" },
          { name: "question", type: "string" },
          { name: "expirationTime", type: "uint256" },
          { name: "resolutionTime", type: "uint256" },
          { name: "outcome", type: "uint8" },
          { name: "paused", type: "bool" },
          { name: "totalYesShares", type: "uint256" },
          { name: "totalNoShares", type: "uint256" },
          { name: "totalPool", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserShares",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "yesShares", type: "uint256" },
      { name: "noShares", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateProbability",
    inputs: [],
    outputs: [
      { name: "yesProbability", type: "uint256" },
      { name: "noProbability", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getExpectedPayout",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "collectFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasClaimed",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "resolved",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "outcome",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalPool",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalFeeCollected",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SharesPurchased",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "isYes", type: "bool", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketResolved",
    inputs: [
      { name: "outcome", type: "uint8", indexed: false },
      { name: "totalPool", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardClaimed",
    inputs: [
      { name: "claimer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── Oracle ABI ───────────────────────────────────────────────────────────────
export const ORACLE_ABI = [
  {
    type: "function",
    name: "setResolution",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "outcome", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getResolution",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [{ name: "outcome", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isResolved",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [{ name: "resolved", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

// ─── Phase 3 Contract Addresses ──────────────────────────────────────────────
export const PRED_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PRED_TOKEN as `0x${string}`;
export const LIQUIDITY_MINING_ADDRESS = process.env.NEXT_PUBLIC_LIQUIDITY_MINING as `0x${string}`;
export const REFERRAL_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_REFERRAL_SYSTEM as `0x${string}`;
export const CHAINLINK_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_CHAINLINK_ORACLE as `0x${string}`;

// ─── PRED Token ABI ───────────────────────────────────────────────────────────
export const PRED_TOKEN_ABI = [
  { name:"balanceOf", type:"function", stateMutability:"view", inputs:[{name:"account",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"totalSupply", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"symbol", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"string"}] },
  { name:"decimals", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint8"}] },
  { name:"transfer", type:"function", stateMutability:"nonpayable", inputs:[{name:"to",type:"address"},{name:"amount",type:"uint256"}], outputs:[{name:"",type:"bool"}] },
  { name:"approve", type:"function", stateMutability:"nonpayable", inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{name:"",type:"bool"}] },
  { name:"allowance", type:"function", stateMutability:"view", inputs:[{name:"owner",type:"address"},{name:"spender",type:"address"}], outputs:[{name:"",type:"uint256"}] },
] as const;

// ─── Liquidity Mining ABI ─────────────────────────────────────────────────────
export const LIQUIDITY_MINING_ABI = [
  { name:"getPendingRewards", type:"function", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"totalClaimed", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"creatorReward", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"traderReward", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"claimRewards", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"RewardClaimed", type:"event", inputs:[{name:"user",type:"address",indexed:true},{name:"amount",type:"uint256",indexed:false}] },
] as const;

// ─── Referral System ABI ──────────────────────────────────────────────────────
export const REFERRAL_SYSTEM_ABI = [
  { name:"getReferralStats", type:"function", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{name:"referrer",type:"address"},{name:"count",type:"uint256"},{name:"pending",type:"uint256"},{name:"total",type:"uint256"}] },
  { name:"referrerOf", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"address"}] },
  { name:"claimEarnings", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"referralFeeBps", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
] as const;

// ─── Chainlink Oracle ABI ─────────────────────────────────────────────────────
export const CHAINLINK_ORACLE_ABI = [
  { name:"isResolved", type:"function", stateMutability:"view", inputs:[{name:"marketId",type:"bytes32"}], outputs:[{name:"",type:"bool"}] },
  { name:"getOutcome", type:"function", stateMutability:"view", inputs:[{name:"marketId",type:"bytes32"}], outputs:[{name:"",type:"uint8"}] },
  { name:"getLatestPrice", type:"function", stateMutability:"view", inputs:[{name:"feed",type:"address"}], outputs:[{name:"",type:"int256"}] },
  { name:"tryResolve", type:"function", stateMutability:"nonpayable", inputs:[{name:"marketId",type:"bytes32"}], outputs:[] },
  { name:"ETH_USD_FEED", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"address"}] },
  { name:"BTC_USD_FEED", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"address"}] },
] as const;

// ─── Multi-Outcome Contract Addresses ────────────────────────────────────────
export const MULTI_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_MULTI_ORACLE as `0x${string}`;
export const MULTI_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MULTI_FACTORY as `0x${string}`;

// ─── Multi Oracle ABI ─────────────────────────────────────────────────────────
export const MULTI_ORACLE_ABI = [
  { name:"isResolved", type:"function", stateMutability:"view", inputs:[{name:"marketId",type:"bytes32"}], outputs:[{name:"",type:"bool"}] },
  { name:"getWinningOutcome", type:"function", stateMutability:"view", inputs:[{name:"marketId",type:"bytes32"}], outputs:[{name:"",type:"uint8"}] },
  { name:"resolve", type:"function", stateMutability:"nonpayable", inputs:[{name:"marketId",type:"bytes32"},{name:"winningOutcome",type:"uint8"}], outputs:[] },
] as const;

// ─── Multi Market Factory ABI ─────────────────────────────────────────────────
export const MULTI_FACTORY_ABI = [
  { name:"createMarket", type:"function", stateMutability:"nonpayable", inputs:[{name:"question",type:"string"},{name:"outcomes",type:"string[]"},{name:"expirationTime",type:"uint256"}], outputs:[{name:"market",type:"address"},{name:"marketId",type:"bytes32"}] },
  { name:"getAllMarkets", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"tuple[]",components:[{name:"marketAddress",type:"address"},{name:"creator",type:"address"},{name:"question",type:"string"},{name:"outcomes",type:"string[]"},{name:"expirationTime",type:"uint256"},{name:"active",type:"bool"}]}] },
  { name:"getMarketCount", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"getMarketsByCreator", type:"function", stateMutability:"view", inputs:[{name:"creator",type:"address"}], outputs:[{name:"",type:"tuple[]",components:[{name:"marketAddress",type:"address"},{name:"creator",type:"address"},{name:"question",type:"string"},{name:"outcomes",type:"string[]"},{name:"expirationTime",type:"uint256"},{name:"active",type:"bool"}]}] },
] as const;

// ─── Multi Outcome Market ABI ─────────────────────────────────────────────────
export const MULTI_MARKET_ABI = [
  { name:"buyShares", type:"function", stateMutability:"payable", inputs:[{name:"outcomeIndex",type:"uint8"}], outputs:[{name:"sharesReceived",type:"uint256"}] },
  { name:"resolve", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"claimReward", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"getMarketInfo", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"_marketId",type:"bytes32"},{name:"_question",type:"string"},{name:"_expirationTime",type:"uint256"},{name:"_resolved",type:"bool"},{name:"_totalPool",type:"uint256"}] },
  { name:"getMarketStatus", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"_winningOutcome",type:"uint8"},{name:"_paused",type:"bool"},{name:"_outcomeCount",type:"uint256"}] },
  { name:"getOutcomes", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"string[]"}] },
  { name:"getAllOutcomePools", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"pools",type:"uint256[]"}] },
  { name:"getUserShares", type:"function", stateMutability:"view", inputs:[{name:"user",type:"address"},{name:"outcomeIndex",type:"uint8"}], outputs:[{name:"",type:"uint256"}] },
  { name:"getExpectedPayout", type:"function", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"outcomePools", type:"function", stateMutability:"view", inputs:[{name:"",type:"uint8"}], outputs:[{name:"",type:"uint256"}] },
  { name:"totalPool", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"resolved", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"bool"}] },
  { name:"winningOutcome", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint8"}] },
  { name:"expirationTime", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"feeBps", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"hasClaimed", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"bool"}] },
] as const;

// ─── Phase 3 Governance Addresses ────────────────────────────────────────────
export const PRED_STAKING_ADDRESS = process.env.NEXT_PUBLIC_PRED_STAKING as `0x${string}`;
export const GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE as `0x${string}`;

// ─── PREDStaking ABI ──────────────────────────────────────────────────────────
export const PRED_STAKING_ABI = [
  { name:"stake", type:"function", stateMutability:"nonpayable", inputs:[{name:"amount",type:"uint256"}], outputs:[] },
  { name:"unstake", type:"function", stateMutability:"nonpayable", inputs:[{name:"amount",type:"uint256"}], outputs:[] },
  { name:"claimReward", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"depositReward", type:"function", stateMutability:"payable", inputs:[], outputs:[] },
  { name:"getStakeInfo", type:"function", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{name:"staked",type:"uint256"},{name:"pendingReward",type:"uint256"},{name:"share",type:"uint256"}] },
  { name:"stakedBalance", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"totalStaked", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"earned", type:"function", stateMutability:"view", inputs:[{name:"account",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"rewards", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"Staked", type:"event", inputs:[{name:"user",type:"address",indexed:true},{name:"amount",type:"uint256",indexed:false}] },
  { name:"Unstaked", type:"event", inputs:[{name:"user",type:"address",indexed:true},{name:"amount",type:"uint256",indexed:false}] },
  { name:"RewardClaimed", type:"event", inputs:[{name:"user",type:"address",indexed:true},{name:"amount",type:"uint256",indexed:false}] },
] as const;

// ─── Governance ABI ───────────────────────────────────────────────────────────
export const GOVERNANCE_ABI = [
  { name:"propose", type:"function", stateMutability:"nonpayable", inputs:[{name:"title",type:"string"},{name:"description",type:"string"}], outputs:[{name:"",type:"uint256"}] },
  { name:"vote", type:"function", stateMutability:"nonpayable", inputs:[{name:"proposalId",type:"uint256"},{name:"support",type:"bool"}], outputs:[] },
  { name:"execute", type:"function", stateMutability:"nonpayable", inputs:[{name:"proposalId",type:"uint256"}], outputs:[] },
  { name:"cancel", type:"function", stateMutability:"nonpayable", inputs:[{name:"proposalId",type:"uint256"}], outputs:[] },
  { name:"getAllProposals", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"tuple[]",components:[{name:"id",type:"uint256"},{name:"proposer",type:"address"},{name:"title",type:"string"},{name:"description",type:"string"},{name:"forVotes",type:"uint256"},{name:"againstVotes",type:"uint256"},{name:"startTime",type:"uint256"},{name:"endTime",type:"uint256"},{name:"state",type:"uint8"},{name:"executed",type:"bool"}]}] },
  { name:"getProposalState", type:"function", stateMutability:"view", inputs:[{name:"id",type:"uint256"}], outputs:[{name:"",type:"uint8"}] },
  { name:"hasVoted", type:"function", stateMutability:"view", inputs:[{name:"",type:"uint256"},{name:"",type:"address"}], outputs:[{name:"",type:"bool"}] },
  { name:"proposalCount", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"quorum", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"votingPeriod", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"ProposalCreated", type:"event", inputs:[{name:"id",type:"uint256",indexed:true},{name:"proposer",type:"address",indexed:true},{name:"title",type:"string",indexed:false}] },
  { name:"VoteCast", type:"event", inputs:[{name:"proposalId",type:"uint256",indexed:true},{name:"voter",type:"address",indexed:true},{name:"support",type:"bool",indexed:false},{name:"weight",type:"uint256",indexed:false}] },
] as const;

// ─── PRED Faucet ──────────────────────────────────────────────────────────────
export const PRED_FAUCET_ADDRESS = process.env.NEXT_PUBLIC_PRED_FAUCET as `0x${string}`;

export const PRED_FAUCET_ABI = [
  { name:"claim", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"hasClaimed", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"bool"}] },
  { name:"faucetBalance", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"claimAmount", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"Claimed", type:"event", inputs:[{name:"user",type:"address",indexed:true},{name:"amount",type:"uint256",indexed:false}] },
] as const;

// ─── Phase 4 Addresses ────────────────────────────────────────────────────────
export const USDC_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_USDC_FACTORY as `0x${string}`;
export const SCALAR_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_SCALAR_FACTORY as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

// ─── USDC ABI (minimal ERC20) ─────────────────────────────────────────────────
export const USDC_ABI = [
  { name:"balanceOf", type:"function", stateMutability:"view", inputs:[{name:"account",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"approve", type:"function", stateMutability:"nonpayable", inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{name:"",type:"bool"}] },
  { name:"allowance", type:"function", stateMutability:"view", inputs:[{name:"owner",type:"address"},{name:"spender",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"decimals", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint8"}] },
] as const;

// ─── USDC Factory ABI ─────────────────────────────────────────────────────────
export const USDC_FACTORY_ABI = [
  { name:"createMarket", type:"function", stateMutability:"nonpayable", inputs:[{name:"question",type:"string"},{name:"category",type:"string"},{name:"expirationTime",type:"uint256"}], outputs:[{name:"market",type:"address"},{name:"marketId",type:"bytes32"}] },
  { name:"getAllMarkets", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"tuple[]",components:[{name:"marketAddress",type:"address"},{name:"creator",type:"address"},{name:"question",type:"string"},{name:"category",type:"string"},{name:"expirationTime",type:"uint256"},{name:"active",type:"bool"}]}] },
  { name:"getMarketCount", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
] as const;

// ─── USDC Market ABI ──────────────────────────────────────────────────────────
export const USDC_MARKET_ABI = [
  { name:"buyYesShares", type:"function", stateMutability:"nonpayable", inputs:[{name:"amount",type:"uint256"}], outputs:[{name:"shares",type:"uint256"}] },
  { name:"buyNoShares", type:"function", stateMutability:"nonpayable", inputs:[{name:"amount",type:"uint256"}], outputs:[{name:"shares",type:"uint256"}] },
  { name:"resolve", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"claimReward", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
  { name:"getMarketInfo", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"_marketId",type:"bytes32"},{name:"_question",type:"string"},{name:"_category",type:"string"},{name:"_expirationTime",type:"uint256"},{name:"_resolved",type:"bool"},{name:"_totalPool",type:"uint256"}] },
  { name:"yesShares", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"noShares", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"uint256"}] },
  { name:"totalYesShares", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"totalNoShares", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"hasClaimed", type:"function", stateMutability:"view", inputs:[{name:"",type:"address"}], outputs:[{name:"",type:"bool"}] },
  { name:"feeBps", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
  { name:"resolved", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"bool"}] },
  { name:"outcome", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint8"}] },
] as const;

// ─── Scalar Factory ABI ───────────────────────────────────────────────────────
export const SCALAR_FACTORY_ABI = [
  { name:"createScalarMarket", type:"function", stateMutability:"nonpayable", inputs:[{name:"question",type:"string"},{name:"ranges",type:"string[]"},{name:"priceFeed",type:"address"},{name:"expirationTime",type:"uint256"}], outputs:[{name:"market",type:"address"},{name:"marketId",type:"bytes32"}] },
  { name:"getAllMarkets", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"tuple[]",components:[{name:"marketAddress",type:"address"},{name:"marketId",type:"bytes32"},{name:"creator",type:"address"},{name:"question",type:"string"},{name:"ranges",type:"string[]"},{name:"priceFeed",type:"address"},{name:"expirationTime",type:"uint256"},{name:"active",type:"bool"}]}] },
  { name:"getMarketCount", type:"function", stateMutability:"view", inputs:[], outputs:[{name:"",type:"uint256"}] },
] as const;
