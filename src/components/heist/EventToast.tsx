"use client";

import { useEffect, useState, useRef } from "react";
import type { HeistSceneState } from "@/arena/heist/types";

type ToastMessage = {
  text: string;
  kind: "danger" | "success" | "info";
  key: number;
};

const TOAST_DURATION_MS = 2500;

function classifyToast(text: string): "danger" | "success" | "info" {
  const lower = text.toLowerCase();
  if (lower.includes("alert") || lower.includes("error") || lower.includes("invalid")) {
    return "danger";
  }
  if (lower.includes("complete") || lower.includes("extract") || lower.includes("secured")) {
    return "success";
  }
  return "info";
}

const TOAST_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  danger: {
    bg: "rgba(255,61,113,0.15)",
    border: "rgba(255,61,113,0.3)",
    color: "#ff3d71",
  },
  success: {
    bg: "rgba(0,230,118,0.12)",
    border: "rgba(0,230,118,0.25)",
    color: "#00e676",
  },
  info: {
    bg: "rgba(0,229,255,0.1)",
    border: "rgba(0,229,255,0.2)",
    color: "#00e5ff",
  },
};

/**
 * Detect notable events from state changes and show ephemeral toasts.
 */
export function EventToast({ state, cursor }: { state: HeistSceneState; cursor: number }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const prevAlertRef = useRef<number | undefined>(undefined);
  const prevStatusRef = useRef<string>("idle");
  const prevCursorRef = useRef(cursor);
  const toastKeyRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't show toasts on initialization or backward scrubbing
    if (cursor <= 0) {
      prevAlertRef.current = state.sceneFacts?.alertLevel;
      prevStatusRef.current = state.status;
      prevCursorRef.current = cursor;
      return;
    }

    // Detect restart (cursor jumped backward)
    if (cursor < prevCursorRef.current) {
      prevAlertRef.current = state.sceneFacts?.alertLevel;
      prevStatusRef.current = state.status;
      prevCursorRef.current = cursor;
      setToast(null);
      return;
    }

    const messages: string[] = [];

    // Alert level change
    const alertLevel = state.sceneFacts?.alertLevel;
    if (alertLevel !== undefined && prevAlertRef.current !== undefined) {
      if (alertLevel > prevAlertRef.current) {
        if (alertLevel >= 3) {
          messages.push("LOCKDOWN TRIGGERED");
        } else {
          messages.push(`ALERT LEVEL ${alertLevel}`);
        }
      }
    }

    // Match ended
    if (state.status === "ended" && prevStatusRef.current !== "ended") {
      if (state.terminationReason === "completed") {
        messages.push("MATCH COMPLETE");
      } else if (state.terminationReason === "capture") {
        messages.push("AGENT CAPTURED");
      } else if (state.terminationReason === "lockdown") {
        messages.push("FACILITY LOCKDOWN");
      } else {
        messages.push("MATCH ENDED");
      }
    }

    // Agent errors
    for (const agent of Object.values(state.agents)) {
      if (agent.error) {
        messages.push(`Error: ${agent.error.substring(0, 40)}`);
      }
    }

    // Agent adjudication feedback
    for (const agent of Object.values(state.agents)) {
      if (agent.lastAdjudication && agent.lastAdjudication.valid === false) {
        const feedback = agent.lastAdjudication.feedback;
        if (typeof feedback === "object" && feedback !== null) {
          const errMsg = (feedback as Record<string, unknown>).error;
          if (typeof errMsg === "string") {
            messages.push(errMsg.substring(0, 50));
          }
        }
      }
    }

    if (messages.length > 0) {
      const text = messages[0];
      toastKeyRef.current += 1;
      setToast({ text, kind: classifyToast(text), key: toastKeyRef.current });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setToast(null);
      }, TOAST_DURATION_MS);
    }

    prevAlertRef.current = alertLevel;
    prevStatusRef.current = state.status;
    prevCursorRef.current = cursor;
  }, [cursor, state]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!toast) {
    return null;
  }

  const styles = TOAST_STYLES[toast.kind];

  return (
    <div
      key={toast.key}
      className="absolute bottom-[100px] left-1/2 z-20 -translate-x-1/2 animate-[toastIn_0.3s_ease-out] rounded-lg px-6 py-2.5"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      <span
        className="text-sm font-semibold"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: styles.color,
        }}
      >
        {toast.text}
      </span>
    </div>
  );
}
