/**
 * Render training plan JSON into a flat CSV (1 row = 1 session).
 *
 * Usage:
 *   node scripts/render_plan_csv.js
 *   node scripts/render_plan_csv.js --in plans/current_plan.json --out plans/current_plan.csv
 */
const fs = require("fs");
const path = require("path");

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const inPath = argValue("--in") || path.join("plans", "current_plan.json");
const outPath = argValue("--out") || path.join("plans", "current_plan.csv");

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
}

function main() {
  if (!fs.existsSync(inPath)) {
    console.error(`Missing input JSON: ${inPath}`);
    process.exit(1);
  }

  const plan = JSON.parse(fs.readFileSync(inPath, "utf8"));

  const header = [
    "week_start",
    "week_end",
    "date",
    "day_name",
    "sport",
    "session_type",
    "title",
    "surface",
    "duration_min",
    "distance_km",
    "elevation_gain_m",
    "intensity",
    "rpe",
    "notes",
  ];

  const rows = [header];
  const weekStart = plan.week?.start || "";
  const weekEnd = plan.week?.end || "";

  (plan.days || []).forEach((d) => {
    (d.sessions || []).forEach((s) => {
      rows.push([
        weekStart,
        weekEnd,
        d.date || "",
        d.day_name || "",
        s.sport || "",
        s.session_type || "",
        s.title || "",
        s.surface || "",
        s.duration_min ?? "",
        s.distance_km ?? "",
        s.elevation_gain_m ?? "",
        s.intensity || "",
        s.rpe ?? "",
        s.notes || "",
      ]);
    });
  });

  ensureDirForFile(outPath);
  fs.writeFileSync(outPath, toCsv(rows), "utf8");
  console.log(`Rendered: ${outPath}`);
}

main();






