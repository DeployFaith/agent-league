import { rmSync } from "node:fs";
import { join } from "node:path";
import { runTournament } from "../src/tournament/runTournament.js";
import { writeTournamentArtifacts } from "../src/tournament/artifacts.js";
import { verifyTournamentDirectory } from "../src/cli/verify-tournament.js";
import type { TournamentConfig } from "../src/tournament/types.js";

const EXHIBITION_ID = "heist-showcase-001";
const TOURNAMENT_SEED = 41001;

async function main(): Promise<void> {
  const outDir = join(process.cwd(), "data", "exhibitions", EXHIBITION_ID);
  rmSync(outDir, { recursive: true, force: true });

  const config: TournamentConfig = {
    seed: TOURNAMENT_SEED,
    maxTurns: 20,
    rounds: 1,
    scenarioKey: "heist",
    agentKeys: ["noop", "noop", "noop"],
    includeEventLogs: true,
    modeProfile: "exhibition",
  };

  const result = await runTournament(config);
  await writeTournamentArtifacts(result, outDir);

  const report = await verifyTournamentDirectory(outDir);
  if (report.status !== "pass") {
    throw new Error(`verify-tournament failed with status ${report.status}`);
  }

  // eslint-disable-next-line no-console
  console.log(`Wrote exhibition to ${outDir}`);
}

void main();
