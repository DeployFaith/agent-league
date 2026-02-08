import type { GameBriefing } from "../../contract/interfaces.js";

/**
 * Static rule briefing for the Heist scenario.
 *
 * Rulebook only — no map layout, item locations, guard routes, or strategy.
 * Safe for public artifacts.
 */
export function getHeistBriefing(): GameBriefing {
  return {
    gameId: "heist",
    name: "Heist",
    summary:
      "Navigate a facility of connected rooms, pick up items, hack terminals, " +
      "secure objectives, and extract before time runs out or the alert level " +
      "becomes too high.",
    winCondition:
      "Collect all required objective items and reach the extraction room to " +
      "call extract. Higher scores come from faster extraction, collecting " +
      "loot, and keeping the alert level low.",
    actions: [
      {
        type: "move",
        description: "Move to an adjacent room through a connecting door.",
        jsonExample: { type: "move", toRoomId: "room-2" },
        notes: [
          "The target room must be adjacent (connected by a door).",
          "Locked doors require the specified item in your inventory.",
        ],
      },
      {
        type: "pickup",
        description: "Pick up an item in your current room.",
        jsonExample: { type: "pickup", itemId: "keycard-1" },
        notes: ["The item must be present in your current room."],
      },
      {
        type: "use_terminal",
        description:
          "Hack a terminal in your current room. Terminals require multiple " +
          "turns of hacking; progress is preserved if you leave and return.",
        jsonExample: { type: "use_terminal", terminalId: "terminal-1" },
        notes: [
          "The terminal must be in your current room.",
          "Completing a hack may grant intel items.",
        ],
      },
      {
        type: "extract",
        description: "Extract from the facility. You must be in the extraction room.",
        jsonExample: { type: "extract" },
        notes: ["You can only extract from the designated extraction room."],
      },
      {
        type: "wait",
        description: "Do nothing this turn.",
        jsonExample: { type: "wait" },
      },
    ],
    observationGuide: [
      { field: "currentRoomId", description: "The ID of the room you are currently in." },
      {
        field: "adjacentRooms",
        description:
          "Array of rooms reachable from your current room, each with doorId, " +
          "locked status, requiredItem (if any), and passable flag.",
      },
      {
        field: "visibleItems",
        description: "Items present in your current room that can be picked up.",
      },
      {
        field: "visibleEntities",
        description: "Non-guard entities (terminals, vaults, cameras) in your current room.",
      },
      {
        field: "inventory",
        description: "Items you are carrying, each with itemId and type.",
      },
      { field: "turn", description: "The current game turn number." },
    ],
    rulesNotes: [
      "Invalid actions waste a turn and increase the alert level.",
      "You can only see items and entities in your current room.",
      "Guards are never shown in observations — plan around uncertainty.",
      "Actions must be valid JSON matching the schemas above.",
    ],
    version: "1.0.0",
  };
}
