"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { MatchEvent } from "@/contract/types";
import type { HeistSceneState } from "@/arena/heist/types";
import { reduceHeistEvent } from "@/arena/heist/reducer";

export type PlaybackState = {
  state: HeistSceneState;
  turn: number;
  maxTurns: number;
  playing: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  setSpeed: (s: number) => void;
  restart: () => void;
  /** Seek to a specific event index. Pauses playback. */
  seek: (index: number) => void;
  isFinished: boolean;
  scores: Record<string, number>;
  cursor: number;
  eventCount: number;
  events: MatchEvent[];
};

const BASE_INTERVAL_MS = 1800;

/**
 * Extract scores from a MatchEvent if it's a StateUpdated or MatchEnded event.
 */
function extractScores(event: MatchEvent, prev: Record<string, number>): Record<string, number> {
  if (event.type === "StateUpdated") {
    const summary = event.summary;
    if (typeof summary === "object" && summary !== null && !Array.isArray(summary)) {
      const agents = (summary as Record<string, unknown>).agents;
      if (typeof agents === "object" && agents !== null) {
        const next = { ...prev };
        for (const [agentId, agentData] of Object.entries(agents as Record<string, unknown>)) {
          if (
            typeof agentData === "object" &&
            agentData !== null &&
            typeof (agentData as Record<string, unknown>).score === "number"
          ) {
            next[agentId] = (agentData as Record<string, unknown>).score as number;
          }
        }
        return next;
      }
    }
  }
  if (event.type === "MatchEnded") {
    return { ...prev, ...event.scores };
  }
  return prev;
}

/**
 * Precompute snapshots at each event index for efficient scrubbing.
 * We store snapshots at every event for incremental playback.
 */
function buildSnapshots(events: MatchEvent[]): {
  states: HeistSceneState[];
  scoreSnapshots: Record<string, number>[];
} {
  const states: HeistSceneState[] = [];
  const scoreSnapshots: Record<string, number>[] = [];
  let sceneState: HeistSceneState | undefined;
  let scores: Record<string, number> = {};

  for (const event of events) {
    sceneState = reduceHeistEvent(sceneState, event);
    scores = extractScores(event, scores);
    states.push(sceneState);
    scoreSnapshots.push(scores);
  }

  return { states, scoreSnapshots };
}

export function useHeistPlayback(events: MatchEvent[]): PlaybackState {
  const { states, scoreSnapshots } = useMemo(() => buildSnapshots(events), [events]);

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const eventCount = events.length;
  const maxCursor = eventCount - 1;
  const clampedCursor = Math.min(cursor, maxCursor);

  const currentState = states[clampedCursor] ?? states[0];
  const currentScores = scoreSnapshots[clampedCursor] ?? {};
  const isFinished = currentState?.status === "ended";

  const advance = useCallback(() => {
    setCursor((prev) => {
      if (prev >= maxCursor) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [maxCursor]);

  useEffect(() => {
    if (playing && !isFinished) {
      const ms = BASE_INTERVAL_MS / speed;
      intervalRef.current = setInterval(advance, ms);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [playing, speed, advance, isFinished]);

  // Auto-pause when match finishes
  useEffect(() => {
    if (isFinished) {
      setPlaying(false);
    }
  }, [isFinished]);

  const play = useCallback(() => {
    if (!isFinished) {
      setPlaying(true);
    }
  }, [isFinished]);

  const pause = useCallback(() => {
    setPlaying(false);
  }, []);

  const restart = useCallback(() => {
    setCursor(0);
    setPlaying(true);
  }, []);

  const seek = useCallback(
    (index: number) => {
      setCursor(Math.max(0, Math.min(index, maxCursor)));
      setPlaying(false);
    },
    [maxCursor],
  );

  const setPlaybackSpeed = useCallback((s: number) => {
    setSpeed(s);
  }, []);

  return {
    state: currentState,
    turn: currentState?.turn?.current ?? 0,
    maxTurns: currentState?.turn?.maxTurns ?? 0,
    playing,
    speed,
    play,
    pause,
    setSpeed: setPlaybackSpeed,
    restart,
    seek,
    isFinished,
    scores: currentScores,
    cursor: clampedCursor,
    eventCount,
    events,
  };
}
