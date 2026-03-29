import { BigInt, Address } from "@graphprotocol/graph-ts"
import { MarketCreated } from "../generated/MarketFactory/MarketFactory"
import { MarketFactory } from "../generated/MarketFactory/MarketFactory"
import { SharesPurchased, MarketResolved } from "../generated/templates/PredictionMarket/PredictionMarket"
import { Market, Trade } from "../generated/schema"
import { PredictionMarket } from "../generated/templates"

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

  // Read category from the factory using the marketId
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
