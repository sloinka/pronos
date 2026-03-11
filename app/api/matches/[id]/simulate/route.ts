import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";
import { getMatchDetails, getTeamForm, getH2H, getInjuries, getStandings } from "@/lib/api-sports";
import { generateSimulation } from "@/lib/claude";
import { getCached, setCache, CACHE_TTL } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import type { SimulationResult } from "@/lib/claude";
import type { Fixture } from "@/lib/api-sports";

function getFormString(teamId: number, matches: Fixture[]): string {
  return matches
    .map((m) => {
      const isHome = m.teams.home.id === teamId;
      const teamGoals = isHome ? m.goals.home : m.goals.away;
      const oppGoals = isHome ? m.goals.away : m.goals.home;
      if (teamGoals === null || oppGoals === null) return "D";
      if (teamGoals > oppGoals) return "W";
      if (teamGoals < oppGoals) return "L";
      return "D";
    })
    .join(",");
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribed = await isUserSubscribed(session.user.id);
  if (!subscribed) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { id } = await params;
  const fixtureId = parseInt(id, 10);

  // Check cache
  const cacheKey = `simulation:fixture:${fixtureId}`;
  const cached = await getCached<SimulationResult>(cacheKey);
  if (cached) {
    return NextResponse.json({ simulation: cached });
  }

  try {
    const match = await getMatchDetails(fixtureId);
    const currentYear = new Date().getFullYear();

    const [homeForm, awayForm, h2h, injuries, standings] = await Promise.all([
      getTeamForm(match.teams.home.id),
      getTeamForm(match.teams.away.id),
      getH2H(match.teams.home.id, match.teams.away.id),
      getInjuries(fixtureId),
      getStandings(match.league.id, currentYear),
    ]);

    const homeSt = standings.find((s) => s.team.id === match.teams.home.id);
    const awaySt = standings.find((s) => s.team.id === match.teams.away.id);

    const homeInjuryNames = injuries
      .filter((i) => i.team.id === match.teams.home.id)
      .map((i) => `${i.player.name} (${i.player_info.reason})`)
      .join(", ") || "None";

    const awayInjuryNames = injuries
      .filter((i) => i.team.id !== match.teams.home.id)
      .map((i) => `${i.player.name} (${i.player_info.reason})`)
      .join(", ") || "None";

    const h2hData = h2h
      .map(
        (m) =>
          `${m.teams.home.name} ${m.goals.home} - ${m.goals.away} ${m.teams.away.name}`
      )
      .join("\n");

    const simulation = await generateSimulation({
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      league: match.league.name,
      country: match.league.country,
      matchDate: match.fixture.date,
      homePosition: homeSt?.rank ?? 0,
      totalTeams: standings.length,
      homePoints: homeSt?.points ?? 0,
      homeFormHome: getFormString(match.teams.home.id, homeForm),
      homeFormOverall: getFormString(match.teams.home.id, homeForm),
      homeGoalsAvg: homeSt
        ? (homeSt.home.goals.for / (homeSt.home.played || 1)).toFixed(1)
        : "N/A",
      homeGoalsAgainstAvg: homeSt
        ? (homeSt.home.goals.against / (homeSt.home.played || 1)).toFixed(1)
        : "N/A",
      homeInjuries: homeInjuryNames,
      awayPosition: awaySt?.rank ?? 0,
      awayPoints: awaySt?.points ?? 0,
      awayFormAway: getFormString(match.teams.away.id, awayForm),
      awayFormOverall: getFormString(match.teams.away.id, awayForm),
      awayGoalsAvg: awaySt
        ? (awaySt.away.goals.for / (awaySt.away.played || 1)).toFixed(1)
        : "N/A",
      awayGoalsAgainstAvg: awaySt
        ? (awaySt.away.goals.against / (awaySt.away.played || 1)).toFixed(1)
        : "N/A",
      awayInjuries: awayInjuryNames,
      h2hData,
      language: "English",
    });

    await setCache(cacheKey, simulation, CACHE_TTL.simulation);

    // Track usage
    await prisma.simulationUsage.create({
      data: {
        userId: session.user.id,
        fixtureId: fixtureId.toString(),
      },
    });

    return NextResponse.json({ simulation });
  } catch (error) {
    console.error("Simulation failed:", error);
    return NextResponse.json(
      { error: "Simulation failed" },
      { status: 500 }
    );
  }
}
