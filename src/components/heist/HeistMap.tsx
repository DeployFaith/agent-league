"use client";

import type { HeistSceneState, RoomVisual, DoorVisual } from "@/arena/heist/types";

const CELL = 120;
const ROOM_SIZE = 88;
const PADDING = 80;

const ROOM_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  spawn: { bg: "rgba(0,230,118,0.08)", border: "rgba(0,230,118,0.25)", accent: "#00e676" },
  extraction: { bg: "rgba(0,229,255,0.08)", border: "rgba(0,229,255,0.25)", accent: "#00e5ff" },
  vault: { bg: "rgba(255,171,64,0.08)", border: "rgba(255,171,64,0.25)", accent: "#ffab40" },
  security: { bg: "rgba(255,61,113,0.06)", border: "rgba(255,61,113,0.2)", accent: "#ff3d71" },
  hallway: { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.08)", accent: "#556" },
  utility: { bg: "rgba(124,77,255,0.06)", border: "rgba(124,77,255,0.2)", accent: "#7c4dff" },
  room: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)", accent: "#667" },
  decoy: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)", accent: "#667" },
};

function getRoomColors(label?: string) {
  if (!label) {
    return ROOM_COLORS.room;
  }
  return ROOM_COLORS[label] ?? ROOM_COLORS.room;
}

function getRoomCenter(room: RoomVisual, minX: number, minY: number) {
  const pos = room.positionHint ?? { x: 0, y: 0 };
  return {
    cx: PADDING + (pos.x - minX) * CELL + ROOM_SIZE / 2,
    cy: PADDING + (pos.y - minY) * CELL + ROOM_SIZE / 2,
  };
}

function getRoomTopLeft(room: RoomVisual, minX: number, minY: number) {
  const pos = room.positionHint ?? { x: 0, y: 0 };
  return {
    x: PADDING + (pos.x - minX) * CELL,
    y: PADDING + (pos.y - minY) * CELL,
  };
}

type HeistMapProps = {
  state: HeistSceneState;
};

export function HeistMap({ state }: HeistMapProps) {
  const rooms = Object.values(state.map.rooms);
  const doors = Object.values(state.map.doors);
  const agents = Object.values(state.agents);
  const guards = Object.values(state.guards);
  const entities = Object.values(state.entities);

  // Compute bounds
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const room of rooms) {
    const pos = room.positionHint;
    if (pos) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    }
  }
  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
  }

  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const svgW = PADDING * 2 + (cols - 1) * CELL + ROOM_SIZE;
  const svgH = PADDING * 2 + (rows - 1) * CELL + ROOM_SIZE;

  // Collect all visible rooms across all agents
  const visibleRooms = new Set<string>();
  for (const agent of agents) {
    if (agent.visibleRooms) {
      for (const rid of agent.visibleRooms) {
        visibleRooms.add(rid);
      }
    }
  }

  // Build a quick room lookup
  const roomMap = state.map.rooms;

  // Guard patrol routes as polylines
  const guardColors = ["#ff3d71", "#ff6b35", "#ff9100", "#e040fb"];

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="h-auto max-h-full w-full"
      style={{ maxWidth: svgW }}
    >
      {/* Grid dots for ambiance */}
      {Array.from({ length: Math.ceil(svgW / 40) }).map((_, i) =>
        Array.from({ length: Math.ceil(svgH / 40) }).map((_, j) => (
          <circle
            key={`dot-${i}-${j}`}
            cx={i * 40}
            cy={j * 40}
            r={0.5}
            fill="rgba(255,255,255,0.04)"
          />
        )),
      )}

      {/* Doors */}
      {doors.map((door: DoorVisual) => {
        const fromRoom = roomMap[door.from];
        const toRoom = roomMap[door.to];
        if (!fromRoom || !toRoom) {
          return null;
        }
        const from = getRoomCenter(fromRoom, minX, minY);
        const to = getRoomCenter(toRoom, minX, minY);
        return (
          <line
            key={door.doorId}
            x1={from.cx}
            y1={from.cy}
            x2={to.cx}
            y2={to.cy}
            stroke={door.isLocked ? "rgba(255,61,113,0.2)" : "rgba(255,255,255,0.08)"}
            strokeWidth={door.isLocked ? 2 : 1.5}
            strokeDasharray={door.isLocked ? "6 4" : "none"}
          />
        );
      })}

      {/* Guard patrol routes */}
      {guards.map((guard, gi) => {
        if (guard.patrolRoomIds.length < 2) {
          return null;
        }
        const points = guard.patrolRoomIds
          .map((rid) => {
            const room = roomMap[rid];
            if (!room) {
              return null;
            }
            const c = getRoomCenter(room, minX, minY);
            return `${c.cx},${c.cy}`;
          })
          .filter(Boolean)
          .join(" ");
        const color = guardColors[gi % guardColors.length];
        return (
          <polyline
            key={`patrol-${guard.guardId}`}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 6"
            opacity={0.2}
          />
        );
      })}

      {/* Rooms */}
      {rooms.map((room) => {
        const tl = getRoomTopLeft(room, minX, minY);
        const colors = getRoomColors(room.label);
        const isVisible = visibleRooms.has(room.roomId);
        const agentHere = agents.some((a) => a.roomId === room.roomId);
        const opacity = visibleRooms.size > 0 ? (isVisible ? 1 : 0.25) : 1;

        return (
          <g key={room.roomId} opacity={opacity} style={{ transition: "opacity 0.5s ease" }}>
            <rect
              x={tl.x}
              y={tl.y}
              width={ROOM_SIZE}
              height={ROOM_SIZE}
              rx={8}
              fill={agentHere ? colors.bg.replace(/[\d.]+\)$/, "0.15)") : colors.bg}
              stroke={agentHere ? colors.accent : colors.border}
              strokeWidth={agentHere ? 2 : 1}
            />
            <text
              x={tl.x + ROOM_SIZE / 2}
              y={tl.y + ROOM_SIZE / 2 - 6}
              textAnchor="middle"
              fontSize={10}
              fontFamily="'JetBrains Mono', ui-monospace, monospace"
              fill={colors.accent}
              fontWeight={600}
              letterSpacing={0.5}
            >
              {room.label
                ? room.label.length > 14
                  ? room.label.substring(0, 12) + "..."
                  : room.label
                : room.roomId}
            </text>
            <text
              x={tl.x + ROOM_SIZE / 2}
              y={tl.y + ROOM_SIZE / 2 + 10}
              textAnchor="middle"
              fontSize={8}
              fontFamily="'JetBrains Mono', ui-monospace, monospace"
              fill="#334"
            >
              {room.roomId}
            </text>
          </g>
        );
      })}

      {/* Camera entities */}
      {entities
        .filter((e) => e.kind === "camera")
        .map((cam) => {
          const room = cam.roomId ? roomMap[cam.roomId] : undefined;
          if (!room) {
            return null;
          }
          const c = getRoomCenter(room, minX, minY);
          const isVisible = cam.roomId ? visibleRooms.has(cam.roomId) : false;
          return (
            <g
              key={cam.entityId}
              opacity={isVisible ? 0.7 : 0.15}
              style={{ transition: "opacity 0.5s ease" }}
            >
              <circle
                cx={c.cx + 30}
                cy={c.cy - 30}
                r={8}
                fill="rgba(124,77,255,0.15)"
                stroke="rgba(124,77,255,0.4)"
                strokeWidth={1}
              />
              <text
                x={c.cx + 30}
                y={c.cy - 26}
                textAnchor="middle"
                fontSize={8}
                fill="#7c4dff"
                fontFamily="'JetBrains Mono', ui-monospace, monospace"
              >
                {"@"}
              </text>
            </g>
          );
        })}

      {/* Guards */}
      {guards.map((guard, gi) => {
        const room = guard.roomId ? roomMap[guard.roomId] : undefined;
        if (!room) {
          return null;
        }
        const c = getRoomCenter(room, minX, minY);
        const isVisible = guard.roomId ? visibleRooms.has(guard.roomId) : false;
        const color = guardColors[gi % guardColors.length];
        return (
          <g
            key={guard.guardId}
            opacity={visibleRooms.size > 0 ? (isVisible ? 1 : 0.2) : 1}
            style={{ transition: "opacity 0.5s ease" }}
          >
            <polygon
              points={`${c.cx},${c.cy - 14} ${c.cx - 10},${c.cy + 8} ${c.cx + 10},${c.cy + 8}`}
              fill={color + "30"}
              stroke={color}
              strokeWidth={1.5}
            />
            <text
              x={c.cx}
              y={c.cy + 24}
              textAnchor="middle"
              fontSize={9}
              fontFamily="'JetBrains Mono', ui-monospace, monospace"
              fill={color}
              fontWeight={600}
            >
              {guard.guardId.replace("guard-", "G")}
            </text>
          </g>
        );
      })}

      {/* Agent tokens */}
      {agents.map((agent) => {
        const room = agent.roomId ? roomMap[agent.roomId] : undefined;
        if (!room) {
          return null;
        }
        const c = getRoomCenter(room, minX, minY);
        return (
          <g key={agent.agentId}>
            <circle
              cx={c.cx}
              cy={c.cy}
              r={16}
              fill="rgba(0,229,255,0.15)"
              stroke="#00e5ff"
              strokeWidth={2}
            >
              <animate attributeName="r" values="16;18;16" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={c.cx} cy={c.cy} r={6} fill="#00e5ff" />
            <text
              x={c.cx}
              y={c.cy - 24}
              textAnchor="middle"
              fontSize={10}
              fontFamily="'JetBrains Mono', ui-monospace, monospace"
              fill="#00e5ff"
              fontWeight={700}
            >
              {agent.agentId}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
