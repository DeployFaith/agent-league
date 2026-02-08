"use client";

type ScorePanelProps = {
  scores: Record<string, number>;
  agentIds: string[];
};

export function ScorePanel({ scores, agentIds }: ScorePanelProps) {
  const primaryAgent = agentIds[0];
  const score = primaryAgent ? (scores[primaryAgent] ?? 0) : 0;

  return (
    <div
      className="absolute left-6 top-5 z-10 rounded-[10px] border border-white/[0.04] px-5 py-3.5"
      style={{
        background: "rgba(10,14,20,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="mb-1.5 text-[10px] tracking-[1.5px] text-[#445]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        SCORE
      </div>
      <div
        className="text-[28px] font-bold text-cyan"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {score}
      </div>
    </div>
  );
}
