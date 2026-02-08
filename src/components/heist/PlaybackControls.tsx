"use client";

const SPEEDS = [0.5, 1, 2, 4];

type PlaybackControlsProps = {
  playing: boolean;
  speed: number;
  isFinished: boolean;
  onPlayPause: () => void;
  onSetSpeed: (s: number) => void;
  onRestart: () => void;
};

export function PlaybackControls({
  playing,
  speed,
  isFinished,
  onPlayPause,
  onSetSpeed,
  onRestart,
}: PlaybackControlsProps) {
  const handleClick = () => {
    if (isFinished) {
      onRestart();
    } else {
      onPlayPause();
    }
  };

  return (
    <div
      className="flex shrink-0 items-center justify-center gap-4 border-t border-white/[0.04] px-6 py-3"
      style={{ background: "rgba(10,14,20,0.9)" }}
    >
      <button
        onClick={handleClick}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none text-base font-bold transition-all duration-150"
        style={{
          background: playing ? "rgba(255,255,255,0.06)" : "#00e5ff",
          color: playing ? "#e0e4ec" : "#0a0e14",
        }}
      >
        {isFinished ? "\u21BA" : playing ? "\u275A\u275A" : "\u25B6"}
      </button>

      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onSetSpeed(s)}
          className="cursor-pointer rounded border px-2.5 py-1 text-[11px] transition-all duration-150"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            background: speed === s ? "rgba(0,229,255,0.1)" : "transparent",
            borderColor: speed === s ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.06)",
            color: speed === s ? "#00e5ff" : "#445",
          }}
        >
          {s}x
        </button>
      ))}

      <div
        className="ml-6 text-[11px] text-[#334]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {playing ? "LIVE" : isFinished ? "MATCH COMPLETE" : "PAUSED"}
        {playing && <span className="ml-1.5 animate-pulse text-[#ff3d71]">{"\u25CF"}</span>}
      </div>
    </div>
  );
}
