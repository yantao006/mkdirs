import { spawnSync } from "node:child_process";

for (const args of [
  ["schema", "extract"],
  ["typegen", "generate"],
]) {
  const result = spawnSync("pnpm", ["exec", "sanity", ...args], {
    encoding: "utf8",
    timeout: 300000,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, SANITY_CLI_TELEMETRY_DISABLED: "1" },
  });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  const output = `${result.stdout}\n${result.stderr}`;
  // Sanity v3 may otherwise exit zero after skipping a malformed GROQ query.
  if (
    result.error ||
    result.status !== 0 ||
    /Error generating types|Encountered errors in/.test(output)
  ) {
    console.error("Sanity generation did not complete without errors.");
    process.exit(1);
  }
}
