import { useTranslations } from "next-intl";
import type { Injury } from "@/lib/api-sports";

export default function InjuredPlayers({
  injuries,
  homeTeamId,
}: {
  injuries: Injury[];
  homeTeamId: number;
}) {
  const t = useTranslations("matchDetail");

  const homeInjuries = injuries.filter((i) => i.team.id === homeTeamId);
  const awayInjuries = injuries.filter((i) => i.team.id !== homeTeamId);

  if (injuries.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-5 border border-white/5">
        <h3 className="font-semibold mb-3">{t("injuries")}</h3>
        <p className="text-sm text-text-light/50">{t("noInjuries")}</p>
      </div>
    );
  }

  function renderGroup(teamInjuries: Injury[], teamName: string) {
    if (teamInjuries.length === 0) return null;
    return (
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-text-light/80 mb-2">{teamName}</h4>
        <div className="space-y-1">
          {teamInjuries.map((injury, idx) => (
            <div
              key={`${injury.player.id}-${idx}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-light/70">{injury.player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-light/50 text-xs">
                  {injury.player_info.reason}
                </span>
                <span
                  className={`badge badge-xs ${
                    injury.player_info.type === "Missing Fixture"
                      ? "badge-error"
                      : "badge-warning"
                  }`}
                >
                  {injury.player_info.type === "Missing Fixture"
                    ? t("out")
                    : t("doubtful")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-5 border border-white/5">
      <h3 className="font-semibold mb-3">{t("injuries")}</h3>
      {renderGroup(homeInjuries, homeInjuries[0]?.team.name || t("home"))}
      {renderGroup(awayInjuries, awayInjuries[0]?.team.name || t("away"))}
    </div>
  );
}
