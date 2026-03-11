"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { SimulationResult } from "@/lib/claude";

export default function SimulationModal({
  fixtureId,
  isSubscribed,
}: {
  fixtureId: number;
  isSubscribed: boolean;
}) {
  const t = useTranslations("simulation");
  const tMatch = useTranslations("matchDetail");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSimulate() {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch(`/api/matches/${fixtureId}/simulate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Simulation failed");
      const data = await res.json();
      setResult(data.simulation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const riskColors = { low: "badge-success", medium: "badge-warning", high: "badge-error" };
  const tempoLabels = { slow: t("slow"), medium: t("medium"), high: t("high") };

  return (
    <>
      <button
        onClick={handleSimulate}
        disabled={!isSubscribed || loading}
        className="btn btn-primary w-full"
      >
        {tMatch("simulate")}
        {!isSubscribed && (
          <span className="text-xs opacity-70 ml-2">({tMatch("premiumOnly")})</span>
        )}
      </button>

      {open && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl bg-bg-dark border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-primary">{t("title")}</h3>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-text-light/60">{t("generating")}</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Score Prediction */}
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("scorePrediction")}</h4>
                  <div className="text-5xl font-bold">
                    {result.scorePrediction.homeGoals} - {result.scorePrediction.awayGoals}
                  </div>
                  <p className="text-sm text-text-light/50 mt-1">
                    {t("confidence")}: {result.scorePrediction.confidence}%
                  </p>
                  <p className="text-sm text-text-light/60 mt-2">{result.scorePrediction.explanation}</p>
                </div>

                {/* Match Outcome */}
                <div>
                  <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("matchOutcome")}</h4>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-surface rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-primary">{result.matchOutcome.homeWin}%</div>
                      <div className="text-xs text-text-light/50">{tMatch("home")}</div>
                    </div>
                    <div className="flex-1 bg-surface rounded-lg p-3 text-center">
                      <div className="text-lg font-bold">{result.matchOutcome.draw}%</div>
                      <div className="text-xs text-text-light/50">{tMatch("draw")}</div>
                    </div>
                    <div className="flex-1 bg-surface rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-secondary">{result.matchOutcome.awayWin}%</div>
                      <div className="text-xs text-text-light/50">{tMatch("away")}</div>
                    </div>
                  </div>
                </div>

                {/* Possession */}
                <div>
                  <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("possession")}</h4>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="bg-primary" style={{ width: `${result.possession.home}%` }} />
                    <div className="bg-secondary" style={{ width: `${result.possession.away}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-text-light/50 mt-1">
                    <span>{result.possession.home}%</span>
                    <span>{result.possession.away}%</span>
                  </div>
                </div>

                {/* Corners & Shots */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("corners")}</h4>
                    <div className="flex justify-between">
                      <span>{result.corners.home}</span>
                      <span className="text-text-light/40">{result.corners.total}</span>
                      <span>{result.corners.away}</span>
                    </div>
                  </div>
                  <div className="bg-surface rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("shots")}</h4>
                    <div className="flex justify-between text-sm">
                      <div>
                        {result.shots.home} ({result.shots.homeOnTarget} {t("onTarget")})
                      </div>
                      <div>
                        {result.shots.away} ({result.shots.awayOnTarget} {t("onTarget")})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("cards")}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-5 bg-yellow-400 rounded-sm" />
                      <span>{result.cards.homeYellow} - {result.cards.awayYellow}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-5 bg-red-500 rounded-sm" />
                      <span>{result.cards.homeRed} - {result.cards.awayRed}</span>
                    </div>
                  </div>
                </div>

                {/* BTTS & Over 2.5 */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-surface rounded-lg p-4 text-center">
                    <h4 className="text-sm font-semibold text-text-light/60 mb-1">{t("btts")}</h4>
                    <div className="text-xl font-bold">{result.btts.probability}%</div>
                    <span className={`badge badge-sm mt-1 ${result.btts.prediction ? "badge-success" : "badge-error"}`}>
                      {result.btts.prediction ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex-1 bg-surface rounded-lg p-4 text-center">
                    <h4 className="text-sm font-semibold text-text-light/60 mb-1">{t("over25")}</h4>
                    <div className="text-xl font-bold">{result.over25Goals.probability}%</div>
                    <span className={`badge badge-sm mt-1 ${result.over25Goals.prediction ? "badge-success" : "badge-error"}`}>
                      {result.over25Goals.prediction ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Key Factors */}
                <div>
                  <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("keyFactors")}</h4>
                  <ul className="list-disc list-inside text-sm text-text-light/70 space-y-1">
                    {result.keyFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Risk & Tempo */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-light/60">{t("riskLevel")}:</span>
                    <span className={`badge ${riskColors[result.riskLevel]}`}>
                      {t(result.riskLevel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-light/60">{t("matchTempo")}:</span>
                    <span className="badge badge-outline">{tempoLabels[result.matchTempo]}</span>
                  </div>
                </div>

                {/* Value Bets */}
                {result.valueBets.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("valueBets")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.valueBets.map((bet, i) => (
                        <span key={i} className="badge badge-primary badge-outline">{bet}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Analysis */}
                <div>
                  <h4 className="text-sm font-semibold text-text-light/60 mb-2">{t("detailedAnalysis")}</h4>
                  <div className="text-sm text-text-light/70 leading-relaxed whitespace-pre-line">
                    {result.detailedAnalysis}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="modal-action">
              <button className="btn" onClick={() => setOpen(false)}>
                {t("close")}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
