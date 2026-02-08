import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { isSafeMatchId } from "@/engine/matchId";
import { findExhibitionMatchDirectory } from "@/server/exhibitionStorage";
import { getMatchStorageRoot } from "@/server/matchStorage";
import type {
  MatchArtifactsIndex,
  MatchDetailResponse,
  MatchStatusRecord,
  MatchSummaryRecord,
  VerificationResult,
} from "@/lib/matches/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function resolveScenarioName(manifest: Record<string, unknown> | null): string | undefined {
  if (!manifest) {
    return undefined;
  }
  const scenario = manifest.scenario;
  if (scenario && typeof scenario === "object") {
    const scenarioId = (scenario as { id?: unknown }).id;
    if (typeof scenarioId === "string") {
      return scenarioId;
    }
  }
  return undefined;
}

function buildArtifactsIndex(matchDir: string): MatchArtifactsIndex {
  const entries: MatchArtifactsIndex = {
    summary: "match_summary.json",
  };

  const optionalFiles: Array<[keyof MatchArtifactsIndex, string]> = [
    ["manifest", "match_manifest.json"],
    ["log", "match.jsonl"],
    ["moments", "moments.json"],
    ["highlights", "highlights.json"],
    ["broadcastManifest", "broadcast_manifest.json"],
    ["verification", "verification_result.json"],
    ["status", "match_status.json"],
  ];

  for (const [key, filename] of optionalFiles) {
    if (existsSync(join(matchDir, filename))) {
      entries[key] = filename;
    }
  }

  return entries;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> },
): Promise<Response> {
  const { matchId } = await params;
  if (!isSafeMatchId(matchId)) {
    return NextResponse.json({ error: "Invalid matchId" }, { status: 400 });
  }

  let matchDir = join(getMatchStorageRoot(), matchId);
  let summary = await readJsonFile<MatchSummaryRecord>(join(matchDir, "match_summary.json"));
  if (!summary) {
    const exhibitionDir = await findExhibitionMatchDirectory(matchId);
    if (exhibitionDir) {
      matchDir = exhibitionDir;
      summary = await readJsonFile<MatchSummaryRecord>(join(matchDir, "match_summary.json"));
    }
  }
  if (!summary) {
    return NextResponse.json({ error: "Match summary not found" }, { status: 404 });
  }

  const status = await readJsonFile<MatchStatusRecord>(join(matchDir, "match_status.json"));
  const manifest = await readJsonFile<Record<string, unknown>>(
    join(matchDir, "match_manifest.json"),
  );
  const verification = await readJsonFile<VerificationResult>(
    join(matchDir, "verification_result.json"),
  );

  const response: MatchDetailResponse = {
    matchId: summary.matchId ?? matchId,
    scenarioName: resolveScenarioName(manifest),
    status,
    summary,
    artifacts: buildArtifactsIndex(matchDir),
    verification,
  };

  return NextResponse.json(response);
}
