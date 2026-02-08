import type { GameBriefing } from "../../contract/interfaces.js";

/**
 * Static rule briefing for the NumberGuess scenario.
 *
 * Rulebook only — no secret number or strategy.
 * Safe for public artifacts.
 */
export function getNumberGuessBriefing(): GameBriefing {
  return {
    gameId: "numberGuess",
    name: "NumberGuess",
    summary:
      "A hidden number has been chosen within a known range. Each turn, " +
      "submit a guess and receive feedback indicating whether the secret " +
      "number is higher or lower. The first agent to guess correctly wins.",
    winCondition:
      "Be the first agent to guess the secret number exactly. The winner " +
      "receives 100 points; all other agents receive 0.",
    actions: [
      {
        type: "guess",
        description: "Submit a guess for the secret number. Two action formats are accepted.",
        jsonExample: { guess: 50 },
        notes: [
          'Alternative format: { "type": "guess", "value": 50 }',
          "Guess must be an integer within [rangeMin, rangeMax].",
          "Out-of-range or non-integer guesses are marked invalid.",
        ],
      },
    ],
    observationGuide: [
      { field: "rangeMin", description: "The lower bound of the valid guess range (inclusive)." },
      { field: "rangeMax", description: "The upper bound of the valid guess range (inclusive)." },
      {
        field: "lastGuess",
        description: "Your most recent guess, or null if you have not guessed yet.",
      },
      {
        field: "feedback",
        description:
          'Feedback on your last guess: "higher" (secret is higher), ' +
          '"lower" (secret is lower), "correct", "invalid", or null ' +
          "if no guess yet.",
      },
      {
        field: "step",
        description: "Total number of guesses made by all agents combined.",
      },
    ],
    rulesNotes: [
      "Invalid guesses (out of range or non-integer) waste a turn.",
      "Each agent sees only their own feedback, not other agents' guesses.",
      "Actions must be valid JSON matching the schemas above.",
    ],
    version: "1.0.0",
  };
}
