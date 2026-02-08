import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { MatchSummaryRecord } from "@/lib/matches/types";

const DEFAULT_EXHIBITION_STORAGE_DIR = join(process.cwd(), "data", "exhibitions");

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getExhibitionStorageRoot(): string {
  return process.env.EXHIBITION_STORAGE_DIR ?? DEFAULT_EXHIBITION_STORAGE_DIR;
}

export async function listExhibitionMatchDirectories(): Promise<string[]> {
  const root = getExhibitionStorageRoot();
  if (!existsSync(root)) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });
  const matchDirs: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const matchesDir = join(root, entry.name, "matches");
    if (!existsSync(matchesDir)) {
      continue;
    }
    const matchEntries = await readdir(matchesDir, { withFileTypes: true });
    for (const matchEntry of matchEntries) {
      if (!matchEntry.isDirectory()) {
        continue;
      }
      matchDirs.push(join(matchesDir, matchEntry.name));
    }
  }

  return matchDirs;
}

export async function findExhibitionMatchDirectory(matchId: string): Promise<string | null> {
  const matchDirs = await listExhibitionMatchDirectories();
  for (const matchDir of matchDirs) {
    const summary = await readJsonFile<MatchSummaryRecord>(join(matchDir, "match_summary.json"));
    if (summary?.matchId === matchId) {
      return matchDir;
    }
  }
  return null;
}
