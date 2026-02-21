/**
 * Fetch a 7-day weather forecast for Kraków (Open-Meteo, no API key)
 * and store it in data/weather_forecast.json.
 *
 * Usage:
 *   node scripts/fetch_weather.js
 */
const fs = require("fs");
const path = require("path");

const OUT_PATH = path.join("data", "weather_forecast.json");

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function isoNow() {
  return new Date().toISOString();
}

async function main() {
  const location = {
    name: "Kraków",
    latitude: 50.0647,
    longitude: 19.945,
    timezone: "Europe/Warsaw",
    source: "open-meteo",
  };

  const daily =
    "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max";

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${encodeURIComponent(location.latitude)}` +
    `&longitude=${encodeURIComponent(location.longitude)}` +
    `&daily=${encodeURIComponent(daily)}` +
    `&timezone=${encodeURIComponent(location.timezone)}` +
    `&forecast_days=7`;

  const res = await fetch(url, {
    headers: { "user-agent": "trenejro/1.0 (plan generator)" },
  });
  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const payload = {
    fetched_at: isoNow(),
    location,
    raw: json,
    daily: json.daily || {},
  };

  ensureDirForFile(OUT_PATH);
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`Saved: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exit(1);
});

