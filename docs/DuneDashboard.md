# PredictX Dune Dashboard

Paste each query at https://dune.com/queries/new

---

## Query 1: Total Markets Created Over Time

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  COUNT(*) AS markets_created,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', block_time)) AS cumulative_markets
FROM ethereum.logs
WHERE contract_address = 0x51430273ca467fd6a961598b5bcd28d6532a8d33
  AND topic0 = 0x -- MarketCreated event topic
  AND blockchain = 'sepolia'
GROUP BY 1
ORDER BY 1
```

---

## Query 2: Trading Volume by Day

```sql
SELECT
  DATE_TRUNC('day', block_time) AS day,
  SUM(value / 1e18) AS eth_volume,
  COUNT(*) AS trade_count
FROM ethereum.traces
WHERE to IN (
  SELECT DISTINCT output_0
  FROM ethereum.logs
  WHERE contract_address = 0x51430273ca467fd6a961598b5bcd28d6532a8d33
  AND blockchain = 'sepolia'
)
AND blockchain = 'sepolia'
AND success = true
GROUP BY 1
ORDER BY 1
```

---

## Query 3: Top Market Creators

```sql
SELECT
  topic2 AS creator,
  COUNT(*) AS markets_created
FROM ethereum.logs
WHERE contract_address = 0x51430273ca467fd6a961598b5bcd28d6532a8d33
  AND blockchain = 'sepolia'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20
```

---

## Query 4: PRED Token Distribution

```sql
SELECT
  to AS holder,
  SUM(value / 1e18) AS pred_received
FROM erc20_sepolia.evt_transfer
WHERE contract_address = 0x1a5ecdbcbe1931c4e745b82b3c8e09cbc4015c49
GROUP BY 1
ORDER BY 2 DESC
LIMIT 50
```

---

## Query 5: Protocol Fee Revenue

```sql
SELECT
  DATE_TRUNC('week', block_time) AS week,
  SUM(value / 1e18) AS eth_fees
FROM ethereum.traces
WHERE to = 0x72F668Aca488E6d5Aa847f3636aEb0B95413DEF7  -- fee collector
  AND blockchain = 'sepolia'
  AND success = true
GROUP BY 1
ORDER BY 1
```

---

## Query 6: Active Users (Weekly)

```sql
SELECT
  DATE_TRUNC('week', block_time) AS week,
  COUNT(DISTINCT "from") AS unique_traders
FROM ethereum.transactions
WHERE to IN (
  SELECT DISTINCT output_0
  FROM ethereum.logs
  WHERE contract_address = 0x51430273ca467fd6a961598b5bcd28d6532a8d33
  AND blockchain = 'sepolia'
)
AND blockchain = 'sepolia'
GROUP BY 1
ORDER BY 1
```

---

## Contract Addresses (Sepolia)

| Contract | Address |
|---|---|
| MarketFactory | 0x51430273cA467Fd6a961598B5bcD28d6532A8D33 |
| PREDToken | 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49 |
| LiquidityMining | 0xAC8e774dd8218D716F455AB7872E7c0843985981 |
| USDCMarketFactory | 0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D |
| MultiMarketFactory | 0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab |
| ScalarMarketFactory | 0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1 |
