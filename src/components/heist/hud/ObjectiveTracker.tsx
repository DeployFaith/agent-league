"use client";

import type { ObjectiveChainDisplay, ObjectiveStep } from "./selectors";

const STEP_CONFIG: Record<ObjectiveStep, { icon: string; label: string }> = {
  keycard: { icon: "\u{1F511}", label: "Key" },
  terminal: { icon: "\u{1F4BB}", label: "Hack" },
  vault: { icon: "\u{1F513}", label: "Vault" },
  loot: { icon: "\u{1F4B0}", label: "Loot" },
  extract: { icon: "\u{1F681}", label: "Exit" },
};

const AGENT_COLORS = ["#00e5ff", "#ff3d71", "#ffd740", "#00e676"];

type ObjectiveTrackerProps = {
  chain: ObjectiveChainDisplay;
};

export function ObjectiveTracker({ chain }: ObjectiveTrackerProps) {
  const agentIds = Object.keys(chain.agentProgress);

  return (
    <div
      className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-[10px] border border-white/[0.04] px-4 py-2.5"
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      {chain.steps.map((step, i) => {
        const config = STEP_CONFIG[step];
        const anyComplete = agentIds.some((id) => chain.agentProgress[id]?.has(step));

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md transition-all duration-300"
                style={{
                  background: anyComplete ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${anyComplete ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
                  opacity: anyComplete ? 1 : 0.4,
                }}
              >
                <span className="text-sm">{config.icon}</span>
              </div>
              <span
                className="text-[9px] tracking-[0.5px]"
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  color: anyComplete ? "#8892a4" : "#334",
                }}
              >
                {config.label}
              </span>
              <div className="flex gap-1">
                {agentIds.map((agentId, agentIdx) => (
                  <div
                    key={agentId}
                    className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: chain.agentProgress[agentId]?.has(step)
                        ? AGENT_COLORS[agentIdx % AGENT_COLORS.length]
                        : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
            </div>
            {i < chain.steps.length - 1 && (
              <div className="mx-1 h-px w-4" style={{ background: "rgba(255,255,255,0.08)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
