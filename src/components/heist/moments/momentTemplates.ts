import type { ActionAdjudicatedEvent } from "@/contract/types";
import type { HeistSceneState } from "@/arena/heist/types";

// ---- Types ----

export interface HeistMomentCard {
  id: string;
  turn: number;
  seq: number;
  agentId: string;
  severity: "info" | "warning" | "error" | "success";
  icon: string;
  title: string;
  detail: string;
  category: string;
}

export interface CollapsedMomentCard extends HeistMomentCard {
  count: number;
  collapsedSeqs: number[];
}

// ---- Context ----

interface AdjudicationContext {
  agentId: string;
  turn: number;
  seq: number;
  valid: boolean;
  errorCode?: string;
  resultCode?: string;
  message?: string;
  currentRoom?: string;
  targetRoom?: string;
  targetLabel?: string;
  doorLabel?: string;
  requiredKeycard?: string;
  requiredItem?: string;
  missingItems?: string[];
  missingObjectives?: string[];
  hackProgress?: number;
  hackRequired?: number;
  terminalLabel?: string;
  guardLabel?: string;
  newAlertLevel?: number;
  itemLabel?: string;
  itemType?: string;
  turnsRemaining?: number;
  extractionRoom?: string;
}

// ---- Helpers ----

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

// ---- Error Templates ----

type TemplateFn = (ctx: AdjudicationContext) => Partial<HeistMomentCard>;

const ERROR_TEMPLATES: Record<string, TemplateFn> = {
  no_door_between_rooms: (ctx) => ({
    severity: "error",
    icon: "\u{1F6AB}",
    title: "Illegal move",
    detail: `No door between ${ctx.currentRoom ?? "?"} and ${ctx.targetRoom ?? "?"}`,
    category: "navigation",
  }),

  door_locked: (ctx) => ({
    severity: "warning",
    icon: "\u{1F512}",
    title: "Door locked",
    detail: `${ctx.doorLabel ?? "Door"} requires ${ctx.requiredKeycard ?? "a keycard"}`,
    category: "navigation",
  }),

  entity_not_in_room: (ctx) => ({
    severity: "error",
    icon: "\u{1F47B}",
    title: "Nothing there",
    detail: `${ctx.targetLabel ?? "Target"} is not in ${ctx.currentRoom ?? "room"}`,
    category: "interaction",
  }),

  missing_required_item: (ctx) => ({
    severity: "warning",
    icon: "\u{1F6B7}",
    title: "Missing item",
    detail: `Can't interact with ${ctx.targetLabel ?? "target"} \u2014 need ${ctx.requiredItem ?? "item"}`,
    category: "interaction",
  }),

  vault_locked: (ctx) => ({
    severity: "warning",
    icon: "\u{1F510}",
    title: "Vault sealed",
    detail: `Missing required items: ${ctx.missingItems?.join(", ") ?? "unknown"}`,
    category: "objective",
  }),

  not_in_extraction_room: (ctx) => ({
    severity: "error",
    icon: "\u{1F4CD}",
    title: "Wrong room for extraction",
    detail: `Tried to extract from ${ctx.currentRoom ?? "?"} \u2014 need ${ctx.extractionRoom ?? "extraction room"}`,
    category: "extraction",
  }),

  extraction_missing_objectives: (ctx) => ({
    severity: "warning",
    icon: "\u{1F4E6}",
    title: "Can't extract yet",
    detail: `Missing objectives: ${ctx.missingObjectives?.join(", ") ?? "unknown"}`,
    category: "extraction",
  }),

  hack_interrupted: (ctx) => ({
    severity: "info",
    icon: "\u23F8\uFE0F",
    title: "Hack interrupted",
    detail: `Left terminal with ${ctx.hackProgress ?? 0}/${ctx.hackRequired ?? "?"} progress`,
    category: "hacking",
  }),

  detected_by_guard: (ctx) => ({
    severity: "error",
    icon: "\u{1F441}\uFE0F",
    title: "Spotted!",
    detail: `${ctx.guardLabel ?? "Guard"} detected agent in ${ctx.currentRoom ?? "room"}`,
    category: "stealth",
  }),

  alert_escalation: (ctx) => ({
    severity: "warning",
    icon: "\u{1F6A8}",
    title: `Alert \u2192 Level ${ctx.newAlertLevel ?? "?"}`,
    detail: "Noise threshold crossed",
    category: "stealth",
  }),
};

// ---- Success Templates ----

const SUCCESS_TEMPLATES: Record<string, TemplateFn> = {
  hack_complete: (ctx) => ({
    severity: "success",
    icon: "\u{1F4BB}",
    title: "Terminal hacked!",
    detail: `${ctx.terminalLabel ?? "Terminal"} cracked \u2014 intel acquired`,
    category: "hacking",
  }),

  hack_progress: (ctx) => ({
    severity: "info",
    icon: "\u{1F4BB}",
    title: "Hacking...",
    detail: `${ctx.terminalLabel ?? "Terminal"} progress: ${ctx.hackProgress ?? "?"}/${ctx.hackRequired ?? "?"}`,
    category: "hacking",
  }),

  vault_opened: () => ({
    severity: "success",
    icon: "\u{1F513}",
    title: "Vault cracked!",
    detail: "Objective secured",
    category: "objective",
  }),

  item_pickup: (ctx) => ({
    severity: "info",
    icon: "\u{1F392}",
    title: `Picked up ${ctx.itemLabel ?? "item"}`,
    detail: `${ctx.itemType ?? "Item"} added to inventory`,
    category: "inventory",
  }),

  extraction_success: (ctx) => ({
    severity: "success",
    icon: "\u{1F681}",
    title: "Extracted!",
    detail: `Mission complete with ${ctx.turnsRemaining ?? 0} turns to spare`,
    category: "extraction",
  }),
};

// ---- Context Builder ----

function buildContext(
  event: ActionAdjudicatedEvent,
  sceneState: HeistSceneState,
): AdjudicationContext {
  const feedback = isRecord(event.feedback) ? event.feedback : undefined;
  const chosenAction = isRecord(event.chosenAction) ? event.chosenAction : undefined;
  const agent = sceneState.agents[event.agentId];

  const ctx: AdjudicationContext = {
    agentId: event.agentId,
    turn: event.turn,
    seq: event.seq,
    valid: event.valid,
    errorCode: asString(feedback?.error),
    resultCode: asString(feedback?.result),
    message: asString(feedback?.message),
    currentRoom: agent?.roomId,
    extractionRoom: sceneState.scenarioParams?.extractionRoomId,
  };

  // Enrich from chosen action
  if (chosenAction) {
    ctx.targetRoom = asString(chosenAction.toRoomId);
    ctx.targetLabel =
      asString(chosenAction.itemId) ??
      asString(chosenAction.terminalId) ??
      asString(chosenAction.target);

    const itemId = asString(chosenAction.itemId);
    if (itemId && sceneState.items[itemId]) {
      const item = sceneState.items[itemId];
      ctx.itemLabel = item.label ?? item.itemId;
      ctx.itemType = item.kind;
    }

    const terminalId = asString(chosenAction.terminalId);
    if (terminalId && sceneState.entities[terminalId]) {
      const terminal = sceneState.entities[terminalId];
      ctx.terminalLabel = terminal.label ?? terminal.entityId;
      ctx.hackProgress = asNumber(terminal.state?.progress);
      ctx.hackRequired = asNumber(terminal.state?.hackTurns);
    }
  }

  // Enrich from feedback
  if (feedback) {
    ctx.requiredKeycard = asString(feedback.requiredItem);
    ctx.requiredItem = asString(feedback.requiredItem);
    ctx.newAlertLevel = asNumber(feedback.alertLevel);
    ctx.guardLabel = asString(feedback.guardId);
    ctx.doorLabel = asString(feedback.doorId);
    ctx.hackProgress = asNumber(feedback.progress) ?? ctx.hackProgress;
    ctx.hackRequired = asNumber(feedback.required) ?? ctx.hackRequired;
    ctx.turnsRemaining = asNumber(feedback.turnsRemaining);

    if (Array.isArray(feedback.missingItems)) {
      ctx.missingItems = feedback.missingItems.filter((v): v is string => typeof v === "string");
    }
    if (Array.isArray(feedback.missingObjectives)) {
      ctx.missingObjectives = feedback.missingObjectives.filter(
        (v): v is string => typeof v === "string",
      );
    }
  }

  return ctx;
}

// ---- Template Resolution ----

export function adjudicationToMomentCard(
  event: ActionAdjudicatedEvent,
  sceneState: HeistSceneState,
): HeistMomentCard | null {
  const ctx = buildContext(event, sceneState);

  // 1. Invalid action -> look up error template
  if (!event.valid) {
    const errorCode = ctx.errorCode;
    if (errorCode) {
      const template = ERROR_TEMPLATES[errorCode];
      if (template) {
        return {
          id: `moment-${event.seq}`,
          turn: event.turn,
          seq: event.seq,
          agentId: event.agentId,
          ...template(ctx),
        } as HeistMomentCard;
      }
    }
    // Fallback for unknown error codes
    return {
      id: `moment-${event.seq}`,
      turn: event.turn,
      seq: event.seq,
      agentId: event.agentId,
      severity: "error",
      icon: "\u274C",
      title: "Invalid action",
      detail: ctx.message ?? "Action rejected",
      category: "unknown",
    };
  }

  // 2. Valid action with notable result -> look up success template
  if (ctx.resultCode) {
    const template = SUCCESS_TEMPLATES[ctx.resultCode];
    if (template) {
      return {
        id: `moment-${event.seq}`,
        turn: event.turn,
        seq: event.seq,
        agentId: event.agentId,
        ...template(ctx),
      } as HeistMomentCard;
    }
  }

  // 3. Valid, unremarkable action -> no moment card
  return null;
}

// ---- Collapse Rule ----

export function collapseMomentCards(cards: HeistMomentCard[]): CollapsedMomentCard[] {
  if (cards.length === 0) {
    return [];
  }

  const result: CollapsedMomentCard[] = [];
  let current: CollapsedMomentCard = {
    ...cards[0],
    count: 1,
    collapsedSeqs: [cards[0].seq],
  };

  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    if (
      card.agentId === current.agentId &&
      card.title === current.title &&
      card.category === current.category
    ) {
      current.count += 1;
      current.collapsedSeqs.push(card.seq);
    } else {
      result.push(current);
      current = { ...card, count: 1, collapsedSeqs: [card.seq] };
    }
  }
  result.push(current);

  return result;
}
