"use client";

import type { HeistSceneState } from "@/arena/heist/types";

type StatusPanelProps = {
  state: HeistSceneState;
};

export function StatusPanel({ state }: StatusPanelProps) {
  const agents = Object.values(state.agents);
  const primaryAgent = agents[0];
  const currentRoomId = primaryAgent?.roomId;
  const currentRoom = currentRoomId ? state.map.rooms[currentRoomId] : undefined;
  const roomLabel = currentRoom?.label ?? currentRoomId ?? "Unknown";
  const alertLevel = state.sceneFacts?.alertLevel ?? 0;

  // Use alert level as a proxy for "noise" since the engine doesn't expose noise directly
  const barLength = 8;
  const filled = Math.min(alertLevel * 2 + 1, barLength);
  const barColor = alertLevel >= 3 ? "#ff3d71" : alertLevel >= 2 ? "#ffd740" : "#00e676";

  return (
    <div
      className="absolute right-6 top-5 z-10 min-w-40 rounded-[10px] border border-white/[0.04] px-5 py-3.5"
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="mb-2 text-[10px] tracking-[1.5px] text-[#445]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        STATUS
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className="flex justify-between text-xs"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          <span className="text-[#556]">Location</span>
          <span className="text-foreground">{roomLabel}</span>
        </div>
        <div
          className="flex justify-between text-xs"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          <span className="text-[#556]">Alert</span>
          <span style={{ color: barColor }}>
            {"\u2588".repeat(filled)}
            {"\u2591".repeat(Math.max(0, barLength - filled))}
          </span>
        </div>
      </div>
    </div>
  );
}
