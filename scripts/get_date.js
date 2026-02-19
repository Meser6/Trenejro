// Skrypt do odczytu aktualnej daty
// Uruchom: node get_date.js

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const dateString = `${year}-${month}-${day}`;

// Oblicz datę początku tygodnia (poniedziałek)
const dayOfWeek = now.getDay(); // 0 = niedziela, 1 = poniedziałek, etc.
const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
const monday = new Date(now);
monday.setDate(now.getDate() - daysToMonday);
const mondayYear = monday.getFullYear();
const mondayMonth = String(monday.getMonth() + 1).padStart(2, '0');
const mondayDay = String(monday.getDate()).padStart(2, '0');
const mondayString = `${mondayYear}-${mondayMonth}-${mondayDay}`;

// Oblicz datę końca tygodnia (niedziela)
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
const sundayYear = sunday.getFullYear();
const sundayMonth = String(sunday.getMonth() + 1).padStart(2, '0');
const sundayDay = String(sunday.getDate()).padStart(2, '0');
const sundayString = `${sundayYear}-${sundayMonth}-${sundayDay}`;

// Oblicz datę początku następnego tygodnia
const nextMonday = new Date(monday);
nextMonday.setDate(monday.getDate() + 7);
const nextMondayYear = nextMonday.getFullYear();
const nextMondayMonth = String(nextMonday.getMonth() + 1).padStart(2, '0');
const nextMondayDay = String(nextMonday.getDate()).padStart(2, '0');
const nextMondayString = `${nextMondayYear}-${nextMondayMonth}-${nextMondayDay}`;

// Określ porę roku/sezon
const monthNum = parseInt(month);
let season, seasonName;
if (monthNum >= 12 || monthNum <= 2) {
    season = 'winter';
    seasonName = 'Zima';
} else if (monthNum >= 3 && monthNum <= 5) {
    season = 'spring';
    seasonName = 'Wiosna';
} else if (monthNum >= 6 && monthNum <= 8) {
    season = 'summer';
    seasonName = 'Lato';
} else {
    season = 'autumn';
    seasonName = 'Jesień';
}

// Określ dostępność aktywności sezonowych na podstawie miesiąca
function getSeasonalActivities(monthNum) {
    return {
        // Aktywności całoroczne (zawsze dostępne)
        running: true,                    // Całoroczne, ale z uwagami sezonowymi
        climbing_wall: true,              // Wspinaczka na ściance - całoroczna (hala)
        squash: true,                     // Squash - całoroczny (hala)
        swimming_indoor: true,            // Pływanie w basenach krytych - całoroczne
        strength_training: true,         // Trening siłowy - całoroczny
        
        // Aktywności sezonowe
        cycling: (monthNum >= 4 && monthNum <= 10),  // Kwiecień-Październik (zależy od pogody)
        cycling_limited: (monthNum === 3 || monthNum === 11),  // Marzec/Listopad - ograniczone
        
        skitouring: (monthNum === 12 || monthNum === 1 || monthNum === 2 || monthNum === 3),  // Grudzień-Marzec
        skitouring_limited: (monthNum === 4),  // Kwiecień - tylko wyższe partie
        
        rock_climbing: (monthNum >= 5 && monthNum <= 10),  // Maj-Październik
        rock_climbing_limited: (monthNum === 4 || monthNum === 11),  // Kwiecień/Listopad - ograniczone
        
        trekking: (monthNum >= 4 && monthNum <= 10),  // Kwiecień-Październik
        trekking_limited: (monthNum === 3 || monthNum === 11),  // Marzec/Listopad - ograniczone
        
        swimming_outdoor_pools: (monthNum >= 6 && monthNum <= 9),  // Czerwiec-Wrzesień
        swimming_outdoor_pools_limited: (monthNum === 5 || monthNum === 10),  // Maj/Październik - ograniczone
        
        swimming_natural: (monthNum >= 7 && monthNum <= 8),  // Lipiec-Sierpień
        swimming_natural_limited: (monthNum === 6 || monthNum === 9)  // Czerwiec/Wrzesień - ograniczone
    };
}

const seasonalActivities = getSeasonalActivities(monthNum);

const activities = getSeasonalActivities(monthNum);

console.log(JSON.stringify({
    today: dateString,
    weekStart: mondayString,
    weekEnd: sundayString,
    nextWeekStart: nextMondayString,
    year: year,
    month: month,
    day: day,
    dayOfWeek: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'][dayOfWeek],
    season: season,
    seasonName: seasonName,
    seasonalActivities: activities
}));

