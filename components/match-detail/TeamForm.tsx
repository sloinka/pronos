import { useTranslations } from "next-intl";
import type { Fixture } from "@/lib/api-sports";

function getResult(
  teamId: number,
  fixture: Fixture
): "W" | "L" | "D" {
  const isHome = fixture.teams.home.id === teamId;
  const teamGoals = isHome ? fixture.goals.home : fixture.goals.away;
  const oppGoals = isHome ? fixture.goals.away : fixture.goals.home;

  if (teamGoals === null || oppGoals === null) return "D";
  if (teamGoals > oppGoals) return "W";
  if (teamGoals < oppGoals) return "L";
  return "D";
}

const RESULT_COLORS = {
  W: "bg-green-500",
  L: "bg-red-500",
  D: "bg-gray-400",
};

export default function TeamForm({
  teamName,
  teamId,
  matches,
}: {
  teamName: string;
  teamId: number;
  matches: Fixture[];
}) {
  const t = useTranslations("matchDetail");

  return (
    <div className="bg-surface rounded-xl p-5 border border-white/5">
      <h3 className="font-semibold mb-3">{teamName} — {t("last5Matches")}</h3>
      <div className="flex gap-2 mb-4">
        {matches.map((m) => {
          const result = getResult(teamId, m);
          return (
            <div
              key={m.fixture.id}
              className={`w-8 h-8 rounded-full ${RESULT_COLORS[result]} flex items-center justify-center text-xs font-bold text-white`}
              title={`${m.teams.home.name} ${m.goals.home} - ${m.goals.away} ${m.teams.away.name}`}
            >
              {t(result === "W" ? "win" : result === "L" ? "loss" : "draw")}
            </div>
          );
        })}
      </div>
      <div className="space-y-1">
        {matches.map((m) => {
          const isHome = m.teams.home.id === teamId;
          const opponent = isHome ? m.teams.away.name : m.teams.home.name;
          const result = getResult(teamId, m);
          return (
            <div
              key={m.fixture.id}
              className="flex items-center gap-2 text-sm text-text-light/70"
            >
              <span className={`inline-block w-2 h-2 rounded-full ${RESULT_COLORS[result]}`} />
              <span className="text-xs text-text-light/40">{isHome ? "H" : "A"}</span>
              <span>{opponent}</span>
              <span className="ml-auto font-mono">
                {m.goals.home} - {m.goals.away}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
