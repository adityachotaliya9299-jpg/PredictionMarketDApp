import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  FactoryPaused,
  FeeCollectorUpdated,
  MarketCreated,
  MarketDeactivated,
  OracleUpdated,
  OwnershipTransferred,
  Paused,
  ProtocolFeeUpdated,
  Unpaused
} from "../generated/MarketFactory/MarketFactory"

export function createFactoryPausedEvent(paused: boolean): FactoryPaused {
  let factoryPausedEvent = changetype<FactoryPaused>(newMockEvent())

  factoryPausedEvent.parameters = new Array()

  factoryPausedEvent.parameters.push(
    new ethereum.EventParam("paused", ethereum.Value.fromBoolean(paused))
  )

  return factoryPausedEvent
}

export function createFeeCollectorUpdatedEvent(
  oldCollector: Address,
  newCollector: Address
): FeeCollectorUpdated {
  let feeCollectorUpdatedEvent = changetype<FeeCollectorUpdated>(newMockEvent())

  feeCollectorUpdatedEvent.parameters = new Array()

  feeCollectorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldCollector",
      ethereum.Value.fromAddress(oldCollector)
    )
  )
  feeCollectorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newCollector",
      ethereum.Value.fromAddress(newCollector)
    )
  )

  return feeCollectorUpdatedEvent
}

export function createMarketCreatedEvent(
  marketId: Bytes,
  market: Address,
  creator: Address,
  question: string,
  expirationTime: BigInt
): MarketCreated {
  let marketCreatedEvent = changetype<MarketCreated>(newMockEvent())

  marketCreatedEvent.parameters = new Array()

  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("marketId", ethereum.Value.fromFixedBytes(marketId))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("market", ethereum.Value.fromAddress(market))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("question", ethereum.Value.fromString(question))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "expirationTime",
      ethereum.Value.fromUnsignedBigInt(expirationTime)
    )
  )

  return marketCreatedEvent
}

export function createMarketDeactivatedEvent(
  marketId: Bytes
): MarketDeactivated {
  let marketDeactivatedEvent = changetype<MarketDeactivated>(newMockEvent())

  marketDeactivatedEvent.parameters = new Array()

  marketDeactivatedEvent.parameters.push(
    new ethereum.EventParam("marketId", ethereum.Value.fromFixedBytes(marketId))
  )

  return marketDeactivatedEvent
}

export function createOracleUpdatedEvent(
  oldOracle: Address,
  newOracle: Address
): OracleUpdated {
  let oracleUpdatedEvent = changetype<OracleUpdated>(newMockEvent())

  oracleUpdatedEvent.parameters = new Array()

  oracleUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldOracle", ethereum.Value.fromAddress(oldOracle))
  )
  oracleUpdatedEvent.parameters.push(
    new ethereum.EventParam("newOracle", ethereum.Value.fromAddress(newOracle))
  )

  return oracleUpdatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createProtocolFeeUpdatedEvent(
  oldFee: BigInt,
  newFee: BigInt
): ProtocolFeeUpdated {
  let protocolFeeUpdatedEvent = changetype<ProtocolFeeUpdated>(newMockEvent())

  protocolFeeUpdatedEvent.parameters = new Array()

  protocolFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldFee", ethereum.Value.fromUnsignedBigInt(oldFee))
  )
  protocolFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return protocolFeeUpdatedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
