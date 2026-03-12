import Image from "next/image";
import CountryFlag from "./CountryFlag";
import MatchCard from "./MatchCard";
import type { Fixture } from "@/lib/api-sports";

export default function LeagueGroup({
  leagueName,
  leagueLogo,
  countryFlag,
  countryName,
  matches,
  lockedIndexes,
}: {
  leagueName: string;
  leagueLogo: string;
  countryFlag: string | null;
  countryName: string;
  matches: Fixture[];
  lockedIndexes: Set<number>;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 mb-8">
      <div className="bg-slate-100 dark:bg-white/5 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <CountryFlag flag={countryFlag} country={countryName} />
          <h2 className="font-bold text-sm tracking-wide uppercase text-slate-600 dark:text-primary/80">
            {leagueName} · {countryName}
          </h2>
        </div>
        <span className="material-symbols-outlined text-slate-400">expand_more</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {matches.map((match, idx) => (
          <MatchCard
            key={match.fixture.id}
            match={match}
            locked={lockedIndexes.has(idx)}
          />
        ))}
      </div>
    </div>
  );
}
