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
      const winnerId = hGoals > aGoals ? m.teams.home.id : m.teams.away.id;
      if (winnerId === homeTeamId) homeWins++;
      else if (winnerId === awayTeamId) awayWins++;
    }
  }

  const total = matches.length || 1;
  const homePercent = Math.round((homeWins / total) * 100);
  const drawPercent = Math.round((draws / total) * 100);
  const awayPercent = 100 - homePercent - drawPercent;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-primary/10 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>{" "}
          {t("last10Meetings")}
        </h4>
      </div>
      <div className="flex h-3 w-full rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${homePercent}%` }}
          title={`${homeTeam} Wins (${homeWins})`}
        ></div>
        <div
          className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500"
          style={{ width: `${drawPercent}%` }}
          title={`Draws (${draws})`}
        ></div>
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${awayPercent}%` }}
          title={`${awayTeam} Wins (${awayWins})`}
        ></div>
      </div>
      <div className="flex justify-between text-xs font-bold mb-4 px-1">
        <span className="text-red-500">
          {homeWins} {homeTeam.substring(0, 3).toUpperCase()}
        </span>
        <span className="text-slate-400">
          {draws} {t("draws").toUpperCase()}
        </span>
        <span className="text-blue-500">
          {awayWins} {awayTeam.substring(0, 3).toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">
        {matches.length > 0 ? (
          matches.map((m) => {
            const date = new Intl.DateTimeFormat(undefined, {
              month: "short",
              year: "numeric",
            }).format(new Date(m.fixture.date));
            const score = `${m.goals.home} - ${m.goals.away}`;
            const isHomeWin = (m.goals.home ?? 0) > (m.goals.away ?? 0);
            const isAwayWin = (m.goals.away ?? 0) > (m.goals.home ?? 0);
            const isDraw = m.goals.home === m.goals.away;

            return (
              <div
                key={m.fixture.id}
                className="flex justify-between items-center py-2 px-3 rounded bg-slate-50 dark:bg-primary/5 text-xs"
              >
                <span className="text-slate-400">{date}</span>
                <span className="font-bold flex-1 text-center">
                  {m.teams.home.name} {score} {m.teams.away.name}
                </span>
                <span
                  className={`material-symbols-outlined text-[14px] ${
                    (isHomeWin && m.teams.home.id === homeTeamId) ||
                    (isAwayWin && m.teams.away.id === homeTeamId)
                      ? "text-green-500"
                      : isDraw
                      ? "text-slate-400"
                      : "text-red-400"
                  }`}
                >
                  {isDraw ? "drag_handle" : "check_circle"}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-xs text-slate-500 italic">
            No head-to-head matches found
          </div>
        )}
      </div>
    </section>
  );
}
