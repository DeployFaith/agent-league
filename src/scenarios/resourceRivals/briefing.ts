import type { GameBriefing } from "../../contract/interfaces.js";

/**
 * Static rule briefing for the ResourceRivals scenario.
 *
 * Rulebook only — no objective values, resource pools, or strategy.
 * Safe for public artifacts.
 */
export function getResourceRivalsBriefing(): GameBriefing {
  return {
    gameId: "resourceRivals",
    name: "ResourceRivals",
    summary:
      "A sealed-bid auction game. Each round, an objective with a point value " +
      "is revealed. Both players simultaneously bid from a limited resource " +
      "pool. The highest bidder captures the objective's points; ties mean " +
      "nobody wins but resources are still spent.",
    winCondition:
      "Have the highest captured score after all objectives have been " +
      "contested. Manage your limited resources across multiple rounds.",
    actions: [
      {
        type: "bid",
        description: "Place a bid for the current objective. Two action formats are accepted.",
        jsonExample: { bid: 20 },
        notes: [
          'Alternative format: { "type": "bid", "amount": 20 }',
          "Bid must be a non-negative integer no greater than your remaining resources.",
          "Invalid bids are treated as a bid of 0.",
        ],
      },
    ],
    observationGuide: [
      {
        field: "objectiveValue",
        description: "The point value of the current objective being contested.",
      },
      { field: "capturedScore", description: "Your total captured score so far." },
      {
        field: "objectivesRemaining",
        description: "Number of objectives left including this one.",
      },
      {
        field: "opponentCapturedScore",
        description: "Your opponent's total captured score so far.",
      },
      {
        field: "lastResult",
        description:
          "Result of the previous round: objectiveValue, myBid, opponentBid, " +
          "and winner. Null on the first round.",
      },
      {
        field: "_private.remainingResources",
        description: "Your remaining resource pool (hidden from spectators).",
      },
    ],
    rulesNotes: [
      "Bids are simultaneous — you do not see your opponent's bid until the round resolves.",
      "Tied bids mean neither player captures the objective, but both still spend resources.",
      "Invalid bids (non-integer, negative, or exceeding remaining resources) default to 0.",
      "Actions must be valid JSON matching the schemas above.",
    ],
    version: "1.0.0",
  };
}
