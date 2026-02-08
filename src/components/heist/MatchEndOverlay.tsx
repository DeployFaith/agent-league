"use client";

import type { HeistSceneState } from "@/arena/heist/types";

type MatchEndOverlayProps = {
  state: HeistSceneState;
  scores: Record<string, number>;
  onRestart: () => void;
};

function reasonLabel(reason?: string): string {
  switch (reason) {
    case "completed":
      return "Completed";
    case "capture":
      return "Agent Captured";
    case "lockdown":
      return "Facility Lockdown";
    case "maxTurns":
      return "Time Expired";
    case "error":
      return "Agent Error";
    default:
      return reason ?? "Match Over";
  }
}

export function MatchEndOverlay({ state, scores, onRestart }: MatchEndOverlayProps) {
  if (state.status !== "ended") {
    return null;
  }

  const agentIds = Object.keys(state.agents);
  const reason = reasonLabel(state.terminationReason);

  return (
    <div className="absolute inset-0 z-30 flex animate-[fadeIn_0.5s_ease] items-center justify-center bg-[rgba(10,14,20,0.85)]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div
          className="text-xs font-semibold uppercase tracking-[3px] text-[#556]"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {reason}
        </div>
        <div
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          MATCH COMPLETE
        </div>

        <div className="flex gap-8">
          {agentIds.map((agentId) => (
            <div key={agentId} className="flex flex-col items-center gap-2">
              <span
                className="text-xs text-[#556]"
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                {agentId}
              </span>
              <span
                className="text-2xl font-bold text-cyan"
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                {scores[agentId] ?? 0}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="mt-4 cursor-pointer rounded-lg border border-cyan/30 bg-cyan/10 px-6 py-2.5 text-sm font-semibold text-cyan transition-all duration-150 hover:bg-cyan/20"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          Watch Again
        </button>
      </div>
    </div>
  );
}
