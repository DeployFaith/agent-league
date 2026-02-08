"use client";

import type { DoorDisplay } from "./selectors";

type DoorStatusProps = {
  doors: DoorDisplay[];
};

export function DoorStatus({ doors }: DoorStatusProps) {
  const lockedDoors = doors.filter((d) => d.isLocked);
  if (lockedDoors.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute right-6 z-10 min-w-40 rounded-[10px] border border-white/[0.04] px-4 py-3"
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
        top: 210,
      }}
    >
      <div
        className="mb-2 text-[10px] tracking-[1.5px] text-[#445]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        LOCKED DOORS
      </div>
      <div className="flex flex-col gap-1">
        {lockedDoors.map((door) => (
          <div
            key={door.id}
            className="flex items-center gap-2 text-[11px]"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            <span className="text-xs">{"\u{1F512}"}</span>
            <span className="text-[#556]">{door.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
