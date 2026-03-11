import { useTranslations } from "next-intl";
import type { Fixture } from "@/lib/api-sports";

export default function H2HStats({
  homeTeam,
  awayTeam,
  homeTeamId,
  awayTeamId,
  matches,
}: {
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  matches: Fixture[];
}) {
  const t = useTranslations("matchDetail");

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  for (const m of matches) {
    const hGoals = m.goals.home ?? 0;
    const aGoals = m.goals.away ?? 0;

    if (hGoals === aGoals) {
      draws++;
    } else {
      const winnerId =
        hGoals > aGoals ? m.teams.home.id : m.teams.away.id;
      if (winnerId === homeTeamId) homeWins++;
      else if (winnerId === awayTeamId) awayWins++;
    }
  }

  const total = matches.length || 1;
  const homePercent = Math.round((homeWins / total) * 100);
  const drawPercent = Math.round((draws / total) * 100);
  const awayPercent = 100 - homePercent - drawPercent;

  return (
    <div className="bg-surface rounded-xl p-5 border border-white/5">
      <h3 className="font-semibold mb-3">{t("headToHead")} — {t("last10Meetings")}</h3>

      <div className="flex items-center justify-between text-sm mb-2">
        <span>
          {homeTeam}: {homeWins} {t("wins")}
        </span>
        <span>{draws} {t("draws")}</span>
        <span>
          {awayTeam}: {awayWins} {t("wins")}
        </span>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        <div
          className="bg-primary"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-gray-400"
          style={{ width: `${drawPercent}%` }}
        />
        <div
          className="bg-secondary"
          style={{ width: `${awayPercent}%` }}
        />
      </div>

      <div className="space-y-1">
        {matches.map((m) => {
          const date = new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(new Date(m.fixture.date));
          return (
            <div
              key={m.fixture.id}
              className="flex items-center justify-between text-sm text-text-light/70"
            >
              <span className="text-xs text-text-light/40">{date}</span>
              <span>
                {m.teams.home.name}{" "}
                <span className="font-mono font-bold text-text-light">
                  {m.goals.home} - {m.goals.away}
                </span>{" "}
                {m.teams.away.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
