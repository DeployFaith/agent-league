"use client";

import type { HeistSceneState } from "@/arena/heist/types";

function formatAction(action?: { type: string; [key: string]: unknown }): string {
  if (!action) {
    return "waiting...";
  }
  const actionType = action.type || "unknown";

  // Try to extract a human-readable target
  const target =
    (typeof action.target === "string" && action.target) ||
    (typeof action.roomId === "string" && action.roomId) ||
    (typeof action.itemId === "string" && action.itemId) ||
    (typeof action.entityId === "string" && action.entityId) ||
    (typeof action.direction === "string" && action.direction) ||
    "";

  if (target) {
    return `${actionType} \u2192 ${target}`;
  }
  return actionType;
}

type ActionFeedProps = {
  state: HeistSceneState;
  turn: number;
};

export function ActionFeed({ state, turn }: ActionFeedProps) {
  const agents = Object.values(state.agents);
  const primaryAgent = agents[0];
  const actionText = formatAction(primaryAgent?.lastAction);

  return (
    <div
      className="absolute bottom-6 left-1/2 z-[15] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-white/[0.06] px-5 py-2"
      style={{
        background: "rgba(10,14,20,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        className="text-[11px] font-semibold text-[#445]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        T{turn}
      </span>
      <span className="h-4 w-px bg-white/[0.08]" />
      <span
        className="text-[13px] text-[#8892a4]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {actionText}
      </span>
    </div>
  );
}
