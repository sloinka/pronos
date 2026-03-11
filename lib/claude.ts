import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://fal.run/openrouter/router/openai/v1",
  apiKey: "not-needed",
  defaultHeaders: {
    Authorization: `Key ${process.env.FAL_KEY}`,
  },
});

const MODEL = "anthropic/claude-sonnet-4.6";

export async function generateAIPreview(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  date: string;
  homeForm: string;
  awayForm: string;
  homeWins: number;
  awayWins: number;
  draws: number;
  homeInjuries: string;
  awayInjuries: string;
  language: string;
}): Promise<string> {
  const prompt = `You are a professional football analyst. Write a SHORT 2-3 paragraph match preview for: ${params.homeTeam} vs ${params.awayTeam} in ${params.league}, ${params.country}.
Match date: ${params.date}.
Home team last 5: ${params.homeForm} (W/L/D sequence)
Away team last 5: ${params.awayForm}
H2H summary: In last 10 meetings, ${params.homeTeam} won ${params.homeWins}, ${params.awayTeam} won ${params.awayWins}, ${params.draws} draws.
Key absences - ${params.homeTeam}: ${params.homeInjuries}. ${params.awayTeam}: ${params.awayInjuries}.
Write in ${params.language}. Be concise, insightful, and engaging.
Return plain text only, no markdown.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content || "";
}

export interface SimulationResult {
  scorePrediction: {
    homeGoals: number;
    awayGoals: number;
    confidence: number;
    explanation: string;
  };
  matchOutcome: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  possession: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
    total: number;
    explanation: string;
  };
  shots: {
    home: number;
    away: number;
    homeOnTarget: number;
    awayOnTarget: number;
  };
  cards: {
    homeYellow: number;
    awayYellow: number;
    homeRed: number;
    awayRed: number;
  };
  btts: {
    probability: number;
    prediction: boolean;
  };
  over25Goals: {
    probability: number;
    prediction: boolean;
  };
  keyFactors: string[];
  riskLevel: "low" | "medium" | "high";
  valueBets: string[];
  matchTempo: "slow" | "medium" | "high";
  detailedAnalysis: string;
}

export async function generateSimulation(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  matchDate: string;
  homePosition: number;
  totalTeams: number;
  homePoints: number;
  homeFormHome: string;
  homeFormOverall: string;
  homeGoalsAvg: string;
  homeGoalsAgainstAvg: string;
  homeInjuries: string;
  awayPosition: number;
  awayPoints: number;
  awayFormAway: string;
  awayFormOverall: string;
  awayGoalsAvg: string;
  awayGoalsAgainstAvg: string;
  awayInjuries: string;
  h2hData: string;
  language: string;
}): Promise<SimulationResult> {
  const prompt = `You are an advanced football analytics AI. Analyze this match and provide detailed predictions in valid JSON format.

Match: ${params.homeTeam} vs ${params.awayTeam}
Competition: ${params.league} - ${params.country}
Date: ${params.matchDate}

TEAM DATA:
Home Team (${params.homeTeam}):
- League position: ${params.homePosition}/${params.totalTeams}, Points: ${params.homePoints}
- Home form (last 5 home games): ${params.homeFormHome}
- Overall last 5: ${params.homeFormOverall}
- Goals scored avg (home): ${params.homeGoalsAvg}
- Goals conceded avg (home): ${params.homeGoalsAgainstAvg}
- Key absences: ${params.homeInjuries}

Away Team (${params.awayTeam}):
- League position: ${params.awayPosition}/${params.totalTeams}, Points: ${params.awayPoints}
- Away form (last 5 away games): ${params.awayFormAway}
- Overall last 5: ${params.awayFormOverall}
- Goals scored avg (away): ${params.awayGoalsAvg}
- Goals conceded avg (away): ${params.awayGoalsAgainstAvg}
- Key absences: ${params.awayInjuries}

HEAD-TO-HEAD (Last 10):
${params.h2hData}

Provide your analysis as JSON with this EXACT structure:
{
  "scorePrediction": { "homeGoals": number, "awayGoals": number, "confidence": number (0-100), "explanation": "string" },
  "matchOutcome": { "homeWin": number (percentage), "draw": number (percentage), "awayWin": number (percentage) },
  "possession": { "home": number (percentage), "away": number (percentage) },
  "corners": { "home": number, "away": number, "total": number, "explanation": "string" },
  "shots": { "home": number, "away": number, "homeOnTarget": number, "awayOnTarget": number },
  "cards": { "homeYellow": number, "awayYellow": number, "homeRed": number, "awayRed": number },
  "btts": { "probability": number (percentage), "prediction": boolean },
  "over25Goals": { "probability": number (percentage), "prediction": boolean },
  "keyFactors": ["string", "string", "string"],
  "riskLevel": "low" | "medium" | "high",
  "valueBets": ["string"],
  "matchTempo": "slow" | "medium" | "high",
  "detailedAnalysis": "string (3-4 paragraphs in ${params.language})"
}

Return ONLY valid JSON, no markdown, no explanation outside JSON.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as SimulationResult;
}
