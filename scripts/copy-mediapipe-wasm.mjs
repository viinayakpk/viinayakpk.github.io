import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, "../node_modules/@mediapipe/tasks-vision/wasm");
const dest = path.resolve(__dirname, "../public/mediapipe/wasm");

if (!existsSync(src)) {
  console.error("mediapipe wasm source not found - is @mediapipe/tasks-vision installed?");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("Copied MediaPipe wasm runtime to public/mediapipe/wasm");
