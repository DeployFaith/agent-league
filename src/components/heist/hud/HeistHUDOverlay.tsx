"use client";

import type { HeistSceneState } from "@/arena/heist/types";
import {
  selectAgentInventory,
  selectObjectiveChain,
  selectAlertLevel,
  selectTerminals,
  selectDoors,
} from "./selectors";
import { AgentInventoryStrip } from "./AgentInventoryStrip";
import { ObjectiveTracker } from "./ObjectiveTracker";
import { AlertMeter } from "./AlertMeter";
import { TerminalStatus } from "./TerminalStatus";
import { DoorStatus } from "./DoorStatus";

type HeistHUDOverlayProps = {
  state: HeistSceneState;
  scores: Record<string, number>;
};

export function HeistHUDOverlay({ state, scores }: HeistHUDOverlayProps) {
  const inventories = selectAgentInventory(state, scores);
  const chain = selectObjectiveChain(state);
  const alert = selectAlertLevel(state);
  const terminals = selectTerminals(state);
  const doors = selectDoors(state);

  return (
    <>
      <AgentInventoryStrip inventories={inventories} />
      <ObjectiveTracker chain={chain} />
      <AlertMeter alert={alert} />
      <TerminalStatus terminals={terminals} />
      <DoorStatus doors={doors} />
    </>
  );
}
