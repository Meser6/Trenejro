/**
 * Render training plan JSON into a standalone HTML file (no external fetch/CORS).
 *
 * Usage:
 *   node scripts/render_plan.js
 *   node scripts/render_plan.js --in plans/current_plan.json --out plans/current_plan.html
 *   node scripts/render_plan.js --template templates/plan_template_tabs_dashboard.html
 *
 * Template:
 *   templates/plan_template.html (default; expects placeholders __PLAN_JSON__ and __GENERATED_AT__)
 *   or any template passed via --template (same placeholders)
 */

const fs = require("fs");
const path = require("path");

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const inPath = argValue("--in") || path.join("plans", "current_plan.json");
const outPath = argValue("--out") || path.join("plans", "current_plan.html");
const templatePath = argValue("--template") || path.join("templates", "plan_template.html");

function isoNow() {
  return new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";
}

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function safeJsonForHtml(obj) {
  // Avoid breaking out of <script> tag
  return JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");
}

function parseCsv(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = fields[idx] !== undefined ? fields[idx] : "";
    });
    rows.push(obj);
  }
  return rows;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function readCsvIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const text = fs.readFileSync(filePath, "utf8");
    return parseCsv(text);
  } catch (e) {
    return [];
  }
}

function normalizeDatasets({ plannedSessionsRows, trainingLogRows }) {
  const planned_sessions = (plannedSessionsRows || []).map((r) => ({
    date: r.date || "",
    sport: r.sport || "",
    session_type: r.session_type || "",
    duration_min: r.duration_min || "",
    distance_km: r.distance_km || "",
    elevation_gain_m: r.elevation_gain_m || "",
    surface: r.surface || "",
    notes: r.notes || "",
  }));

  const training_log = (trainingLogRows || []).map((r) => ({
    date: r.date || "",
    sport: r.sport || "",
    session_type: r.session_type || "",
    surface: r.surface || "",
    duration_min: r.duration_min || "",
    distance_km: r.distance_km || "",
    elevation_gain_m: r.elevation_gain_m || "",
    avg_pace: r.avg_pace || "",
    rpe: r.RPE_1_10 || "",
    knee_left_pain_during: r.knee_left_pain_during || "",
    knee_left_pain_next_morning: r.knee_left_pain_next_morning || "",
    knee_right_pain_during: r.knee_right_pain_during || "",
    knee_right_pain_next_morning: r.knee_right_pain_next_morning || "",
    achilles_pain: r.achilles_pain || "",
    notes: r.notes || "",
  }));

  return { planned_sessions, training_log };
}

function main() {
  if (!fs.existsSync(inPath)) {
    console.error(`Missing input JSON: ${inPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(templatePath)) {
    console.error(`Missing template: ${templatePath}`);
    process.exit(1);
  }

  const plan = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const tpl = fs.readFileSync(templatePath, "utf8");

  const generatedAt = isoNow();
  const plannedSessionsPath = path.join("data", "planned_sessions.csv");
  const trainingLogPath = path.join("data", "training_log.csv");
  const datasets = normalizeDatasets({
    plannedSessionsRows: readCsvIfExists(plannedSessionsPath),
    trainingLogRows: readCsvIfExists(trainingLogPath),
  });

  const planWithHints = {
    version: plan.version || "plan.schema.v1",
    ...plan,
    datasets,
    files: {
      ...(plan.files || {}),
      json: inPath,
      html: outPath,
    },
  };

  const html = tpl
    .replace("__GENERATED_AT__", generatedAt)
    .replace("__PLAN_JSON__", safeJsonForHtml(planWithHints));

  ensureDirForFile(outPath);
  fs.writeFileSync(outPath, html, "utf8");
  console.log(`Rendered: ${outPath}`);
}

main();


