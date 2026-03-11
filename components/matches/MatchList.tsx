"use client";

import { useTranslations } from "next-intl";
import LeagueGroup from "./LeagueGroup";
import type { Fixture } from "@/lib/api-sports";

interface MatchListProps {
  matches: Fixture[];
  isSubscribed: boolean;
}

export default function MatchList({ matches, isSubscribed }: MatchListProps) {
  const t = useTranslations("matches");

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-text-light/50">
        <p className="text-lg">{t("noMatches")}</p>
      </div>
    );
  }

  // Sort by kickoff time
  const sorted = [...matches].sort(
    (a, b) => a.fixture.timestamp - b.fixture.timestamp
  );

  // Group by league
  const leagues = new Map<
    number,
    { name: string; logo: string; flag: string | null; country: string; matches: Fixture[] }
  >();

  let globalIndex = 0;
  const globalLockedMap = new Map<number, boolean>();

  for (const match of sorted) {
    const leagueId = match.league.id;
    if (!leagues.has(leagueId)) {
      leagues.set(leagueId, {
        name: match.league.name,
        logo: match.league.logo,
        flag: match.league.flag,
        country: match.league.country,
        matches: [],
      });
    }
    leagues.get(leagueId)!.matches.push(match);

    // First 3 matches are free, rest locked for non-subscribers
    if (!isSubscribed && globalIndex >= 3) {
      globalLockedMap.set(match.fixture.id, true);
    }
    globalIndex++;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      {Array.from(leagues.entries()).map(([leagueId, league]) => {
        const lockedIndexes = new Set<number>();
        league.matches.forEach((m, idx) => {
          if (globalLockedMap.has(m.fixture.id)) {
            lockedIndexes.add(idx);
          }
        });

        return (
          <LeagueGroup
            key={leagueId}
            leagueName={league.name}
            leagueLogo={league.logo}
            countryFlag={league.flag}
            countryName={league.country}
            matches={league.matches}
            lockedIndexes={lockedIndexes}
          />
        );
      })}
    </div>
  );
}
