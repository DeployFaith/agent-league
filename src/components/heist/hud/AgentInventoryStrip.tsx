"use client";

import type { AgentInventoryDisplay } from "./selectors";

const AGENT_COLORS = ["#00e5ff", "#ff3d71", "#ffd740", "#00e676"];

type AgentInventoryStripProps = {
  inventories: AgentInventoryDisplay[];
};

function InventoryCard({
  inventory,
  position,
  colorIndex,
}: {
  inventory: AgentInventoryDisplay;
  position: "left" | "right";
  colorIndex: number;
}) {
  const color = AGENT_COLORS[colorIndex % AGENT_COLORS.length];
  const align = position === "left" ? "items-start" : "items-end";

  return (
    <div
      className={`absolute top-14 z-10 flex flex-col gap-1 rounded-[10px] border px-4 py-3 ${position === "left" ? "left-6" : "right-6"}`}
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
        borderColor: inventory.hasExtracted ? `${color}40` : "rgba(255,255,255,0.04)",
        boxShadow: inventory.hasExtracted ? `0 0 12px ${color}20` : "none",
        minWidth: 140,
      }}
    >
      <div className={`flex w-full flex-col ${align}`}>
        <div
          className="text-[11px] font-semibold"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color,
          }}
        >
          {inventory.agentLabel}
        </div>
        <div
          className="text-[10px] tracking-[1px] text-[#445]"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          SCORE: {inventory.score}
        </div>
      </div>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {inventory.items.length === 0 ? (
          <span
            className="text-[10px] text-[#334]"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            No items
          </span>
        ) : (
          inventory.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1 rounded border border-white/[0.06] bg-white/[0.02] px-2 py-0.5"
              title={`${item.label} (${item.type})`}
            >
              <span className="text-sm">{item.icon}</span>
              <span
                className="text-[10px] text-[#8892a4]"
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                {item.label}
              </span>
            </div>
          ))
        )}
      </div>

      {inventory.hasExtracted && (
        <div
          className="mt-1 text-[10px] font-semibold tracking-[1px]"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: "#00e676",
          }}
        >
          EXTRACTED
        </div>
      )}
    </div>
  );
}

export function AgentInventoryStrip({ inventories }: AgentInventoryStripProps) {
  return (
    <>
      {inventories.map((inv, i) => (
        <InventoryCard
          key={inv.agentId}
          inventory={inv}
          position={i === 0 ? "left" : "right"}
          colorIndex={i}
        />
      ))}
    </>
  );
}
