/**
 * Archive the current plan snapshot (JSON + HTML + CSV).
 *
 * Usage:
 *   node scripts/archive_plan.js
 *   node scripts/archive_plan.js --date 2026-02-21
 *
 * By default, uses plans/current_plan.json -> plan.week.start as the archive key.
 */
const fs = require("fs");
const path = require("path");

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyOrThrow(src, dst) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source file: ${src}`);
  }
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function main() {
  const jsonPath = path.join("plans", "current_plan.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Missing plan JSON: ${jsonPath}`);
    process.exit(1);
  }

  const plan = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const date = argValue("--date") || plan?.week?.start;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`Invalid archive date. Expected YYYY-MM-DD, got: ${String(date)}`);
    process.exit(1);
  }

  const archiveDir = path.join("plans", "archive");
  ensureDir(archiveDir);

  const dstJson = path.join(archiveDir, `${date}_plan.json`);
  const dstHtml = path.join(archiveDir, `${date}_plan.html`);
  const dstCsv = path.join(archiveDir, `${date}_plan.csv`);

  copyOrThrow(jsonPath, dstJson);
  copyOrThrow("index.html", dstHtml);
  copyOrThrow(path.join("plans", "current_plan.csv"), dstCsv);

  console.log(`Archived: ${dstJson}`);
  console.log(`Archived: ${dstHtml}`);
  console.log(`Archived: ${dstCsv}`);
}

main();

