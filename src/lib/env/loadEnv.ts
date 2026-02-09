import { config } from "dotenv";
import { resolve } from "path";

let loaded = false;

export function loadEnv(): void {
  if (loaded) {
    return;
  }
  loaded = true;
  // .env.local first (matches Next.js precedence), .env as fallback.
  // dotenv default: does not override existing process.env values.
  config({ path: resolve(process.cwd(), ".env.local") });
  config({ path: resolve(process.cwd(), ".env") });
}
