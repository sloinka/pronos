import { getCached, setCache, CACHE_TTL, incrementApiCallCount } from "./redis";

const API_BASE = "https://v3.football.api-sports.io";

async function apiFetch<T>(endpoint: string, cacheKey: string, ttl: number): Promise<T> {
  const cached = await getCached<T>(cacheKey);
  if (cached) return cached;

  await incrementApiCallCount();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": process.env.API_SPORTS_KEY!,
    },
  });

  if (!res.ok) {
    throw new Error(`API-Sports error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const data = json.response as T;

  await setCache(cacheKey, data, ttl);
  return data;
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    status: {
      short: string;
      long: string;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    fulltime: { home: number | null; away: number | null };
  };
}

export interface Injury {
  player: { id: number; name: string; photo: string; type: string; reason: string };
  team: { id: number; name: string; logo: string };
  fixture: { id: number };
  league: { id: number };
}

export interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

const EXCLUDED_STATUSES = ["FT", "AET", "PEN", "ABD", "CANC", "AWD", "WO"];
const ALLOWED_STATUSES = ["NS", "TBD", "PST"];

// Major leagues allow-list (API-Sports IDs)
const MAJOR_LEAGUE_IDS = new Set([
  // International Clubs
  2,   // Champions League
  3,   // Europa League
  848, // Conference League
  // Europe - Top 5
  39,  // Premier League (England)
  40,  // Championship (England)
  140, // La Liga (Spain)
  78,  // Bundesliga (Germany)
  135, // Serie A (Italy)
  61,  // Ligue 1 (France)
  // Europe - Other
  203, // Süper Lig (Turkey)
  88,  // Eredivisie (Netherlands)
  94,  // Primeira Liga (Portugal)
  144, // Pro League (Belgium)
  207, // Super League (Switzerland)
  179, // Premiership (Scotland)
  218, // Bundesliga (Austria)
  119, // Superliga (Denmark)
  103, // Eliteserien (Norway)
  113, // Allsvenskan (Sweden)
  106, // Ekstraklasa (Poland)
  197, // Super League 1 (Greece)
  // Americas
  253, // MLS (USA)
  262, // Liga MX (Mexico)
  71,  // Serie A (Brazil)
  13,  // Copa Libertadores
  11,  // Copa Sudamericana
  // International
  1,   // World Cup
  4,   // Euro Championship
  5,   // Nations League
]);

export async function getDailyMatches(date: string): Promise<Fixture[]> {
  const cacheKey = `matches:date:${date}`;
  const fixtures = await apiFetch<Fixture[]>(
    `/fixtures?date=${date}&timezone=UTC`,
    cacheKey,
    CACHE_TTL.dailyMatches
  );
  return fixtures.filter(
    (f) =>
      !EXCLUDED_STATUSES.includes(f.fixture.status.short) &&
      ALLOWED_STATUSES.includes(f.fixture.status.short) &&
      MAJOR_LEAGUE_IDS.has(f.league.id)
  );
}

export async function getMultiDayMatches(
  startDate: string,
  days: number
): Promise<{ date: string; matches: Fixture[] }[]> {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const results = await Promise.all(
    dates.map(async (date) => ({
      date,
      matches: await getDailyMatches(date),
    }))
  );

  return results;
}

export async function getMatchDetails(fixtureId: number): Promise<Fixture> {
  const cacheKey = `match:details:fixture:${fixtureId}`;
  const fixtures = await apiFetch<Fixture[]>(
    `/fixtures?id=${fixtureId}`,
    cacheKey,
    CACHE_TTL.matchDetails
  );
  return fixtures[0];
}

export async function getTeamForm(teamId: number): Promise<Fixture[]> {
  const cacheKey = `team:form:teamId:${teamId}`;
  return apiFetch<Fixture[]>(
    `/fixtures?team=${teamId}&last=5`,
    cacheKey,
    CACHE_TTL.teamForm
  );
}

export async function getH2H(team1Id: number, team2Id: number): Promise<Fixture[]> {
  const cacheKey = `h2h:team1:${team1Id}:team2:${team2Id}`;
  return apiFetch<Fixture[]>(
    `/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`,
    cacheKey,
    CACHE_TTL.h2h
  );
}

export async function getInjuries(fixtureId: number): Promise<Injury[]> {
  const cacheKey = `injuries:fixture:${fixtureId}`;
  return apiFetch<Injury[]>(
    `/injuries?fixture=${fixtureId}`,
    cacheKey,
    CACHE_TTL.injuries
  );
}

export async function getStandings(leagueId: number, season: number): Promise<Standing[]> {
  const cacheKey = `standings:league:${leagueId}:season:${season}`;
  const data = await apiFetch<Array<{ league: { standings: Standing[][] } }>>(
    `/standings?league=${leagueId}&season=${season}`,
    cacheKey,
    CACHE_TTL.standings
  );
  return data[0]?.league?.standings?.[0] || [];
}
