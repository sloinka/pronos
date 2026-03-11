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
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3 px-1">
        <CountryFlag flag={countryFlag} country={countryName} />
        <Image
          src={leagueLogo}
          alt={leagueName}
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <h2 className="font-semibold text-text-light/90 text-sm">
          {leagueName}
        </h2>
      </div>
      <div className="space-y-2">
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
