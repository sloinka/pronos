import { getMatchDetails, getTeamForm, getH2H, getInjuries } from "@/lib/api-sports";
import { getCached, setCache, CACHE_TTL } from "@/lib/redis";
import { generateAIPreview } from "@/lib/claude";
import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";
import MatchHeader from "@/components/match-detail/MatchHeader";
import TeamForm from "@/components/match-detail/TeamForm";
import H2HStats from "@/components/match-detail/H2HStats";
import InjuredPlayers from "@/components/match-detail/InjuredPlayers";
import AIPreview from "@/components/match-detail/AIPreview";
import SimulationModal from "@/components/match-detail/SimulationModal";
import type { Fixture } from "@/lib/api-sports";

const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  el: "Greek",
};

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

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const fixtureId = parseInt(id, 10);

  const [match, session] = await Promise.all([
    getMatchDetails(fixtureId),
    auth(),
  ]);

  const [homeForm, awayForm, h2h, injuries] = await Promise.all([
    getTeamForm(match.teams.home.id),
    getTeamForm(match.teams.away.id),
    getH2H(match.teams.home.id, match.teams.away.id),
    getInjuries(fixtureId),
  ]);

  let subscribed = false;
  if (session?.user?.id) {
    subscribed = await isUserSubscribed(session.user.id);
  }

  // AI Preview (cached per fixture per language)
  const previewCacheKey = `ai:preview:${fixtureId}:${locale}`;
  let preview = await getCached<string>(previewCacheKey);

  if (!preview) {
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    for (const m of h2h) {
      const hGoals = m.goals.home ?? 0;
      const aGoals = m.goals.away ?? 0;
      if (hGoals === aGoals) draws++;
      else if (
        (hGoals > aGoals && m.teams.home.id === match.teams.home.id) ||
        (aGoals > hGoals && m.teams.away.id === match.teams.home.id)
      )
        homeWins++;
      else awayWins++;
    }

    const homeInjuryNames = injuries
      .filter((i) => i.team.id === match.teams.home.id)
      .map((i) => i.player.name)
      .join(", ") || "None";

    const awayInjuryNames = injuries
      .filter((i) => i.team.id !== match.teams.home.id)
      .map((i) => i.player.name)
      .join(", ") || "None";

    preview = "test" || await generateAIPreview({
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      league: match.league.name,
      country: match.league.country,
      date: match.fixture.date,
      homeForm: getFormString(match.teams.home.id, homeForm),
      awayForm: getFormString(match.teams.away.id, awayForm),
      homeWins,
      awayWins,
      draws,
      homeInjuries: homeInjuryNames,
      awayInjuries: awayInjuryNames,
      language: LANGUAGE_MAP[locale] || "English",
    });

    await setCache(previewCacheKey, preview, CACHE_TTL.aiPreview);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <MatchHeader match={match} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamForm
          teamName={match.teams.home.name}
          teamId={match.teams.home.id}
          matches={homeForm}
        />
        <TeamForm
          teamName={match.teams.away.name}
          teamId={match.teams.away.id}
          matches={awayForm}
        />
      </div>

      <H2HStats
        homeTeam={match.teams.home.name}
        awayTeam={match.teams.away.name}
        homeTeamId={match.teams.home.id}
        awayTeamId={match.teams.away.id}
        matches={h2h}
      />

      <InjuredPlayers
        injuries={injuries}
        homeTeamId={match.teams.home.id}
      />

      <AIPreview preview={preview} />

      <SimulationModal fixtureId={fixtureId} isSubscribed={subscribed} />
    </div>
  );
}
