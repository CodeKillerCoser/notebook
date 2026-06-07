import fs from "node:fs";
import path from "node:path";

const output = path.join(process.cwd(), "_site");

if (fs.existsSync(output)) {
  fs.rmSync(output, { recursive: true, force: true });
}
