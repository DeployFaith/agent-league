import type { HeistSceneState } from "@/arena/heist/types";

// ---- Inventory ----

export interface AgentInventoryDisplay {
  agentId: string;
  agentLabel: string;
  items: {
    id: string;
    type: string;
    label: string;
    icon: string;
  }[];
  hasExtracted: boolean;
  score: number;
}

// ---- Objective Chain ----

export type ObjectiveStep = "keycard" | "terminal" | "vault" | "loot" | "extract";

export interface ObjectiveChainDisplay {
  steps: ObjectiveStep[];
  agentProgress: Record<string, Set<ObjectiveStep>>;
}

// ---- Alert ----

export interface AlertDisplay {
  level: number;
  maxLevel: number;
  label: string;
  color: string;
}

// ---- Terminals ----

export interface TerminalDisplay {
  id: string;
  label: string;
  hackProgress: number;
  hackRequired: number;
  isHacked: boolean;
  hackedByAgent?: string;
}

// ---- Doors ----

export interface DoorDisplay {
  id: string;
  label: string;
  roomA: string;
  roomB: string;
  isLocked: boolean;
}

// ---- Icon mapping ----

const ITEM_ICONS: Record<string, string> = {
  keycard: "\u{1F511}",
  tool: "\u{1F527}",
  loot: "\u{1F4B0}",
  intel: "\u{1F4C4}",
  objective: "\u2B50",
};

function itemIcon(kind: string): string {
  return ITEM_ICONS[kind] ?? "\u{1F4E6}";
}

// ---- Selector Functions ----

export function selectAgentInventory(
  state: HeistSceneState,
  scores: Record<string, number>,
): AgentInventoryDisplay[] {
  const agentIds = Object.keys(state.agents);
  const extractionRoomId = state.scenarioParams?.extractionRoomId;
  const requiredObjectives = state.scenarioParams?.requiredObjectives ?? [];

  return agentIds.map((agentId) => {
    const agent = state.agents[agentId];
    const heldItems = Object.values(state.items).filter((item) => item.heldBy === agentId);

    const hasAllObjectives =
      requiredObjectives.length > 0 &&
      requiredObjectives.every((objId) => heldItems.some((item) => item.itemId === objId));

    const hasExtracted =
      hasAllObjectives && !!extractionRoomId && agent.roomId === extractionRoomId;

    return {
      agentId,
      agentLabel: agentId,
      items: heldItems.map((item) => ({
        id: item.itemId,
        type: item.kind,
        label: item.label ?? item.itemId,
        icon: itemIcon(item.kind),
      })),
      hasExtracted,
      score: scores[agentId] ?? 0,
    };
  });
}

export function selectObjectiveChain(state: HeistSceneState): ObjectiveChainDisplay {
  const steps: ObjectiveStep[] = ["keycard", "terminal", "vault", "loot", "extract"];
  const agentIds = Object.keys(state.agents);
  const extractionRoomId = state.scenarioParams?.extractionRoomId;
  const requiredObjectives = state.scenarioParams?.requiredObjectives ?? [];

  const vaultOpened = Object.values(state.entities).some(
    (e) => e.kind === "vault" && e.state?.opened === true,
  );

  const agentProgress: Record<string, Set<ObjectiveStep>> = {};

  for (const agentId of agentIds) {
    const agent = state.agents[agentId];
    const heldItems = Object.values(state.items).filter((item) => item.heldBy === agentId);
    const progress = new Set<ObjectiveStep>();

    if (heldItems.some((item) => item.kind === "keycard")) {
      progress.add("keycard");
    }

    if (heldItems.some((item) => item.kind === "intel")) {
      progress.add("terminal");
    }

    if (vaultOpened) {
      progress.add("vault");
    }

    const hasAllObjectives =
      requiredObjectives.length > 0 &&
      requiredObjectives.every((objId) => heldItems.some((item) => item.itemId === objId));

    if (hasAllObjectives) {
      progress.add("loot");
    }

    if (hasAllObjectives && !!extractionRoomId && agent.roomId === extractionRoomId) {
      progress.add("extract");
    }

    agentProgress[agentId] = progress;
  }

  return { steps, agentProgress };
}

const ALERT_LEVELS: { label: string; color: string }[] = [
  { label: "CLEAR", color: "#22c55e" },
  { label: "CAUTION", color: "#eab308" },
  { label: "ALERT", color: "#f97316" },
  { label: "LOCKDOWN", color: "#ef4444" },
];

export function selectAlertLevel(state: HeistSceneState): AlertDisplay {
  const level = Math.min(Math.max(state.sceneFacts?.alertLevel ?? 0, 0), 3);
  const maxLevel = state.scenarioParams?.maxAlertLevel ?? 3;
  const info = ALERT_LEVELS[level] ?? ALERT_LEVELS[0];
  return { level, maxLevel, label: info.label, color: info.color };
}

export function selectTerminals(state: HeistSceneState): TerminalDisplay[] {
  return Object.values(state.entities)
    .filter((e) => e.kind === "terminal")
    .map((entity) => {
      const hackProgress =
        typeof entity.state?.progress === "number" ? (entity.state.progress as number) : 0;
      const hackRequired =
        typeof entity.state?.hackTurns === "number" ? (entity.state.hackTurns as number) : 2;
      const isHacked = entity.state?.hacked === true || hackProgress >= hackRequired;

      return {
        id: entity.entityId,
        label: entity.label ?? entity.entityId,
        hackProgress,
        hackRequired,
        isHacked,
      };
    });
}

export function selectDoors(state: HeistSceneState): DoorDisplay[] {
  return Object.values(state.map.doors).map((door) => {
    const roomALabel = state.map.rooms[door.from]?.label ?? door.from;
    const roomBLabel = state.map.rooms[door.to]?.label ?? door.to;

    return {
      id: door.doorId,
      label: `${roomALabel} \u2194 ${roomBLabel}`,
      roomA: door.from,
      roomB: door.to,
      isLocked: door.isLocked ?? false,
    };
  });
}
