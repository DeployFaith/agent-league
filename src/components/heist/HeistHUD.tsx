"use client";

import type { HeistSceneState } from "@/arena/heist/types";

const ALERT_COLORS = ["#00e676", "#ffd740", "#ff9100", "#ff3d71"];
const ALERT_LABELS = ["ALL CLEAR", "SUSPICIOUS", "ALERT", "LOCKDOWN"];

function AlertMeter({ level }: { level: number }) {
  const clamped = Math.min(Math.max(level, 0), 3);
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 w-8 rounded-sm transition-all duration-400"
            style={{
              background: i <= clamped ? ALERT_COLORS[clamped] : "rgba(255,255,255,0.06)",
              boxShadow: i <= clamped ? `0 0 8px ${ALERT_COLORS[clamped]}40` : "none",
            }}
          />
        ))}
      </div>
      <span
        className="text-[11px] font-semibold tracking-[1.5px] transition-colors duration-400"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: ALERT_COLORS[clamped],
        }}
      >
        {ALERT_LABELS[clamped]}
      </span>
    </div>
  );
}

type HeistHUDProps = {
  state: HeistSceneState;
  turn: number;
  maxTurns: number;
};

export function HeistHUD({ state, turn, maxTurns }: HeistHUDProps) {
  const agentIds = Object.keys(state.agents);
  const agentName = agentIds[0] ?? "Agent";
  const alertLevel = state.sceneFacts?.alertLevel ?? 0;

  return (
    <div
      className="flex shrink-0 items-center justify-between border-b border-white/[0.04] px-6 py-4"
      style={{
        background: "rgba(10,14,20,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}
    >
      {/* Left: match info */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-base text-cyan">&#x27D0;</span>
          <span className="text-[13px] font-semibold text-foreground">HashMatch</span>
        </div>
        <div className="h-5 w-px bg-white/[0.06]" />
        <span
          className="rounded bg-[rgba(255,171,64,0.1)] px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[2px] text-[#ffab40]"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {state.scenarioName || "HEIST"}
        </span>
        <span
          className="text-[11px] text-[#445]"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {state.matchId}
        </span>
      </div>

      {/* Center: agents VS */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div
            className="text-[15px] font-bold text-cyan"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            {agentName}
          </div>
          <div
            className="text-[10px] text-[#445]"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            Agent
          </div>
        </div>
        <div
          className="rounded border border-[#1a1e26] bg-white/[0.02] px-3 py-1 text-[11px] font-bold text-[#334]"
          style={{ fontFamily: "monospace" }}
        >
          VS
        </div>
        <div className="text-left">
          <div
            className="text-[15px] font-bold text-[#ff3d71]"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            Environment
          </div>
          <div
            className="text-[10px] text-[#445]"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            Guards + Cameras
          </div>
        </div>
      </div>

      {/* Right: alert + turn counter */}
      <div className="flex items-center gap-6">
        <AlertMeter level={alertLevel} />
        <div
          className="text-right"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          <div className="text-[22px] font-bold text-foreground">
            T{turn}
            <span className="text-[13px] text-[#334]">/{maxTurns || "?"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
