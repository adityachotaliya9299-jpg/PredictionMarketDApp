"use client";
import { useEffect, useState } from "react";
import { client, GET_MARKETS, GET_MARKET_TRADES, GET_USER_TRADES, GET_MULTI_MARKETS, GET_USER_MULTI_TRADES, adaptSubgraphMarket } from "@/lib/graphql";
import type { MarketMetadata } from "@/types/market";

export function useSubgraphMarkets() {
  const [data, setData] = useState<MarketMetadata[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client.request(GET_MARKETS)
      .then((res: any) => {
        setData(res.markets.map(adaptSubgraphMarket));
        setIsLoading(false);
      })
      .catch((err: Error) => { setError(err); setIsLoading(false); });
  }, []);

  return { data, isLoading, error };
}

export function useSubgraphMarketTrades(marketId?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!marketId) return;
    client.request(GET_MARKET_TRADES, { marketId: marketId.toLowerCase() })
      .then((res: any) => { setData(res.market); setIsLoading(false); })
      .catch((err: Error) => { setError(err); setIsLoading(false); });
  }, [marketId]);

  return { data, isLoading, error };
}

export function useSubgraphUserTrades(trader?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!trader) return;
    client.request(GET_USER_TRADES, { trader: trader.toLowerCase() })
      .then((res: any) => { setData(res.trades); setIsLoading(false); })
      .catch((err: Error) => { setError(err); setIsLoading(false); });
  }, [trader]);

  return { data, isLoading, error };
}

export function useSubgraphMultiMarkets() {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client.request(GET_MULTI_MARKETS)
      .then((res: any) => { setData(res.multiMarkets); setIsLoading(false); })
      .catch((err: Error) => { setError(err); setIsLoading(false); });
  }, []);

  return { data, isLoading, error };
}

export function useSubgraphUserMultiTrades(trader?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!trader) return;
    client.request(GET_USER_MULTI_TRADES, { trader: trader.toLowerCase() })
      .then((res: any) => { setData(res.multiTrades); setIsLoading(false); })
      .catch((err: Error) => { setError(err); setIsLoading(false); });
  }, [trader]);

  return { data, isLoading, error };
}
