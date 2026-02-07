# Rename Changelog: Agent League → HashMatch

**Date:** 2026-02-07  
**Scope:** All 20 project markdown files

## File Renames (4 files)

| Original | Renamed |
|---|---|
| `agent-league-action-plan.md` | `hashmatch-action-plan.md` |
| `agent-league-prompts-v4.md` | `hashmatch-prompts-v4.md` |
| `agent_league_live_platform_direction_decision_architecture.md` | `hashmatch_live_platform_direction_decision_architecture.md` |
| `agent_league_summary.md` | `hashmatch_summary.md` |

## Content Replacements (38 total across 20 files)

| Pattern | Replacement |
|---|---|
| `Agent League` | `HashMatch` |
| `agent league` | `hashmatch` |
| `agent-league` | `hashmatch` |
| `agent_league` | `hashmatch` |
| `AgentLeague` | `HashMatch` |
| `AGENT_LEAGUE` | `HASHMATCH` |

## Untouched

- `Agentic_Design_Patterns.pdf` — external reference doc, not project-specific

## Verification

- **0** remaining references to any variant of "Agent League"
- **38** references to "HashMatch" / "hashmatch" / "HASHMATCH" confirmed

## Next Steps

- Update `package.json` name field to `"hashmatch"`
- Update repo name / GitHub org if applicable
- Domain: `hashmatch.ai`
- Schema version alias: `"hashmatch_v1"` (with `"agent_league_v1"` as deprecated alias during transition)
