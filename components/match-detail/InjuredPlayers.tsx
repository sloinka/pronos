import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Injury } from "@/lib/api-sports";

interface InjuredPlayersProps {
  injuries: Injury[];
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
}

export default function InjuredPlayers({
  injuries,
  homeTeamId,
  homeTeamName,
  homeTeamLogo,
  awayTeamName,
  awayTeamLogo,
}: InjuredPlayersProps) {
  const t = useTranslations("matchDetail");

  const homeInjuries = injuries.filter((i) => i.team.id === homeTeamId);
  const awayInjuries = injuries.filter((i) => i.team.id !== homeTeamId);

  const renderGroup = (
    teamInjuries: Injury[],
    teamName: string,
    isHome: boolean
  ) => {
    if (teamInjuries.length === 0) return null;

    return (
      <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
        <div className="bg-white/5 px-4 py-2 border-b border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            {teamName}
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {teamInjuries.map((injury, idx) => (
            <div
              key={`${injury.player.id}-${idx}`}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                  {injury.player.photo ? (
                    <Image
                      src={injury.player.photo}
                      alt={injury.player.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                      {injury.player.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{injury.player.name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    injury.player.type === "Missing Fixture"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  }`}
                >
                  {injury.player.type}
                </span>
                <span className="text-[10px] text-slate-500">{injury.player.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (injuries.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h4 className="text-xs font-black uppercase tracking-tighter flex items-center gap-2 text-white">
        <span className="material-symbols-outlined text-red-500 text-lg fill-1">person_off</span>
        {t("injuries")}
      </h4>
      <div className="flex flex-col gap-4">
        {renderGroup(homeInjuries, homeTeamName, true)}
        {renderGroup(awayInjuries, awayTeamName, false)}
      </div>
    </section>
  );
}
