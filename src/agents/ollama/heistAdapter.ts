import type { HeistAction, HeistObservation } from "../../scenarios/heist/index.js";
import type { ScenarioAdapter } from "./createOllamaAgent.js";

const systemPrompt = `You are playing the Heist scenario. Each turn you must choose one action.

VALID ACTIONS (respond with exactly one JSON object):
- Move to an adjacent room: {"type":"move","toRoomId":"room-id"}
- Pick up a visible item in the current room: {"type":"pickup","itemId":"item-id"}
- Hack/use a terminal in the current room: {"type":"use_terminal","terminalId":"terminal-id"}
- Extract in the extraction room: {"type":"extract"}
- Wait/do nothing: {"type":"wait"}

RULES:
- Only move to rooms listed as adjacent and passable.
- Only pick up items that are visible in the current room.
- Only use terminals that are visible in the current room.
- Only extract if you are in the extraction room.

Example:
Game state: Turn 1. You are in room-1. Adjacent rooms: room-2 (passable). Visible items: keycard-1.
Response: {"type":"pickup","itemId":"keycard-1"}

Example:
Game state: Turn 3. You are in room-2. Adjacent rooms: room-1 (passable), room-3 (locked, requires keycard-1).
Response: {"type":"move","toRoomId":"room-1"}

Respond with ONLY a JSON object. No explanation, no markdown, no backticks.`;

const fallbackAction: HeistAction = { type: "wait" };

function formatItems(items: HeistObservation["visibleItems"] | undefined): string {
  if (!items || items.length === 0) {
    return "none";
  }
  return items
    .map((item) => {
      if (item.type === "loot") {
        return `${item.id} (loot, value ${item.scoreValue})`;
      }
      if (item.type === "intel") {
        return `${item.id} (intel${item.label ? `: ${item.label}` : ""})`;
      }
      if (item.type === "tool") {
        return `${item.id} (tool: ${item.toolType}${item.uses ? `, uses ${item.uses}` : ""})`;
      }
      return `${item.id} (${item.type})`;
    })
    .join(", ");
}

function formatEntities(entities: HeistObservation["visibleEntities"] | undefined): string {
  if (!entities || entities.length === 0) {
    return "none";
  }
  return entities
    .map((entity) => {
      if (entity.type === "camera") {
        return `${entity.id} (camera${entity.disabled ? ", disabled" : ""})`;
      }
      if (entity.type === "terminal") {
        return `${entity.id} (terminal, hack turns ${entity.hackTurns})`;
      }
      if (entity.type === "vault") {
        return `${entity.id} (vault, requires ${entity.requiredItems.join(", ")})`;
      }
      return `${entity.id} (${entity.type})`;
    })
    .join(", ");
}

function formatAdjacentRooms(rooms: HeistObservation["adjacentRooms"] | undefined): string {
  if (!rooms || rooms.length === 0) {
    return "none";
  }
  return rooms
    .map((room) => {
      const lockInfo = room.locked ? "locked" : "unlocked";
      const passableInfo = room.passable ? "passable" : "blocked";
      const required = room.requiredItem ? `, requires ${room.requiredItem}` : "";
      return `${room.roomId} via ${room.doorId} (${passableInfo}, ${lockInfo}${required})`;
    })
    .join("; ");
}

function formatInventory(inventory: HeistObservation["inventory"] | undefined): string {
  if (!inventory || inventory.length === 0) {
    return "none";
  }
  return inventory.map((item) => `${item.itemId} (${item.type})`).join(", ");
}

export function formatObservation(observation: unknown): string {
  const obs = observation as Partial<HeistObservation>;
  const lines: string[] = [];

  const turn = typeof obs.turn === "number" ? obs.turn : 0;
  lines.push(`Turn ${turn}.`);

  lines.push(`Current room: ${obs.currentRoomId ?? "unknown"}.`);
  lines.push(`Adjacent rooms: ${formatAdjacentRooms(obs.adjacentRooms)}.`);
  lines.push(`Visible items: ${formatItems(obs.visibleItems)}.`);
  lines.push(`Visible entities: ${formatEntities(obs.visibleEntities)}.`);
  lines.push(`Inventory: ${formatInventory(obs.inventory)}.`);

  const privateInfo = obs._private;
  if (privateInfo && typeof privateInfo === "object") {
    const alertLevel =
      typeof privateInfo.alertLevel === "number" ? privateInfo.alertLevel : undefined;
    if (alertLevel !== undefined) {
      lines.push(`Alert level: ${alertLevel}.`);
    }
    if (typeof privateInfo.extractionRoomId === "string") {
      lines.push(`Extraction room: ${privateInfo.extractionRoomId}.`);
    }
    if (privateInfo.terminalProgress && typeof privateInfo.terminalProgress === "object") {
      const terminalEntries = Object.entries(privateInfo.terminalProgress)
        .map(([terminalId, progress]) => `${terminalId}: ${progress}`)
        .join(", ");
      if (terminalEntries) {
        lines.push(`Terminal progress: ${terminalEntries}.`);
      }
    }
    if (privateInfo.terminalHacked && typeof privateInfo.terminalHacked === "object") {
      const hackedEntries = Object.entries(privateInfo.terminalHacked)
        .map(([terminalId, hacked]) => `${terminalId}: ${hacked ? "hacked" : "locked"}`)
        .join(", ");
      if (hackedEntries) {
        lines.push(`Terminal status: ${hackedEntries}.`);
      }
    }
  }

  return lines.join("\n");
}

function tryParseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function extractFirstJsonObject(text: string, startIndex: number): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }
  return null;
}

function unwrapAndNormalize(obj: Record<string, unknown>): HeistAction | null {
  const direct = normalizeAction(obj);
  if (direct) {
    return direct;
  }
  for (const key of ["action", "response", "result"]) {
    const inner = obj[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const result = normalizeAction(inner as Record<string, unknown>);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function normalizeAction(candidate: Record<string, unknown>): HeistAction | null {
  const type = candidate.type;
  if (typeof type !== "string") {
    return null;
  }
  switch (type) {
    case "wait":
      return { type: "wait" };
    case "extract":
      return { type: "extract" };
    case "move": {
      const toRoomId = candidate.toRoomId;
      if (typeof toRoomId !== "string" || toRoomId.length === 0) {
        return null;
      }
      return { type: "move", toRoomId };
    }
    case "pickup": {
      const itemId = candidate.itemId;
      if (typeof itemId !== "string" || itemId.length === 0) {
        return null;
      }
      return { type: "pickup", itemId };
    }
    case "use_terminal": {
      const terminalId = candidate.terminalId;
      if (typeof terminalId !== "string" || terminalId.length === 0) {
        return null;
      }
      return { type: "use_terminal", terminalId };
    }
    default:
      return null;
  }
}

export function parseResponse(text: string): HeistAction | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  // Strategy 1: Direct parse
  const direct = tryParseJson(text.trim());
  if (direct) {
    const result = unwrapAndNormalize(direct);
    if (result) {
      return result;
    }
  }

  // Strategy 2: Markdown fence extraction
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    const parsed = tryParseJson(fenced[1].trim());
    if (parsed) {
      const result = unwrapAndNormalize(parsed);
      if (result) {
        return result;
      }
    }
  }

  // Strategy 3: Brace-matching extraction
  const braceIndex = text.indexOf("{");
  if (braceIndex !== -1) {
    const extracted = extractFirstJsonObject(text, braceIndex);
    if (extracted) {
      const parsed = tryParseJson(extracted);
      if (parsed) {
        const result = unwrapAndNormalize(parsed);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
}

export const heistAdapter: ScenarioAdapter = {
  systemPrompt,
  formatObservation,
  parseResponse,
  fallbackAction,
};
