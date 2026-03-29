import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { FactoryPaused } from "../generated/schema"
import { FactoryPaused as FactoryPausedEvent } from "../generated/MarketFactory/MarketFactory"
import { handleFactoryPaused } from "../src/market-factory"
import { createFactoryPausedEvent } from "./market-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let paused = "boolean Not implemented"
    let newFactoryPausedEvent = createFactoryPausedEvent(paused)
    handleFactoryPaused(newFactoryPausedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("FactoryPaused created and stored", () => {
    assert.entityCount("FactoryPaused", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FactoryPaused",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "paused",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
