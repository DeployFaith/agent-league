import type { Agent, AgentConfig, AgentContext } from "../contract/interfaces.js";
import type { AgentId } from "../contract/types.js";

/**
 * No-op agent that always returns an empty action object.
 * Useful for smoke-testing scenarios without scenario-specific logic.
 */
export function createNoopAgent(id: AgentId): Agent<unknown, Record<string, never>> {
  return {
    id,
    init(_config: AgentConfig): void {
      // Stateless — nothing to initialize.
    },
    act(_observation: unknown, _ctx: AgentContext): Record<string, never> {
      return {};
    },
  };
}
