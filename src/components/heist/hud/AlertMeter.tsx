"use client";

import { useRef, useEffect, useState } from "react";
import type { AlertDisplay } from "./selectors";

type AlertMeterProps = {
  alert: AlertDisplay;
};

export function AlertMeter({ alert }: AlertMeterProps) {
  const prevLevelRef = useRef(alert.level);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (alert.level > prevLevelRef.current) {
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), 1200);
      prevLevelRef.current = alert.level;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = alert.level;
  }, [alert.level]);

  const segments = Array.from({ length: alert.maxLevel + 1 }, (_, i) => i);

  return (
    <div
      className="absolute right-6 top-14 z-10 min-w-32 rounded-[10px] border border-white/[0.04] px-4 py-3"
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="mb-2 text-[10px] tracking-[1.5px] text-[#445]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        ALERT
      </div>

      <div className="flex gap-[3px]">
        {segments.map((i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm transition-all duration-400"
            style={{
              background: i <= alert.level ? alert.color : "rgba(255,255,255,0.06)",
              boxShadow: i <= alert.level ? `0 0 8px ${alert.color}40` : "none",
              animation: pulsing && i <= alert.level ? "alertPulse 0.6s ease-in-out 2" : "none",
            }}
          />
        ))}
      </div>

      <div
        className="mt-1.5 text-[11px] font-semibold tracking-[1.5px] transition-colors duration-400"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: alert.color,
          animation: pulsing ? "alertPulse 0.6s ease-in-out 2" : "none",
        }}
      >
        {alert.label}
      </div>
    </div>
  );
}
