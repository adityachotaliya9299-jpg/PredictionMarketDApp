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
