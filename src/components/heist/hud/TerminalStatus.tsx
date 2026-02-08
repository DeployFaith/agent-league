"use client";

import type { TerminalDisplay } from "./selectors";

type TerminalStatusProps = {
  terminals: TerminalDisplay[];
};

function TerminalRow({ terminal }: { terminal: TerminalDisplay }) {
  const filled = Math.min(terminal.hackProgress, terminal.hackRequired);
  const empty = Math.max(0, terminal.hackRequired - filled);

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className="text-[11px] text-[#556]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {terminal.label}
      </span>
      {terminal.isHacked ? (
        <span
          className="text-[10px] font-semibold tracking-[1px]"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: "#00e676",
          }}
        >
          {"\u2705"} HACKED
        </span>
      ) : (
        <span
          className="text-[11px]"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: filled > 0 ? "#ffd740" : "#334",
          }}
        >
          {"\u2588".repeat(filled)}
          {"\u2591".repeat(empty)} {filled}/{terminal.hackRequired}
        </span>
      )}
    </div>
  );
}

export function TerminalStatus({ terminals }: TerminalStatusProps) {
  if (terminals.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute right-6 top-[130px] z-10 min-w-40 rounded-[10px] border border-white/[0.04] px-4 py-3"
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="mb-2 text-[10px] tracking-[1.5px] text-[#445]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        TERMINALS
      </div>
      <div className="flex flex-col gap-1.5">
        {terminals.map((t) => (
          <TerminalRow key={t.id} terminal={t} />
        ))}
      </div>
    </div>
  );
}
