import { promises as fs } from "node:fs";
import path from "node:path";

async function globalSetup() {
  const root = path.resolve(__dirname, "../../.playwright-data");
  await fs.rm(root, { recursive: true, force: true });
}

export default globalSetup;
