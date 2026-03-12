import { useTranslations } from "next-intl";
import type { Fixture } from "@/lib/api-sports";

function getResult(teamId: number, fixture: Fixture): "W" | "L" | "D" {
  const isHome = fixture.teams.home.id === teamId;
  const teamGoals = isHome ? fixture.goals.home : fixture.goals.away;
  const oppGoals = isHome ? fixture.goals.away : fixture.goals.home;

  if (teamGoals === null || oppGoals === null) return "D";
  if (teamGoals > oppGoals) return "W";
  if (teamGoals < oppGoals) return "L";
  return "D";
}

const RESULT_COLORS = {
  W: "bg-green-500 shadow-green-500/20",
  L: "bg-red-500 shadow-red-500/20",
  D: "bg-slate-400 shadow-slate-400/20",
};

interface TeamFormProps {
  team1Name: string;
  team1Matches: Fixture[];
  team2Name: string;
  team2Matches: Fixture[];
  team1Id: number;
  team2Id: number;
}

export default function TeamForm({
  team1Name,
  team1Matches,
  team2Name,
  team2Matches,
  team1Id,
  team2Id,
}: TeamFormProps) {
  const t = useTranslations("matchDetail");

  const RenderTeam = (name: string, id: number, matches: Fixture[]) => (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {name}
      </p>
      <div className="flex gap-2">
        {matches.length > 0 ? matches.slice(0, 5).map((m) => {
          const result = getResult(id, m);
          const isHome = m.teams.home.id === id;
          const opponent = isHome ? m.teams.away.name : m.teams.home.name;
          const score = `${m.goals.home}-${m.goals.away}`;

          return (
            <div key={m.fixture.id} className="group relative">
              <div
                className={`w-8 h-8 rounded-full ${RESULT_COLORS[result]} flex items-center justify-center text-xs font-bold text-white shadow-lg`}
              >
                {t(result === "W" ? "win" : result === "L" ? "loss" : "draw")}
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-60 transition-opacity">
                {score} vs {opponent.substring(0, 3).toUpperCase()}
              </div>
            </div>
          );
        }) : (
          <div className="text-[10px] text-slate-500 italic py-2">No matching data</div>
        )}
      </div>
    </div>
  );

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-primary/10">
      <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">analytics</span>{" "}
        {t("teamForm")}
      </h4>
      <div className="grid grid-cols-2 gap-8 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-primary/10 -translate-x-1/2 hidden sm:block"></div>
        {RenderTeam(team1Name, team1Id, team1Matches)}
        {RenderTeam(team2Name, team2Id, team2Matches)}
      </div>
    </section>
  );
}
