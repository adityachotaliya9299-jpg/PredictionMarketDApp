import { GraphQLClient, gql } from "graphql-request";

export const client = new GraphQLClient(
  "https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.5"
);

export const GET_MARKETS = gql`
  query GetMarkets {
    markets(orderBy: createdAt, orderDirection: desc) {
      id
      address
      creator
      question
      category
      endTime
      resolved
      outcome
      yesPool
      noPool
      createdAt
    }
  }
`;

export const GET_MARKET_TRADES = gql`
  query GetMarketTrades($marketId: ID!) {
    market(id: $marketId) {
      id
      question
      yesPool
      noPool
      resolved
      outcome
      trades(orderBy: timestamp, orderDirection: desc) {
        id
        trader
        isYes
        shares
        cost
        timestamp
      }
    }
  }
`;

export const GET_USER_TRADES = gql`
  query GetUserTrades($trader: String!) {
    trades(where: { trader: $trader }, orderBy: timestamp, orderDirection: desc) {
      id
      isYes
      shares
      cost
      timestamp
      market {
        id
        question
        resolved
        outcome
      }
    }
  }
`;

// Adapter: converts subgraph market to MarketMetadata shape
export function adaptSubgraphMarket(m: any) {
  return {
    marketId: m.id as `0x${string}`,
    marketAddress: m.address as `0x${string}`,
    question: m.question,
    category: m.category && m.category !== "" ? m.category : "General",
    creator: m.creator as `0x${string}`,
    createdAt: BigInt(m.createdAt),
    expirationTime: BigInt(m.endTime),
    active: !m.resolved,
  };
}

export const GET_MULTI_MARKETS = gql`
  query GetMultiMarkets {
    multiMarkets(orderBy: createdAt, orderDirection: desc) {
      id
      address
      creator
      question
      outcomes
      endTime
      resolved
      winningOutcome
      totalPool
      outcomePools
      createdAt
    }
  }
`;

export const GET_USER_MULTI_TRADES = gql`
  query GetUserMultiTrades($trader: String!) {
    multiTrades(where: { trader: $trader }, orderBy: timestamp, orderDirection: desc) {
      id
      outcomeIndex
      outcomeName
      shares
      cost
      timestamp
      market {
        id
        question
        resolved
        winningOutcome
        outcomes
      }
    }
  }
`;
