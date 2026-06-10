import { BigInt, Address } from "@graphprotocol/graph-ts"
import { MarketCreated } from "../generated/MarketFactory/MarketFactory"
import { MarketFactory } from "../generated/MarketFactory/MarketFactory"
import { SharesPurchased, MarketResolved } from "../generated/templates/PredictionMarket/PredictionMarket"
import { SharesPurchased as MultiSharesPurchased, MarketResolved as MultiMarketResolved } from "../generated/templates/MultiOutcomeMarket/MultiOutcomeMarket"
import { MultiMarketCreated } from "../generated/MultiMarketFactory/MultiMarketFactory"
import { Market, Trade, MultiMarket, MultiTrade } from "../generated/schema"
import { PredictionMarket, MultiOutcomeMarket } from "../generated/templates"

// ─── YES/NO Market Handlers ───────────────────────────────────────────────────

export function handleMarketCreated(event: MarketCreated): void {
  let market = new Market(event.params.market.toHex())
  market.address = event.params.market.toHex()
  market.creator = event.params.creator.toHex()
  market.question = event.params.question
  market.endTime = event.params.expirationTime
  market.resolved = false
  market.yesPool = BigInt.fromI32(0)
  market.noPool = BigInt.fromI32(0)
  market.createdAt = event.block.timestamp

  let factoryContract = MarketFactory.bind(event.address)
  let marketDataResult = factoryContract.try_getMarket(event.params.marketId)
  if (!marketDataResult.reverted) {
    market.category = marketDataResult.value.category
  } else {
    market.category = "General"
  }

  market.save()
  PredictionMarket.create(event.params.market)
}

export function handleSharesPurchased(event: SharesPurchased): void {
  let marketId = event.address.toHex()
  let market = Market.load(marketId)
  if (!market) return
  if (event.params.isYes) {
    market.yesPool = market.yesPool.plus(event.params.amount)
  } else {
    market.noPool = market.noPool.plus(event.params.amount)
  }
  market.save()

  let tradeId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let trade = new Trade(tradeId)
  trade.market = marketId
  trade.trader = event.params.buyer.toHex()
  trade.isYes = event.params.isYes
  trade.shares = event.params.shares
  trade.cost = event.params.amount
  trade.timestamp = event.block.timestamp
  trade.save()
}

export function handleMarketResolved(event: MarketResolved): void {
  let market = Market.load(event.address.toHex())
  if (!market) return
  market.resolved = true
  market.outcome = event.params.outcome == 1
  market.save()
}

// ─── Multi-Outcome Market Handlers ────────────────────────────────────────────

export function handleMultiMarketCreated(event: MultiMarketCreated): void {
  let market = new MultiMarket(event.params.market.toHex())
  market.address = event.params.market.toHex()
  market.creator = event.params.creator.toHex()
  market.question = event.params.question
  market.outcomes = event.params.outcomes
  market.endTime = event.params.expirationTime
  market.resolved = false
  market.winningOutcome = 0
  market.totalPool = BigInt.fromI32(0)

  let pools: BigInt[] = []
  for (let i = 0; i < event.params.outcomes.length; i++) {
    pools.push(BigInt.fromI32(0))
  }
  market.outcomePools = pools
  market.createdAt = event.block.timestamp
  market.save()

  MultiOutcomeMarket.create(event.params.market)
}

export function handleMultiSharesPurchased(event: MultiSharesPurchased): void {
  let marketId = event.address.toHex()
  let market = MultiMarket.load(marketId)
  if (!market) return

  market.totalPool = market.totalPool.plus(event.params.shares)

  let pools = market.outcomePools
  let idx = event.params.outcomeIndex as i32
  if (idx < pools.length) {
    pools[idx] = pools[idx].plus(event.params.shares)
    market.outcomePools = pools
  }
  market.save()

  let tradeId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let trade = new MultiTrade(tradeId)
  trade.market = marketId
  trade.trader = event.params.buyer.toHex()
  trade.outcomeIndex = event.params.outcomeIndex as i32
  let outcomes = market.outcomes
  trade.outcomeName = idx < outcomes.length ? outcomes[idx] : "Unknown"
  trade.shares = event.params.shares
  trade.cost = event.params.amount
  trade.timestamp = event.block.timestamp
  trade.save()
}

export function handleMultiMarketResolved(event: MultiMarketResolved): void {
  let market = MultiMarket.load(event.address.toHex())
  if (!market) return
  market.resolved = true
  market.winningOutcome = event.params.outcome as i32
  market.save()
}
