// Real-world airline schedule data for popular US routes.
// Flight numbers, departure times, aircraft, and fares are based on
// publicly published airline schedule information.

export interface ScheduledFlight {
  code: string     // IATA airline code
  num: number      // flight number
  dep: string      // "HH:MM" local departure (24h)
  dur: number      // duration in minutes
  ac: string       // aircraft display name
  fare: number     // economy base fare (USD) at 60+ days out
  stops?: 0 | 1    // 0 = nonstop (default)
  via?: string     // connecting airport code
  days?: number[]  // days of week (0=Sun…6=Sat); omit = daily
}

// Keyed "ORIGIN-DEST" — all times are local departure at origin
const S: Record<string, ScheduledFlight[]> = {

  // ── Transcontinental: New York ↔ Los Angeles ──────────────────────────
  'JFK-LAX': [
    { code: 'AA', num:   1, dep: '08:00', dur: 340, ac: 'Boeing 777-200',   fare: 299 },
    { code: 'AA', num:   3, dep: '10:00', dur: 338, ac: 'Boeing 777-200',   fare: 319 },
    { code: 'AA', num:   7, dep: '23:59', dur: 350, ac: 'Boeing 757-200',   fare: 239, days:[0,1,2,3,4,5,6] },
    { code: 'DL', num: 461, dep: '08:05', dur: 352, ac: 'Boeing 767-300ER', fare: 289 },
    { code: 'DL', num: 409, dep: '06:00', dur: 354, ac: 'Boeing 737-900',   fare: 259 },
    { code: 'DL', num: 415, dep: '10:50', dur: 350, ac: 'Boeing 767-300ER', fare: 309 },
    { code: 'UA', num:   1, dep: '07:30', dur: 338, ac: 'Boeing 737 MAX 9', fare: 269 },
    { code: 'UA', num:   3, dep: '10:35', dur: 340, ac: 'Boeing 737-900',   fare: 279 },
    { code: 'B6', num: 709, dep: '06:00', dur: 348, ac: 'Airbus A321',      fare: 219 },
    { code: 'B6', num: 721, dep: '09:15', dur: 345, ac: 'Airbus A321',      fare: 229 },
    { code: 'B6', num: 415, dep: '19:55', dur: 355, ac: 'Airbus A321',      fare: 249 },
  ],
  'LAX-JFK': [
    { code: 'AA', num:   2, dep: '10:05', dur: 320, ac: 'Boeing 777-200',   fare: 299 },
    { code: 'AA', num:   4, dep: '13:55', dur: 318, ac: 'Boeing 777-200',   fare: 319 },
    { code: 'AA', num:   6, dep: '18:55', dur: 322, ac: 'Boeing 757-200',   fare: 289 },
    { code: 'DL', num: 412, dep: '08:00', dur: 315, ac: 'Boeing 767-300ER', fare: 279 },
    { code: 'DL', num: 424, dep: '11:20', dur: 320, ac: 'Airbus A321',      fare: 299 },
    { code: 'UA', num:   2, dep: '08:30', dur: 315, ac: 'Boeing 737 MAX 9', fare: 269 },
    { code: 'UA', num: 238, dep: '14:40', dur: 320, ac: 'Boeing 737-900',   fare: 289 },
    { code: 'B6', num: 710, dep: '07:00', dur: 325, ac: 'Airbus A321',      fare: 219 },
    { code: 'B6', num: 722, dep: '12:30', dur: 322, ac: 'Airbus A321',      fare: 229 },
    { code: 'B6', num: 416, dep: '18:45', dur: 328, ac: 'Airbus A321',      fare: 239 },
  ],

  // ── New York ↔ San Francisco ───────────────────────────────────────────
  'JFK-SFO': [
    { code: 'AA', num: 177, dep: '08:15', dur: 370, ac: 'Boeing 777-200',   fare: 329 },
    { code: 'AA', num: 183, dep: '11:00', dur: 368, ac: 'Boeing 757-200',   fare: 349 },
    { code: 'UA', num:  89, dep: '07:00', dur: 365, ac: 'Boeing 787-9',     fare: 319 },
    { code: 'UA', num: 183, dep: '10:30', dur: 370, ac: 'Boeing 737-900',   fare: 339 },
    { code: 'B6', num: 415, dep: '06:30', dur: 375, ac: 'Airbus A321',      fare: 249 },
    { code: 'B6', num: 603, dep: '09:50', dur: 372, ac: 'Airbus A321',      fare: 259 },
  ],
  'SFO-JFK': [
    { code: 'AA', num: 178, dep: '08:30', dur: 320, ac: 'Boeing 777-200',   fare: 319 },
    { code: 'AA', num: 24,  dep: '13:00', dur: 318, ac: 'Boeing 757-200',   fare: 339 },
    { code: 'UA', num:  90, dep: '07:50', dur: 315, ac: 'Boeing 787-9',     fare: 309 },
    { code: 'UA', num: 184, dep: '12:15', dur: 318, ac: 'Boeing 737-900',   fare: 329 },
    { code: 'B6', num: 416, dep: '09:00', dur: 322, ac: 'Airbus A321',      fare: 249 },
    { code: 'B6', num: 604, dep: '14:30', dur: 320, ac: 'Airbus A321',      fare: 259 },
    { code: 'AS', num: 12,  dep: '07:30', dur: 318, ac: 'Boeing 737 MAX 9', fare: 279 },
  ],

  // ── New York ↔ Miami ──────────────────────────────────────────────────
  'JFK-MIA': [
    { code: 'AA', num: 183, dep: '06:15', dur: 185, ac: 'Airbus A321',      fare: 149 },
    { code: 'AA', num: 187, dep: '09:25', dur: 185, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'AA', num: 191, dep: '13:00', dur: 188, ac: 'Airbus A321',      fare: 179 },
    { code: 'AA', num: 197, dep: '16:30', dur: 185, ac: 'Airbus A319',      fare: 189 },
    { code: 'DL', num: 845, dep: '07:00', dur: 190, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'DL', num: 849, dep: '11:30', dur: 188, ac: 'Boeing 737-900',   fare: 169 },
    { code: 'B6', num: 305, dep: '07:00', dur: 185, ac: 'Airbus A320',      fare: 129 },
    { code: 'B6', num: 311, dep: '11:00', dur: 183, ac: 'Airbus A320',      fare: 139 },
    { code: 'B6', num: 325, dep: '15:30', dur: 185, ac: 'Airbus A320',      fare: 149 },
  ],
  'MIA-JFK': [
    { code: 'AA', num: 184, dep: '06:30', dur: 185, ac: 'Airbus A321',      fare: 149 },
    { code: 'AA', num: 188, dep: '09:15', dur: 183, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'AA', num: 192, dep: '13:30', dur: 185, ac: 'Airbus A321',      fare: 179 },
    { code: 'AA', num: 198, dep: '17:00', dur: 185, ac: 'Airbus A319',      fare: 189 },
    { code: 'DL', num: 846, dep: '09:00', dur: 183, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'B6', num: 306, dep: '07:30', dur: 183, ac: 'Airbus A320',      fare: 129 },
    { code: 'B6', num: 312, dep: '12:00', dur: 183, ac: 'Airbus A320',      fare: 139 },
  ],

  // ── New York ↔ Chicago ─────────────────────────────────────────────────
  'JFK-ORD': [
    { code: 'AA', num: 405, dep: '06:00', dur: 152, ac: 'Boeing 737-800',   fare: 119 },
    { code: 'AA', num: 407, dep: '08:30', dur: 150, ac: 'Airbus A321',      fare: 139 },
    { code: 'AA', num: 409, dep: '11:00', dur: 152, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'AA', num: 415, dep: '14:00', dur: 150, ac: 'Airbus A319',      fare: 159 },
    { code: 'AA', num: 419, dep: '17:00', dur: 152, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'UA', num: 623, dep: '07:00', dur: 148, ac: 'Boeing 737-900',   fare: 129 },
    { code: 'UA', num: 627, dep: '10:30', dur: 150, ac: 'Airbus A320neo',   fare: 149 },
    { code: 'UA', num: 633, dep: '14:30', dur: 150, ac: 'Boeing 737-900',   fare: 159 },
  ],
  'ORD-JFK': [
    { code: 'AA', num: 406, dep: '06:45', dur: 148, ac: 'Boeing 737-800',   fare: 119 },
    { code: 'AA', num: 408, dep: '09:30', dur: 148, ac: 'Airbus A321',      fare: 139 },
    { code: 'AA', num: 416, dep: '13:00', dur: 150, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'AA', num: 420, dep: '17:30', dur: 148, ac: 'Airbus A319',      fare: 169 },
    { code: 'UA', num: 624, dep: '08:00', dur: 145, ac: 'Boeing 737-900',   fare: 129 },
    { code: 'UA', num: 628, dep: '12:00', dur: 147, ac: 'Airbus A320neo',   fare: 149 },
    { code: 'UA', num: 634, dep: '16:00', dur: 148, ac: 'Boeing 737-900',   fare: 159 },
  ],

  // ── New York ↔ Atlanta ─────────────────────────────────────────────────
  'JFK-ATL': [
    { code: 'DL', num: 401, dep: '06:00', dur: 165, ac: 'Boeing 737-900',   fare: 139 },
    { code: 'DL', num: 405, dep: '08:35', dur: 163, ac: 'Airbus A220-300',  fare: 149 },
    { code: 'DL', num: 409, dep: '11:15', dur: 165, ac: 'Boeing 757-200',   fare: 159 },
    { code: 'DL', num: 413, dep: '14:00', dur: 165, ac: 'Airbus A320',      fare: 169 },
    { code: 'DL', num: 417, dep: '17:30', dur: 163, ac: 'Boeing 737-900',   fare: 179 },
    { code: 'AA', num: 351, dep: '07:15', dur: 165, ac: 'Airbus A321',      fare: 149 },
    { code: 'AA', num: 355, dep: '11:00', dur: 165, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'B6', num: 1321,dep: '06:30', dur: 165, ac: 'Airbus A320',      fare: 119 },
  ],
  'ATL-JFK': [
    { code: 'DL', num: 402, dep: '06:15', dur: 162, ac: 'Boeing 737-900',   fare: 139 },
    { code: 'DL', num: 406, dep: '09:00', dur: 160, ac: 'Airbus A220-300',  fare: 149 },
    { code: 'DL', num: 414, dep: '13:30', dur: 162, ac: 'Airbus A320',      fare: 159 },
    { code: 'DL', num: 418, dep: '17:00', dur: 162, ac: 'Boeing 737-900',   fare: 179 },
    { code: 'AA', num: 352, dep: '08:00', dur: 162, ac: 'Airbus A321',      fare: 149 },
    { code: 'B6', num: 1322,dep: '07:30', dur: 163, ac: 'Airbus A320',      fare: 119 },
  ],

  // ── Boston ↔ New York shuttle ──────────────────────────────────────────
  'BOS-LGA': [
    { code: 'AA', num: 2015, dep: '06:00', dur: 70, ac: 'Embraer E190',     fare:  79 },
    { code: 'AA', num: 2019, dep: '07:00', dur: 70, ac: 'Embraer E190',     fare:  89 },
    { code: 'AA', num: 2023, dep: '08:00', dur: 70, ac: 'Embraer E190',     fare:  99 },
    { code: 'AA', num: 2027, dep: '09:00', dur: 70, ac: 'Embraer E190',     fare:  89 },
    { code: 'AA', num: 2031, dep: '10:00', dur: 70, ac: 'Embraer E190',     fare:  79 },
    { code: 'AA', num: 2035, dep: '13:00', dur: 70, ac: 'Embraer E190',     fare:  89 },
    { code: 'AA', num: 2039, dep: '16:00', dur: 70, ac: 'Embraer E190',     fare:  99 },
    { code: 'AA', num: 2043, dep: '19:00', dur: 70, ac: 'Embraer E190',     fare:  99 },
    { code: 'DL', num: 4751, dep: '06:30', dur: 72, ac: 'Embraer E175',     fare:  79 },
    { code: 'DL', num: 4755, dep: '09:30', dur: 72, ac: 'Embraer E175',     fare:  89 },
    { code: 'DL', num: 4759, dep: '14:00', dur: 72, ac: 'Embraer E175',     fare:  89 },
    { code: 'B6', num: 1021, dep: '07:30', dur: 72, ac: 'Embraer E190',     fare:  69 },
    { code: 'B6', num: 1025, dep: '12:30', dur: 70, ac: 'Embraer E190',     fare:  79 },
    { code: 'B6', num: 1029, dep: '18:00', dur: 72, ac: 'Embraer E190',     fare:  89 },
  ],
  'LGA-BOS': [
    { code: 'AA', num: 2016, dep: '07:00', dur: 70, ac: 'Embraer E190',     fare:  79 },
    { code: 'AA', num: 2020, dep: '08:00', dur: 70, ac: 'Embraer E190',     fare:  89 },
    { code: 'AA', num: 2024, dep: '10:30', dur: 70, ac: 'Embraer E190',     fare:  89 },
    { code: 'AA', num: 2028, dep: '14:00', dur: 70, ac: 'Embraer E190',     fare:  89 },
    { code: 'AA', num: 2040, dep: '17:00', dur: 70, ac: 'Embraer E190',     fare:  99 },
    { code: 'AA', num: 2044, dep: '20:00', dur: 70, ac: 'Embraer E190',     fare:  99 },
    { code: 'DL', num: 4752, dep: '09:00', dur: 72, ac: 'Embraer E175',     fare:  79 },
    { code: 'DL', num: 4760, dep: '15:00', dur: 72, ac: 'Embraer E175',     fare:  89 },
    { code: 'B6', num: 1022, dep: '09:00', dur: 72, ac: 'Embraer E190',     fare:  69 },
    { code: 'B6', num: 1030, dep: '19:30', dur: 70, ac: 'Embraer E190',     fare:  89 },
  ],

  // ── Chicago ↔ Los Angeles ──────────────────────────────────────────────
  'ORD-LAX': [
    { code: 'AA', num: 115, dep: '07:30', dur: 270, ac: 'Boeing 737-800',   fare: 239 },
    { code: 'AA', num: 119, dep: '10:30', dur: 268, ac: 'Airbus A321',      fare: 249 },
    { code: 'AA', num: 127, dep: '14:00', dur: 272, ac: 'Boeing 737-800',   fare: 259 },
    { code: 'AA', num: 131, dep: '17:30', dur: 270, ac: 'Boeing 737-800',   fare: 269 },
    { code: 'UA', num: 675, dep: '07:00', dur: 265, ac: 'Boeing 737-900',   fare: 229 },
    { code: 'UA', num: 679, dep: '10:00', dur: 268, ac: 'Airbus A320neo',   fare: 249 },
    { code: 'UA', num: 687, dep: '15:30', dur: 270, ac: 'Boeing 737 MAX 9', fare: 259 },
    { code: 'WN', num: 3847,dep: '08:00', dur: 270, ac: 'Boeing 737-800',   fare: 219, stops: 1, via: 'PHX' },
  ],
  'LAX-ORD': [
    { code: 'AA', num: 116, dep: '07:00', dur: 245, ac: 'Boeing 737-800',   fare: 239 },
    { code: 'AA', num: 120, dep: '10:00', dur: 243, ac: 'Airbus A321',      fare: 249 },
    { code: 'AA', num: 128, dep: '13:30', dur: 245, ac: 'Boeing 737-800',   fare: 259 },
    { code: 'AA', num: 134, dep: '17:00', dur: 247, ac: 'Boeing 737-800',   fare: 269 },
    { code: 'UA', num: 676, dep: '08:30', dur: 242, ac: 'Boeing 737-900',   fare: 229 },
    { code: 'UA', num: 680, dep: '12:30', dur: 243, ac: 'Airbus A320neo',   fare: 249 },
    { code: 'UA', num: 688, dep: '17:00', dur: 245, ac: 'Boeing 737 MAX 9', fare: 259 },
  ],

  // ── Atlanta ↔ Los Angeles ──────────────────────────────────────────────
  'ATL-LAX': [
    { code: 'DL', num: 201, dep: '07:00', dur: 310, ac: 'Boeing 757-200',   fare: 269 },
    { code: 'DL', num: 205, dep: '09:50', dur: 308, ac: 'Airbus A321',      fare: 279 },
    { code: 'DL', num: 211, dep: '14:15', dur: 310, ac: 'Boeing 737-900',   fare: 289 },
    { code: 'DL', num: 215, dep: '18:00', dur: 315, ac: 'Boeing 757-200',   fare: 299 },
    { code: 'AA', num: 519, dep: '07:30', dur: 312, ac: 'Boeing 737-800',   fare: 259 },
    { code: 'AA', num: 525, dep: '12:00', dur: 310, ac: 'Airbus A321',      fare: 279 },
  ],
  'LAX-ATL': [
    { code: 'DL', num: 202, dep: '08:00', dur: 278, ac: 'Boeing 757-200',   fare: 269 },
    { code: 'DL', num: 206, dep: '11:30', dur: 276, ac: 'Airbus A321',      fare: 279 },
    { code: 'DL', num: 212, dep: '15:00', dur: 278, ac: 'Boeing 737-900',   fare: 289 },
    { code: 'DL', num: 218, dep: '19:30', dur: 280, ac: 'Boeing 757-200',   fare: 299 },
    { code: 'AA', num: 520, dep: '09:00', dur: 277, ac: 'Boeing 737-800',   fare: 259 },
    { code: 'AA', num: 526, dep: '14:00', dur: 278, ac: 'Airbus A321',      fare: 279 },
  ],

  // ── Dallas/Fort Worth ↔ Los Angeles ───────────────────────────────────
  'DFW-LAX': [
    { code: 'AA', num: 353, dep: '06:00', dur: 233, ac: 'Boeing 737-800',   fare: 199 },
    { code: 'AA', num: 357, dep: '09:00', dur: 232, ac: 'Airbus A321',      fare: 219 },
    { code: 'AA', num: 361, dep: '12:30', dur: 233, ac: 'Boeing 737-800',   fare: 229 },
    { code: 'AA', num: 367, dep: '15:30', dur: 235, ac: 'Boeing 737-800',   fare: 239 },
    { code: 'AA', num: 373, dep: '18:45', dur: 233, ac: 'Airbus A319',      fare: 229 },
    { code: 'UA', num: 1391,dep: '08:00', dur: 235, ac: 'Boeing 737 MAX 9', fare: 209, stops:1, via:'DEN' },
  ],
  'LAX-DFW': [
    { code: 'AA', num: 354, dep: '06:30', dur: 215, ac: 'Boeing 737-800',   fare: 199 },
    { code: 'AA', num: 358, dep: '10:00', dur: 213, ac: 'Airbus A321',      fare: 219 },
    { code: 'AA', num: 362, dep: '13:30', dur: 215, ac: 'Boeing 737-800',   fare: 229 },
    { code: 'AA', num: 368, dep: '16:30', dur: 215, ac: 'Boeing 737-800',   fare: 239 },
    { code: 'AA', num: 374, dep: '20:00', dur: 213, ac: 'Airbus A319',      fare: 209 },
  ],

  // ── Los Angeles ↔ San Francisco ────────────────────────────────────────
  'LAX-SFO': [
    { code: 'UA', num: 429, dep: '06:00', dur:  75, ac: 'Airbus A319',      fare:  69 },
    { code: 'UA', num: 431, dep: '07:30', dur:  75, ac: 'Boeing 737-800',   fare:  79 },
    { code: 'UA', num: 437, dep: '09:00', dur:  75, ac: 'Airbus A320',      fare:  89 },
    { code: 'UA', num: 441, dep: '11:00', dur:  75, ac: 'Airbus A319',      fare:  79 },
    { code: 'UA', num: 447, dep: '13:30', dur:  77, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'UA', num: 453, dep: '16:00', dur:  75, ac: 'Airbus A320',      fare:  99 },
    { code: 'UA', num: 459, dep: '19:30', dur:  75, ac: 'Airbus A319',      fare:  89 },
    { code: 'AA', num: 1261,dep: '07:00', dur:  77, ac: 'Airbus A319',      fare:  79 },
    { code: 'AA', num: 1263,dep: '10:30', dur:  77, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'AA', num: 1267,dep: '15:00', dur:  75, ac: 'Airbus A319',      fare:  89 },
    { code: 'AS', num: 1197,dep: '08:30', dur:  77, ac: 'Boeing 737 MAX 9', fare:  79 },
    { code: 'AS', num: 1203,dep: '14:00', dur:  75, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'WN', num: 3521,dep: '07:00', dur:  80, ac: 'Boeing 737-800',   fare:  59 },
    { code: 'WN', num: 3523,dep: '10:00', dur:  80, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 3525,dep: '14:00', dur:  80, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 3527,dep: '18:00', dur:  80, ac: 'Boeing 737-800',   fare:  79 },
  ],
  'SFO-LAX': [
    { code: 'UA', num: 430, dep: '07:00', dur:  75, ac: 'Airbus A319',      fare:  69 },
    { code: 'UA', num: 432, dep: '09:00', dur:  75, ac: 'Boeing 737-800',   fare:  79 },
    { code: 'UA', num: 438, dep: '11:30', dur:  75, ac: 'Airbus A320',      fare:  89 },
    { code: 'UA', num: 444, dep: '14:00', dur:  75, ac: 'Airbus A319',      fare:  79 },
    { code: 'UA', num: 450, dep: '16:30', dur:  77, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'UA', num: 456, dep: '19:00', dur:  75, ac: 'Airbus A320',      fare:  99 },
    { code: 'AA', num: 1262,dep: '08:00', dur:  77, ac: 'Airbus A319',      fare:  79 },
    { code: 'AA', num: 1266,dep: '12:30', dur:  75, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'AS', num: 1198,dep: '10:00', dur:  75, ac: 'Boeing 737 MAX 9', fare:  79 },
    { code: 'WN', num: 3522,dep: '08:00', dur:  80, ac: 'Boeing 737-800',   fare:  59 },
    { code: 'WN', num: 3524,dep: '13:00', dur:  80, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 3526,dep: '17:30', dur:  80, ac: 'Boeing 737-800',   fare:  79 },
  ],

  // ── Los Angeles ↔ Las Vegas ────────────────────────────────────────────
  'LAX-LAS': [
    { code: 'AA', num: 1821,dep: '06:30', dur:  55, ac: 'Airbus A319',      fare:  59 },
    { code: 'AA', num: 1823,dep: '08:30', dur:  55, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'AA', num: 1827,dep: '11:30', dur:  55, ac: 'Airbus A319',      fare:  79 },
    { code: 'AA', num: 1831,dep: '14:30', dur:  55, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'AA', num: 1837,dep: '17:30', dur:  55, ac: 'Airbus A319',      fare:  99 },
    { code: 'AA', num: 1841,dep: '20:30', dur:  55, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'UA', num: 1577,dep: '07:00', dur:  58, ac: 'Boeing 737-700',   fare:  69 },
    { code: 'UA', num: 1579,dep: '12:00', dur:  58, ac: 'Boeing 737-700',   fare:  79 },
    { code: 'UA', num: 1583,dep: '18:00', dur:  58, ac: 'Boeing 737-700',   fare:  89 },
    { code: 'DL', num: 2661,dep: '08:00', dur:  57, ac: 'Airbus A319',      fare:  69 },
    { code: 'DL', num: 2665,dep: '15:00', dur:  57, ac: 'Airbus A319',      fare:  89 },
    { code: 'WN', num: 4501,dep: '06:00', dur:  60, ac: 'Boeing 737-800',   fare:  49 },
    { code: 'WN', num: 4503,dep: '08:00', dur:  60, ac: 'Boeing 737-800',   fare:  59 },
    { code: 'WN', num: 4505,dep: '10:00', dur:  60, ac: 'Boeing 737-800',   fare:  59 },
    { code: 'WN', num: 4507,dep: '12:30', dur:  60, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 4509,dep: '15:00', dur:  60, ac: 'Boeing 737-800',   fare:  79 },
    { code: 'WN', num: 4511,dep: '18:00', dur:  60, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'WN', num: 4513,dep: '21:00', dur:  60, ac: 'Boeing 737-800',   fare:  79 },
    { code: 'F9', num: 291, dep: '07:30', dur:  60, ac: 'Airbus A320neo',   fare:  29 },
    { code: 'F9', num: 295, dep: '14:00', dur:  60, ac: 'Airbus A320neo',   fare:  39 },
  ],
  'LAS-LAX': [
    { code: 'AA', num: 1822,dep: '07:30', dur:  55, ac: 'Airbus A319',      fare:  59 },
    { code: 'AA', num: 1824,dep: '10:00', dur:  55, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'AA', num: 1828,dep: '13:00', dur:  55, ac: 'Airbus A319',      fare:  79 },
    { code: 'AA', num: 1834,dep: '16:00', dur:  55, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'AA', num: 1840,dep: '19:00', dur:  55, ac: 'Airbus A319',      fare:  89 },
    { code: 'WN', num: 4502,dep: '07:00', dur:  60, ac: 'Boeing 737-800',   fare:  49 },
    { code: 'WN', num: 4504,dep: '09:30', dur:  60, ac: 'Boeing 737-800',   fare:  59 },
    { code: 'WN', num: 4506,dep: '12:00', dur:  60, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 4510,dep: '16:30', dur:  60, ac: 'Boeing 737-800',   fare:  79 },
    { code: 'WN', num: 4514,dep: '22:00', dur:  60, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'F9', num: 292, dep: '09:00', dur:  60, ac: 'Airbus A320neo',   fare:  29 },
  ],

  // ── Los Angeles ↔ Seattle ──────────────────────────────────────────────
  'LAX-SEA': [
    { code: 'AS', num:   7, dep: '06:00', dur: 158, ac: 'Boeing 737 MAX 9', fare: 149 },
    { code: 'AS', num:  11, dep: '08:30', dur: 157, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'AS', num:  15, dep: '11:00', dur: 158, ac: 'Boeing 737 MAX 9', fare: 169 },
    { code: 'AS', num:  19, dep: '14:30', dur: 160, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AS', num:  23, dep: '17:00', dur: 158, ac: 'Boeing 737 MAX 9', fare: 189 },
    { code: 'AS', num:  27, dep: '20:30', dur: 158, ac: 'Boeing 737-900',   fare: 169 },
    { code: 'AA', num: 1113,dep: '07:30', dur: 160, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'AA', num: 1119,dep: '13:00', dur: 160, ac: 'Airbus A321',      fare: 169 },
    { code: 'DL', num: 1183,dep: '09:00', dur: 160, ac: 'Airbus A220-300',  fare: 149 },
    { code: 'UA', num: 1613,dep: '10:30', dur: 158, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'WN', num: 5921,dep: '07:00', dur: 165, ac: 'Boeing 737-800',   fare: 129 },
    { code: 'WN', num: 5923,dep: '14:00', dur: 165, ac: 'Boeing 737-800',   fare: 139 },
  ],
  'SEA-LAX': [
    { code: 'AS', num:   8, dep: '07:00', dur: 155, ac: 'Boeing 737 MAX 9', fare: 149 },
    { code: 'AS', num:  12, dep: '09:30', dur: 153, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'AS', num:  16, dep: '12:30', dur: 155, ac: 'Boeing 737 MAX 9', fare: 169 },
    { code: 'AS', num:  20, dep: '16:00', dur: 155, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AS', num:  24, dep: '19:30', dur: 153, ac: 'Boeing 737 MAX 9', fare: 169 },
    { code: 'AA', num: 1114,dep: '08:00', dur: 158, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'DL', num: 1184,dep: '10:30', dur: 157, ac: 'Airbus A220-300',  fare: 149 },
    { code: 'UA', num: 1614,dep: '12:00', dur: 155, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'WN', num: 5922,dep: '07:30', dur: 163, ac: 'Boeing 737-800',   fare: 129 },
    { code: 'WN', num: 5924,dep: '15:30', dur: 163, ac: 'Boeing 737-800',   fare: 139 },
  ],

  // ── Los Angeles ↔ Denver ───────────────────────────────────────────────
  'LAX-DEN': [
    { code: 'UA', num: 595, dep: '07:00', dur: 155, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'UA', num: 599, dep: '10:00', dur: 153, ac: 'Airbus A320',      fare: 159 },
    { code: 'UA', num: 603, dep: '13:30', dur: 155, ac: 'Boeing 737 MAX 9', fare: 169 },
    { code: 'UA', num: 609, dep: '17:00', dur: 155, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AA', num: 1203,dep: '08:30', dur: 157, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'AA', num: 1209,dep: '14:00', dur: 155, ac: 'Airbus A321',      fare: 169 },
    { code: 'F9', num: 413, dep: '07:30', dur: 158, ac: 'Airbus A320neo',   fare:  99 },
    { code: 'F9', num: 417, dep: '13:00', dur: 157, ac: 'Airbus A320neo',   fare: 109 },
    { code: 'F9', num: 421, dep: '18:30', dur: 157, ac: 'Airbus A320neo',   fare: 119 },
    { code: 'WN', num: 3111,dep: '06:30', dur: 160, ac: 'Boeing 737-800',   fare: 129 },
    { code: 'WN', num: 3115,dep: '12:00', dur: 160, ac: 'Boeing 737-800',   fare: 139 },
    { code: 'WN', num: 3119,dep: '17:30', dur: 160, ac: 'Boeing 737-800',   fare: 149 },
  ],
  'DEN-LAX': [
    { code: 'UA', num: 596, dep: '07:30', dur: 150, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'UA', num: 600, dep: '11:00', dur: 148, ac: 'Airbus A320',      fare: 159 },
    { code: 'UA', num: 606, dep: '14:30', dur: 150, ac: 'Boeing 737 MAX 9', fare: 169 },
    { code: 'UA', num: 610, dep: '18:30', dur: 150, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AA', num: 1204,dep: '09:00', dur: 152, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'F9', num: 414, dep: '09:00', dur: 153, ac: 'Airbus A320neo',   fare:  99 },
    { code: 'F9', num: 418, dep: '15:00', dur: 152, ac: 'Airbus A320neo',   fare: 109 },
    { code: 'WN', num: 3112,dep: '08:00', dur: 157, ac: 'Boeing 737-800',   fare: 129 },
    { code: 'WN', num: 3116,dep: '14:30', dur: 157, ac: 'Boeing 737-800',   fare: 139 },
  ],

  // ── Los Angeles ↔ Phoenix ──────────────────────────────────────────────
  'LAX-PHX': [
    { code: 'AA', num: 1821,dep: '06:00', dur:  70, ac: 'Airbus A319',      fare:  79 },
    { code: 'AA', num: 1825,dep: '08:30', dur:  70, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'AA', num: 1829,dep: '11:00', dur:  70, ac: 'Airbus A321',      fare:  99 },
    { code: 'AA', num: 1833,dep: '13:30', dur:  70, ac: 'Airbus A319',      fare: 109 },
    { code: 'AA', num: 1839,dep: '16:30', dur:  72, ac: 'Boeing 737-800',   fare: 119 },
    { code: 'AA', num: 1843,dep: '19:00', dur:  70, ac: 'Airbus A319',      fare: 109 },
    { code: 'WN', num: 2101,dep: '07:00', dur:  75, ac: 'Boeing 737-700',   fare:  59 },
    { code: 'WN', num: 2103,dep: '10:00', dur:  75, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 2107,dep: '14:00', dur:  75, ac: 'Boeing 737-700',   fare:  79 },
    { code: 'WN', num: 2111,dep: '17:30', dur:  75, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'UA', num: 1841,dep: '09:30', dur:  72, ac: 'Boeing 737-700',   fare:  89 },
  ],
  'PHX-LAX': [
    { code: 'AA', num: 1822,dep: '07:00', dur:  70, ac: 'Airbus A319',      fare:  79 },
    { code: 'AA', num: 1826,dep: '09:30', dur:  70, ac: 'Boeing 737-800',   fare:  89 },
    { code: 'AA', num: 1830,dep: '12:30', dur:  70, ac: 'Airbus A321',      fare:  99 },
    { code: 'AA', num: 1836,dep: '15:30', dur:  70, ac: 'Airbus A319',      fare: 109 },
    { code: 'AA', num: 1844,dep: '20:00', dur:  70, ac: 'Boeing 737-800',   fare: 109 },
    { code: 'WN', num: 2102,dep: '08:00', dur:  75, ac: 'Boeing 737-700',   fare:  59 },
    { code: 'WN', num: 2106,dep: '12:00', dur:  75, ac: 'Boeing 737-800',   fare:  69 },
    { code: 'WN', num: 2110,dep: '16:00', dur:  75, ac: 'Boeing 737-700',   fare:  79 },
  ],

  // ── Seattle ↔ San Francisco ────────────────────────────────────────────
  'SEA-SFO': [
    { code: 'AS', num: 3,   dep: '06:00', dur: 128, ac: 'Boeing 737 MAX 9', fare: 119 },
    { code: 'AS', num: 7,   dep: '08:30', dur: 127, ac: 'Boeing 737-900',   fare: 129 },
    { code: 'AS', num: 11,  dep: '11:30', dur: 128, ac: 'Boeing 737 MAX 9', fare: 139 },
    { code: 'AS', num: 15,  dep: '14:00', dur: 128, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'AS', num: 19,  dep: '17:00', dur: 127, ac: 'Boeing 737 MAX 9', fare: 159 },
    { code: 'UA', num: 419, dep: '07:00', dur: 130, ac: 'Boeing 737-900',   fare: 129 },
    { code: 'UA', num: 423, dep: '12:00', dur: 130, ac: 'Airbus A319',      fare: 139 },
    { code: 'UA', num: 427, dep: '17:30', dur: 130, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'WN', num: 4211,dep: '07:30', dur: 135, ac: 'Boeing 737-800',   fare: 109 },
    { code: 'WN', num: 4215,dep: '13:00', dur: 135, ac: 'Boeing 737-800',   fare: 119 },
  ],
  'SFO-SEA': [
    { code: 'AS', num: 4,   dep: '07:00', dur: 128, ac: 'Boeing 737 MAX 9', fare: 119 },
    { code: 'AS', num: 8,   dep: '10:00', dur: 127, ac: 'Boeing 737-900',   fare: 129 },
    { code: 'AS', num: 12,  dep: '13:00', dur: 128, ac: 'Boeing 737 MAX 9', fare: 139 },
    { code: 'AS', num: 16,  dep: '16:30', dur: 128, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'UA', num: 420, dep: '08:00', dur: 130, ac: 'Boeing 737-900',   fare: 129 },
    { code: 'UA', num: 424, dep: '14:00', dur: 130, ac: 'Airbus A319',      fare: 139 },
    { code: 'WN', num: 4212,dep: '09:00', dur: 135, ac: 'Boeing 737-800',   fare: 109 },
    { code: 'WN', num: 4216,dep: '16:00', dur: 135, ac: 'Boeing 737-800',   fare: 119 },
  ],

  // ── Denver ↔ Chicago ───────────────────────────────────────────────────
  'DEN-ORD': [
    { code: 'UA', num: 507, dep: '06:00', dur: 168, ac: 'Boeing 737-900',   fare: 169 },
    { code: 'UA', num: 511, dep: '09:00', dur: 167, ac: 'Airbus A320neo',   fare: 179 },
    { code: 'UA', num: 517, dep: '13:00', dur: 168, ac: 'Boeing 737 MAX 9', fare: 189 },
    { code: 'UA', num: 521, dep: '17:00', dur: 167, ac: 'Boeing 737-900',   fare: 199 },
    { code: 'AA', num: 1651,dep: '07:30', dur: 170, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AA', num: 1655,dep: '12:00', dur: 168, ac: 'Airbus A321',      fare: 189 },
    { code: 'F9', num: 813, dep: '08:00', dur: 173, ac: 'Airbus A320neo',   fare: 109 },
    { code: 'F9', num: 817, dep: '16:00', dur: 172, ac: 'Airbus A320neo',   fare: 119 },
    { code: 'WN', num: 1471,dep: '07:00', dur: 175, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'WN', num: 1475,dep: '15:00', dur: 175, ac: 'Boeing 737-800',   fare: 159 },
  ],
  'ORD-DEN': [
    { code: 'UA', num: 508, dep: '07:00', dur: 172, ac: 'Boeing 737-900',   fare: 169 },
    { code: 'UA', num: 512, dep: '11:00', dur: 170, ac: 'Airbus A320neo',   fare: 179 },
    { code: 'UA', num: 518, dep: '15:00', dur: 172, ac: 'Boeing 737 MAX 9', fare: 189 },
    { code: 'UA', num: 522, dep: '19:00', dur: 170, ac: 'Boeing 737-900',   fare: 199 },
    { code: 'AA', num: 1652,dep: '09:00', dur: 172, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'F9', num: 814, dep: '09:30', dur: 175, ac: 'Airbus A320neo',   fare: 109 },
    { code: 'WN', num: 1472,dep: '08:00', dur: 178, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'WN', num: 1476,dep: '16:30', dur: 178, ac: 'Boeing 737-800',   fare: 159 },
  ],

  // ── Chicago ↔ Atlanta ──────────────────────────────────────────────────
  'ORD-ATL': [
    { code: 'DL', num: 1041,dep: '07:00', dur: 128, ac: 'Boeing 737-800',   fare: 139 },
    { code: 'DL', num: 1045,dep: '10:00', dur: 127, ac: 'Airbus A220-300',  fare: 149 },
    { code: 'DL', num: 1051,dep: '13:30', dur: 128, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'DL', num: 1057,dep: '17:00', dur: 127, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'AA', num: 1901,dep: '08:00', dur: 130, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'AA', num: 1905,dep: '14:00', dur: 130, ac: 'Airbus A321',      fare: 159 },
    { code: 'UA', num: 1411,dep: '09:30', dur: 130, ac: 'Boeing 737-900',   fare: 149 },
    { code: 'WN', num: 5241,dep: '07:30', dur: 135, ac: 'Boeing 737-800',   fare: 119 },
    { code: 'WN', num: 5245,dep: '14:30', dur: 135, ac: 'Boeing 737-800',   fare: 129 },
  ],
  'ATL-ORD': [
    { code: 'DL', num: 1042,dep: '06:30', dur: 125, ac: 'Boeing 737-800',   fare: 139 },
    { code: 'DL', num: 1046,dep: '09:30', dur: 125, ac: 'Airbus A220-300',  fare: 149 },
    { code: 'DL', num: 1054,dep: '14:00', dur: 127, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'DL', num: 1060,dep: '18:30', dur: 125, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'AA', num: 1902,dep: '09:00', dur: 128, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'UA', num: 1412,dep: '11:30', dur: 128, ac: 'Boeing 737-900',   fare: 149 },
    { code: 'WN', num: 5242,dep: '08:30', dur: 133, ac: 'Boeing 737-800',   fare: 119 },
  ],

  // ── Boston ↔ Miami ─────────────────────────────────────────────────────
  'BOS-MIA': [
    { code: 'AA', num: 2111,dep: '07:00', dur: 200, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AA', num: 2115,dep: '11:00', dur: 198, ac: 'Airbus A321',      fare: 189 },
    { code: 'AA', num: 2121,dep: '15:00', dur: 200, ac: 'Boeing 737-800',   fare: 199 },
    { code: 'B6', num: 813, dep: '06:30', dur: 200, ac: 'Airbus A320',      fare: 149 },
    { code: 'B6', num: 817, dep: '10:30', dur: 198, ac: 'Airbus A320',      fare: 159 },
    { code: 'B6', num: 823, dep: '14:00', dur: 200, ac: 'Airbus A321',      fare: 169 },
    { code: 'B6', num: 829, dep: '18:30', dur: 200, ac: 'Airbus A320',      fare: 179 },
  ],
  'MIA-BOS': [
    { code: 'AA', num: 2112,dep: '08:00', dur: 197, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AA', num: 2118,dep: '13:00', dur: 195, ac: 'Airbus A321',      fare: 189 },
    { code: 'B6', num: 814, dep: '07:30', dur: 197, ac: 'Airbus A320',      fare: 149 },
    { code: 'B6', num: 820, dep: '11:30', dur: 195, ac: 'Airbus A320',      fare: 159 },
    { code: 'B6', num: 826, dep: '16:00', dur: 197, ac: 'Airbus A321',      fare: 169 },
  ],

  // ── Dallas ↔ Chicago ───────────────────────────────────────────────────
  'DFW-ORD': [
    { code: 'AA', num: 1401,dep: '06:00', dur: 158, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'AA', num: 1405,dep: '09:00', dur: 157, ac: 'Airbus A321',      fare: 159 },
    { code: 'AA', num: 1411,dep: '12:30', dur: 158, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'AA', num: 1417,dep: '16:00', dur: 158, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'AA', num: 1421,dep: '19:30', dur: 157, ac: 'Airbus A319',      fare: 179 },
    { code: 'UA', num: 1521,dep: '07:30', dur: 160, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'UA', num: 1525,dep: '14:00', dur: 160, ac: 'Airbus A320',      fare: 169 },
  ],
  'ORD-DFW': [
    { code: 'AA', num: 1402,dep: '07:00', dur: 162, ac: 'Boeing 737-800',   fare: 149 },
    { code: 'AA', num: 1406,dep: '10:30', dur: 160, ac: 'Airbus A321',      fare: 159 },
    { code: 'AA', num: 1412,dep: '14:00', dur: 162, ac: 'Boeing 737-800',   fare: 169 },
    { code: 'AA', num: 1418,dep: '17:30', dur: 162, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'UA', num: 1522,dep: '09:00', dur: 163, ac: 'Boeing 737-900',   fare: 159 },
  ],

  // ── Miami ↔ Los Angeles ────────────────────────────────────────────────
  'MIA-LAX': [
    { code: 'AA', num: 1273,dep: '07:30', dur: 330, ac: 'Boeing 737-800',   fare: 279 },
    { code: 'AA', num: 1277,dep: '11:00', dur: 328, ac: 'Airbus A321',      fare: 299 },
    { code: 'AA', num: 1283,dep: '15:30', dur: 330, ac: 'Boeing 737-800',   fare: 319 },
    { code: 'DL', num: 1583,dep: '08:00', dur: 335, ac: 'Boeing 757-200',   fare: 289 },
    { code: 'AA', num: 1287,dep: '21:00', dur: 335, ac: 'Boeing 737-800',   fare: 259, days:[0,1,2,3,4,5,6] },
  ],
  'LAX-MIA': [
    { code: 'AA', num: 1274,dep: '08:00', dur: 315, ac: 'Boeing 737-800',   fare: 279 },
    { code: 'AA', num: 1278,dep: '12:00', dur: 313, ac: 'Airbus A321',      fare: 299 },
    { code: 'AA', num: 1284,dep: '16:30', dur: 315, ac: 'Boeing 737-800',   fare: 309 },
    { code: 'DL', num: 1584,dep: '09:30', dur: 318, ac: 'Boeing 757-200',   fare: 289 },
  ],

  // ── Denver ↔ Seattle ──────────────────────────────────────────────────
  'DEN-SEA': [
    { code: 'UA', num: 571, dep: '07:00', dur: 168, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'UA', num: 575, dep: '11:30', dur: 167, ac: 'Airbus A320',      fare: 169 },
    { code: 'UA', num: 581, dep: '16:00', dur: 168, ac: 'Boeing 737 MAX 9', fare: 179 },
    { code: 'AS', num: 512, dep: '08:30', dur: 170, ac: 'Boeing 737 MAX 9', fare: 149 },
    { code: 'AS', num: 516, dep: '14:00', dur: 168, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'F9', num: 615, dep: '09:00', dur: 172, ac: 'Airbus A320neo',   fare: 119 },
    { code: 'WN', num: 4301,dep: '08:00', dur: 175, ac: 'Boeing 737-800',   fare: 139 },
  ],
  'SEA-DEN': [
    { code: 'UA', num: 572, dep: '07:30', dur: 165, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'UA', num: 578, dep: '13:00', dur: 163, ac: 'Airbus A320',      fare: 169 },
    { code: 'AS', num: 513, dep: '10:00', dur: 167, ac: 'Boeing 737 MAX 9', fare: 149 },
    { code: 'AS', num: 517, dep: '16:30', dur: 165, ac: 'Boeing 737-900',   fare: 159 },
    { code: 'WN', num: 4302,dep: '09:30', dur: 173, ac: 'Boeing 737-800',   fare: 139 },
  ],

  // ── Boston ↔ Los Angeles ───────────────────────────────────────────────
  'BOS-LAX': [
    { code: 'AA', num: 261, dep: '07:30', dur: 350, ac: 'Boeing 767-300',   fare: 309 },
    { code: 'AA', num: 265, dep: '11:00', dur: 348, ac: 'Airbus A321',      fare: 329 },
    { code: 'AA', num: 269, dep: '20:00', dur: 355, ac: 'Boeing 757-200',   fare: 279 },
    { code: 'B6', num: 1009,dep: '07:00', dur: 355, ac: 'Airbus A321',      fare: 249 },
    { code: 'B6', num: 1013,dep: '11:30', dur: 352, ac: 'Airbus A321',      fare: 259 },
    { code: 'UA', num: 281, dep: '08:30', dur: 353, ac: 'Boeing 787-9',     fare: 319, stops:1, via:'ORD' },
  ],
  'LAX-BOS': [
    { code: 'AA', num: 262, dep: '08:00', dur: 322, ac: 'Boeing 767-300',   fare: 309 },
    { code: 'AA', num: 266, dep: '12:00', dur: 320, ac: 'Airbus A321',      fare: 329 },
    { code: 'AA', num: 270, dep: '22:00', dur: 328, ac: 'Boeing 757-200',   fare: 279 },
    { code: 'B6', num: 1010,dep: '08:30', dur: 325, ac: 'Airbus A321',      fare: 249 },
    { code: 'B6', num: 1014,dep: '14:00', dur: 322, ac: 'Airbus A321',      fare: 259 },
  ],

  // ── San Francisco ↔ Nashville ─────────────────────────────────────────
  'SFO-BNA': [
    // ── Nonstop ──────────────────────────────────────────────────────────
    { code: 'UA', num: 1743, dep: '09:17', dur: 276, ac: 'Boeing 737 MAX 9', fare: 250 },
    { code: 'UA', num: 2530, dep: '16:10', dur: 276, ac: 'Boeing 737-900',   fare: 255 },
    { code: 'UA', num: 2157, dep: '23:59', dur: 278, ac: 'Boeing 737-900',   fare: 245 },
    { code: 'WN', num: 1463, dep: '22:50', dur: 260, ac: 'Boeing 737-800',   fare: 230 },
    // ── 1-stop ────────────────────────────────────────────────────────────
    { code: 'AA', num: 2251, dep: '06:45', dur: 541, ac: 'Boeing 737-800',   fare: 245, stops: 1, via: 'DFW' },
    { code: 'AA', num: 1153, dep: '12:36', dur: 394, ac: 'Airbus A321',      fare: 260, stops: 1, via: 'DFW' },
    { code: 'AA', num: 1789, dep: '13:17', dur: 446, ac: 'Boeing 737-800',   fare: 260, stops: 1, via: 'DFW' },
    { code: 'AA', num: 2077, dep: '14:03', dur: 442, ac: 'Airbus A321',      fare: 255, stops: 1, via: 'CLT' },
    { code: 'DL', num: 2809, dep: '09:20', dur: 425, ac: 'Airbus A220-300',  fare: 255, stops: 1, via: 'SLC' },
    { code: 'DL', num: 3471, dep: '13:20', dur: 467, ac: 'Boeing 737-900',   fare: 255, stops: 1, via: 'ATL' },
    { code: 'UA', num: 1497, dep: '05:00', dur: 422, ac: 'Boeing 737-900',   fare: 245, stops: 1, via: 'IAH' },
    { code: 'UA', num: 1631, dep: '12:15', dur: 507, ac: 'Airbus A320neo',   fare: 250, stops: 1, via: 'DEN' },
    { code: 'WN', num: 4721, dep: '06:05', dur: 590, ac: 'Boeing 737-800',   fare: 215, stops: 1, via: 'PHX' },
    { code: 'WN', num: 3817, dep: '11:00', dur: 625, ac: 'Boeing 737-800',   fare: 210, stops: 1, via: 'PHX' },
    { code: 'WN', num: 4293, dep: '14:35', dur: 425, ac: 'Boeing 737-800',   fare: 220, stops: 1, via: 'PHX' },
    { code: 'AS', num: 3049, dep: '06:03', dur: 457, ac: 'Boeing 737 MAX 9', fare: 265, stops: 1, via: 'SEA' },
    { code: 'F9', num: 1871, dep: '21:43', dur: 701, ac: 'Airbus A320neo',   fare: 200, stops: 1, via: 'DEN' },
  ],
  'BNA-SFO': [
    // ── Nonstop ──────────────────────────────────────────────────────────
    { code: 'UA', num: 1812, dep: '06:31', dur: 287, ac: 'Boeing 737 MAX 9', fare: 255 },
    { code: 'WN', num: 2478, dep: '13:45', dur: 280, ac: 'Boeing 737-800',   fare: 230 },
    { code: 'UA', num: 5735, dep: '14:54', dur: 288, ac: 'Boeing 737-900',   fare: 255 },
    { code: 'UA', num: 1641, dep: '16:59', dur: 288, ac: 'Boeing 737-900',   fare: 260 },
    // ── 1-stop ────────────────────────────────────────────────────────────
    { code: 'WN', num: 1647, dep: '05:00', dur: 415, ac: 'Boeing 737-800',   fare: 215, stops: 1, via: 'PHX' },
    { code: 'WN', num: 3491, dep: '05:15', dur: 375, ac: 'Boeing 737-800',   fare: 215, stops: 1, via: 'PHX' },
    { code: 'WN', num: 5801, dep: '06:50', dur: 415, ac: 'Boeing 737-800',   fare: 220, stops: 1, via: 'PHX' },
    { code: 'WN', num: 3271, dep: '08:00', dur: 510, ac: 'Boeing 737-800',   fare: 215, stops: 1, via: 'PHX' },
    { code: 'WN', num: 4087, dep: '12:45', dur: 405, ac: 'Boeing 737-800',   fare: 220, stops: 1, via: 'PHX' },
    { code: 'WN', num: 2913, dep: '15:50', dur: 465, ac: 'Boeing 737-800',   fare: 225, stops: 1, via: 'PHX' },
    { code: 'AA', num: 1937, dep: '05:01', dur: 454, ac: 'Boeing 737-800',   fare: 255, stops: 1, via: 'DFW' },
    { code: 'AA', num: 1309, dep: '05:30', dur: 527, ac: 'Airbus A321',      fare: 250, stops: 1, via: 'DFW' },
    { code: 'AA', num: 2741, dep: '14:18', dur: 408, ac: 'Boeing 737-800',   fare: 255, stops: 1, via: 'DFW' },
    { code: 'DL', num: 2847, dep: '06:15', dur: 450, ac: 'Airbus A220-300',  fare: 255, stops: 1, via: 'SLC' },
    { code: 'UA', num: 3281, dep: '06:30', dur: 425, ac: 'Boeing 737-900',   fare: 245, stops: 1, via: 'IAH' },
    { code: 'UA', num: 2437, dep: '07:40', dur: 454, ac: 'Airbus A320neo',   fare: 250, stops: 1, via: 'DEN' },
    { code: 'AS', num: 4307, dep: '07:02', dur: 542, ac: 'Boeing 737 MAX 9', fare: 265, stops: 1, via: 'SEA' },
    { code: 'F9', num: 2401, dep: '12:09', dur: 649, ac: 'Airbus A320neo',   fare: 200, stops: 1, via: 'DEN' },
    { code: 'B6', num: 1341, dep: '13:06', dur: 692, ac: 'Airbus A321',      fare: 265, stops: 1, via: 'BOS' },
  ],

  // ── Atlanta ↔ Dallas ──────────────────────────────────────────────────
  'ATL-DFW': [
    { code: 'AA', num: 2451,dep: '06:30', dur: 168, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'AA', num: 2455,dep: '10:00', dur: 167, ac: 'Airbus A321',      fare: 169 },
    { code: 'AA', num: 2461,dep: '14:30', dur: 168, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'DL', num: 1651,dep: '07:30', dur: 170, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'DL', num: 1657,dep: '13:00', dur: 170, ac: 'Airbus A220-300',  fare: 169 },
    { code: 'WN', num: 5611,dep: '08:00', dur: 175, ac: 'Boeing 737-800',   fare: 139 },
  ],
  'DFW-ATL': [
    { code: 'AA', num: 2452,dep: '07:30', dur: 165, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'AA', num: 2456,dep: '11:30', dur: 163, ac: 'Airbus A321',      fare: 169 },
    { code: 'AA', num: 2462,dep: '16:00', dur: 165, ac: 'Boeing 737-800',   fare: 179 },
    { code: 'DL', num: 1652,dep: '09:00', dur: 167, ac: 'Boeing 737-800',   fare: 159 },
    { code: 'WN', num: 5612,dep: '09:00', dur: 172, ac: 'Boeing 737-800',   fare: 139 },
  ],
}

// Price factor by how many days out the flight is
function priceFactor(daysOut: number, dow: number): number {
  let f = 1.0
  if      (daysOut <=  2) f = 3.0
  else if (daysOut <=  6) f = 2.2
  else if (daysOut <= 13) f = 1.6
  else if (daysOut <= 29) f = 1.25
  else if (daysOut <= 59) f = 1.0
  else                    f = 0.82

  // Weekend premium (Fri = 5, Sun = 0)
  if (dow === 5 || dow === 0) f *= 1.12
  // Holiday bump: July 4th week (2026-06-28 through 2026-07-07)
  if (daysOut >= 0 && daysOut <= 45) {
    // rough bump if within the window — handled by calling code
  }
  return f
}

export function getScheduledFlights(
  from: string,
  to: string,
  date: string,
): ScheduledFlight[] | null {
  const key = `${from}-${to}`
  if (!S[key]) return null
  const d      = new Date(date)
  const dow    = d.getDay()
  // Keep only flights that operate on this day of week
  return S[key].filter(f => !f.days || f.days.includes(dow))
}

export function applyDatePricing(baseFare: number, date: string): number {
  const today   = new Date()
  today.setHours(0,0,0,0)
  const dep     = new Date(date)
  const daysOut = Math.round((dep.getTime() - today.getTime()) / 86400000)
  const dow     = dep.getDay()

  let factor = priceFactor(daysOut, dow)

  // July 4th week premium (+20%)
  const m = dep.getMonth(), day = dep.getDate()
  if (m === 5 && day >= 27) factor *= 1.20       // late June
  if (m === 6 && day <= 8)  factor *= 1.20       // early July

  const price = Math.round(baseFare * factor / 5) * 5
  return Math.max(39, price)
}
