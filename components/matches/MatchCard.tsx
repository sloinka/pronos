"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Fixture } from "@/lib/api-sports";

export default function MatchCard({
  match,
  locked,
}: {
  match: Fixture;
  locked: boolean;
}) {
  const t = useTranslations("matches");
  const kickoffTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(match.fixture.date));

  return (
    <div className="relative group overflow-hidden">
      {locked && (
        <div className="absolute inset-0 z-20 glass-overlay flex items-center justify-center gap-4 px-8">
          <div className="flex items-center gap-2 bg-primary/20 border border-primary/40 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-primary text-sm font-bold">lock</span>
            <span className="text-xs font-black text-primary uppercase tracking-tighter">{t("proMatch")}</span>
          </div>
          <Link href="/pricing" className="text-xs font-bold text-white underline underline-offset-4 hover:text-primary transition-colors">
            {t("subscribeToUnlock")}
          </Link>
        </div>
      )}

      <Link 
        href={locked ? "#" : `/match/${match.fixture.id}`}
        className={`flex items-center justify-between p-4 bg-white dark:bg-bg-dark hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors cursor-pointer ${locked ? "filter blur-[2px] opacity-60" : ""}`}
      >
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col items-center gap-1 w-12 text-[10px] font-bold text-slate-400">
            <span>{kickoffTime}</span>
          </div>
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <Image
                  src={match.teams.home.logo}
                  alt={match.teams.home.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-semibold text-sm">{match.teams.home.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={match.teams.away.logo}
                  alt={match.teams.away.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-semibold text-sm">{match.teams.away.name}</span>
              </div>
            </div>
            {!locked && (
              <div className="px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-primary uppercase tracking-wider">{t("free")}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!locked && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{t("matchDetailLabel")}</p>
              <p className="text-primary font-black">{t("aiAnalysis")}</p>
            </div>
          )}
          <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
        </div>
      </Link>
    </div>
  );
}
