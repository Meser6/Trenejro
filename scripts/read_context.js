// Skrypt do odczytu kontekstu i daty przed generowaniem planu
// Uruchom: node read_context.js

const fs = require('fs');
const { execSync } = require('child_process');

function parseCsvLine(line) {
    const out = [];
    let cur = '';
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
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                out.push(cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
    }
    out.push(cur);
    return out;
}

// Odczytaj datę
const dateOutput = execSync('node scripts/get_date.js', { encoding: 'utf-8' });
const dateInfo = JSON.parse(dateOutput);

console.log('=== INFORMACJE O DATACH ===');
console.log(`Dzisiaj: ${dateInfo.today} (${dateInfo.dayOfWeek})`);
console.log(`Początek tygodnia: ${dateInfo.weekStart}`);
console.log(`Koniec tygodnia: ${dateInfo.weekEnd}`);
console.log(`Początek następnego tygodnia: ${dateInfo.nextWeekStart}`);
console.log(`Pora roku: ${dateInfo.seasonName} (${dateInfo.season})`);
console.log('');
console.log('=== DOSTĘPNOŚĆ AKTYWNOŚCI SEZONOWYCH ===');
if (dateInfo.seasonalActivities) {
    const act = dateInfo.seasonalActivities;
    
    console.log('--- AKTYWNOŚCI CAŁOROCZNE ---');
    console.log(`Bieganie: ✅ TAK (uwaga na warunki sezonowe)`);
    console.log(`Wspinaczka na ściance: ${act.climbing_wall ? '✅ TAK' : '❌ NIE'}`);
    console.log(`Squash: ${act.squash ? '✅ TAK' : '❌ NIE'}`);
    console.log(`Pływanie (baseny kryte): ${act.swimming_indoor ? '✅ TAK' : '❌ NIE'}`);
    console.log(`Trening siłowy: ${act.strength_training ? '✅ TAK' : '❌ NIE'}`);
    
    console.log('');
    console.log('--- AKTYWNOŚCI SEZONOWE ---');
    
    // Kolarstwo
    if (act.cycling) {
        console.log(`Kolarstwo: ✅ TAK`);
    } else if (act.cycling_limited) {
        console.log(`Kolarstwo: ⚠️ OGRANICZONE (zależy od pogody)`);
    } else {
        console.log(`Kolarstwo: ❌ NIE (zbyt zimno/niebezpieczne)`);
    }
    
    // Skitouring
    if (act.skitouring) {
        console.log(`Skitouring: ✅ TAK`);
    } else if (act.skitouring_limited) {
        console.log(`Skitouring: ⚠️ OGRANICZONE (tylko wyższe partie gór)`);
    } else {
        console.log(`Skitouring: ❌ NIE (brak śniegu)`);
    }
    
    // Wspinaczka skałkowa
    if (act.rock_climbing) {
        console.log(`Wspinaczka skałkowa (na zewnątrz): ✅ TAK`);
    } else if (act.rock_climbing_limited) {
        console.log(`Wspinaczka skałkowa (na zewnątrz): ⚠️ OGRANICZONE (zależy od pogody)`);
    } else {
        console.log(`Wspinaczka skałkowa (na zewnątrz): ❌ NIE (zbyt zimno)`);
    }
    
    // Trekking
    if (act.trekking) {
        console.log(`Trekking w górach: ✅ TAK`);
    } else if (act.trekking_limited) {
        console.log(`Trekking w górach: ⚠️ OGRANICZONE (zależy od warunków)`);
    } else {
        console.log(`Trekking w górach: ⚠️ OGRANICZONE (zależy od warunków śniegowych)`);
    }
    
    // Pływanie baseny otwarte
    if (act.swimming_outdoor_pools) {
        console.log(`Pływanie (baseny otwarte): ✅ TAK`);
    } else if (act.swimming_outdoor_pools_limited) {
        console.log(`Pływanie (baseny otwarte): ⚠️ OGRANICZONE (niektóre zamknięte)`);
    } else {
        console.log(`Pływanie (baseny otwarte): ❌ NIE (zamknięte)`);
    }
    
    // Pływanie naturalne zbiorniki
    if (act.swimming_natural) {
        console.log(`Pływanie (naturalne zbiorniki): ✅ TAK`);
    } else if (act.swimming_natural_limited) {
        console.log(`Pływanie (naturalne zbiorniki): ⚠️ OGRANICZONE (zależy od temperatury)`);
    } else {
        console.log(`Pływanie (naturalne zbiorniki): ❌ NIE (zbyt zimno)`);
    }
}
console.log('');

// Pogoda (best-effort): pobierz prognozę i pokaż skrót na 7 dni (dzisiaj + 6)
try {
    execSync('node scripts/fetch_weather.js', { stdio: 'pipe' });
} catch (e) {
    // best-effort: brak netu/limit/itp. — pomijamy
}

try {
    const weatherPath = 'data/weather_forecast.json';
    if (fs.existsSync(weatherPath)) {
        const wf = JSON.parse(fs.readFileSync(weatherPath, 'utf-8'));
        const daily = wf?.daily || wf?.raw?.daily;
        if (daily && Array.isArray(daily.time)) {
            console.log('=== POGODA (Kraków, 7 dni) ===');
            daily.time.forEach((d, i) => {
                const tMin = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[i] : '';
                const tMax = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[i] : '';
                const pMm = Array.isArray(daily.precipitation_sum) ? daily.precipitation_sum[i] : '';
                const pProb = Array.isArray(daily.precipitation_probability_max) ? daily.precipitation_probability_max[i] : '';
                const wind = Array.isArray(daily.wind_speed_10m_max) ? daily.wind_speed_10m_max[i] : '';
                const code = Array.isArray(daily.weathercode) ? daily.weathercode[i] : '';
                const tempTxt = (tMin !== '' && tMax !== '') ? `${tMin}…${tMax}°C` : '';
                const precipTxt = (pMm !== '' || pProb !== '') ? `${pMm} mm (${pProb}%)` : '';
                const windTxt = wind !== '' ? `${wind} km/h` : '';
                console.log(`${d}: ${tempTxt}${precipTxt ? ` • opad ${precipTxt}` : ''}${windTxt ? ` • wiatr ${windTxt}` : ''}${code !== '' ? ` • kod ${code}` : ''}`);
            });
            console.log('');
        }
    }
} catch (e) {
    // best-effort
}

// Baseline (profil szczegółowy) - szybka informacja, że istnieje szerszy kontekst
if (fs.existsSync('docs/ATHLETE_DETAILED_PROFILE.txt')) {
    console.log('=== BAZA KONTEKSTU (PROFIL SZCZEGÓŁOWY) ===');
    console.log('Czytaj: docs/ATHLETE_DETAILED_PROFILE.txt');
    console.log('');
}

// Sprawdź czy istnieje training_log.csv
if (fs.existsSync('data/training_log.csv')) {
    const logContent = fs.readFileSync('data/training_log.csv', 'utf-8');
    const lines = logContent.trim().split('\n');
    console.log('=== OSTATNIE TRENINGI ===');
    if (lines.length > 1) {
        const header = parseCsvLine(lines[0]);
        const idxDate = header.indexOf('date');
        const idxSport = header.indexOf('sport');
        const idxType = header.indexOf('session_type');
        const idxDist = header.indexOf('distance_km');

        const lastEntries = lines.slice(-5); // Ostatnie 5 treningów (wraz z nagłówkiem jeśli jest mało danych)
        lastEntries.forEach(line => {
            if (line.trim()) {
                const values = parseCsvLine(line);
                const d = idxDate >= 0 ? values[idxDate] : values[0];
                const s = idxSport >= 0 ? values[idxSport] : (values[1] || '');
                const t = idxType >= 0 ? values[idxType] : (values[2] || '');
                const dist = idxDist >= 0 ? values[idxDist] : '';
                if (d && d !== 'date') {
                    console.log(`${d} - ${s} ${t} - ${dist || '?'} km`);
                }
            }
        });
    } else {
        console.log('Brak treningów w dzienniku');
    }
    console.log('');
}

// Sprawdź czy istnieją planowane aktywności (planned_sessions.csv)
if (fs.existsSync('data/planned_sessions.csv')) {
    const plannedContent = fs.readFileSync('data/planned_sessions.csv', 'utf-8');
    const lines = plannedContent.trim().split('\n');

    console.log('=== ZAPLANOWANE AKTYWNOŚCI ===');
    if (lines.length > 1) {
        const header = parseCsvLine(lines[0]);
        const idxDate = header.indexOf('date');
        const idxSport = header.indexOf('sport');
        const idxType = header.indexOf('session_type');
        const idxDur = header.indexOf('duration_min');

        const weekStart = dateInfo.weekStart;
        const weekEnd = dateInfo.weekEnd;
        const nextWeekStart = dateInfo.nextWeekStart;

        // end of next week = nextWeekStart + 6 days (YYYY-MM-DD lexicographic works)
        const nextWeekEnd = (() => {
            const d = new Date(nextWeekStart + 'T00:00:00Z');
            d.setUTCDate(d.getUTCDate() + 6);
            return d.toISOString().slice(0, 10);
        })();

        const plannedRows = lines.slice(1)
            .filter(l => l.trim())
            .map(l => parseCsvLine(l))
            .filter(values => {
                const d = idxDate >= 0 ? values[idxDate] : values[0];
                return d && d >= weekStart && d <= nextWeekEnd;
            })
            .sort((a, b) => {
                const da = idxDate >= 0 ? a[idxDate] : a[0];
                const db = idxDate >= 0 ? b[idxDate] : b[0];
                return da.localeCompare(db);
            });

        if (plannedRows.length === 0) {
            console.log('Brak planowanych aktywności w tym lub następnym tygodniu');
        } else {
            console.log(`Zakres: ${weekStart} → ${weekEnd} (ten tydzień) oraz ${nextWeekStart} → ${nextWeekEnd} (następny tydzień)`);
            plannedRows.forEach(values => {
                const d = idxDate >= 0 ? values[idxDate] : values[0];
                const s = idxSport >= 0 ? values[idxSport] : (values[1] || '');
                const t = idxType >= 0 ? values[idxType] : (values[2] || '');
                const dur = idxDur >= 0 ? values[idxDur] : '';
                const durTxt = dur ? `${dur} min` : '';
                console.log(`${d} - ${s} ${t}${durTxt ? ' - ' + durTxt : ''}`);
            });
        }
    } else {
        console.log('Brak danych (sam nagłówek)');
    }
    console.log('');
}

// Sprawdź czy istnieje aktualny plan (JSON/HTML)
if (fs.existsSync('index.html') || fs.existsSync('plans/current_plan.json')) {
    console.log('=== ISTNIEJE AKTUALNY PLAN ===');
    if (fs.existsSync('index.html')) console.log('Podgląd: index.html');
    if (fs.existsSync('plans/current_plan.json')) console.log('Źródło:  plans/current_plan.json');
    console.log('');
}

console.log('=== GOTOWE DO GENEROWANIA PLANU ===');

