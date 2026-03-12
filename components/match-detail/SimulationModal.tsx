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
    if (!isSubscribed) return;
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

  const riskColors = {
    low: "bg-green-500",
    medium: "bg-orange-500",
    high: "bg-red-500",
  };
  const tempoLabels = { slow: t("slow"), medium: t("medium"), high: t("high") };

  return (
    <>
      <section className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 p-10 text-slate-900 shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase tracking-tighter">
              {tMatch("simulate")}
            </h3>
            <p className="text-slate-800/80 font-medium max-w-lg">
              Get deep probabilistic insights, expected goals (xG) projections,
              and simulated outcomes based on 10,000 algorithmic runs.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-primary rounded-xl font-black text-lg hover:bg-slate-800 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50"
            >
              <span className="material-symbols-outlined">bolt</span>
              {loading ? t("generating") : tMatch("simulate").toUpperCase()}
            </button>
            {!isSubscribed && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900/60 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">lock</span>
                {tMatch("premiumOnly")}
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <span className="material-symbols-outlined text-[240px]">
            query_stats
          </span>
        </div>
        <div className="absolute -top-10 -left-10 opacity-10">
          <span className="material-symbols-outlined text-[200px]">
            precision_manufacturing
          </span>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-primary/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-primary/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  bolt
                </span>
                {t("title")}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-primary/10 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center gap-4 py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary animate-pulse">
                      bolt
                    </span>
                  </div>
                  <p className="font-bold text-slate-500 animate-pulse">
                    {t("generating")}
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-10">
                  {/* Score Prediction */}
                  <div className="text-center space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">
                      {t("scorePrediction")}
                    </p>
                    <div className="flex items-center justify-center gap-8">
                      <span className="text-7xl font-black text-slate-900 dark:text-white">
                        {result.scorePrediction.homeGoals}
                      </span>
                      <span className="text-4xl font-black text-slate-300">
                        -
                      </span>
                      <span className="text-7xl font-black text-slate-900 dark:text-white">
                        {result.scorePrediction.awayGoals}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                      <span className="text-sm font-bold text-primary">
                        {t("confidence")}: {result.scorePrediction.confidence}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 max-w-md mx-auto italic">
                      "{result.scorePrediction.explanation}"
                    </p>
                  </div>

                  {/* Outcome Probabilities */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: tMatch("home"),
                        val: result.matchOutcome.homeWin,
                        color: "bg-primary",
                      },
                      {
                        label: tMatch("draw"),
                        val: result.matchOutcome.draw,
                        color: "bg-slate-400 dark:bg-slate-600",
                      },
                      {
                        label: tMatch("away"),
                        val: result.matchOutcome.awayWin,
                        color: "bg-secondary",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-center"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          {item.label}
                        </p>
                        <p className={`text-2xl font-black ${item.color.replace('bg-', 'text-')}`}>
                          {item.val}%
                        </p>
                        <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tactical & Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      {/* Possession */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex justify-between">
                          <span>{t("possession")}</span>
                          <span className="text-slate-900 dark:text-white">
                            {result.possession.home}% -{" "}
                            {result.possession.away}%
                          </span>
                        </h4>
                        <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${result.possession.home}%` }}
                          />
                          <div
                            className="h-full bg-secondary"
                            style={{ width: `${result.possession.away}%` }}
                          />
                        </div>
                      </div>

                      {/* Shots */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                          {t("shots")}
                        </h4>
                        <div className="flex justify-between items-end gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>HOME</span>
                              <span>{result.shots.homeOnTarget} OT</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${
                                    (result.shots.home /
                                      (result.shots.home + result.shots.away ||
                                        1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-lg font-black">{result.shots.home} - {result.shots.away}</span>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{result.shots.awayOnTarget} OT</span>
                              <span>AWAY</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex justify-end">
                              <div
                                className="h-full bg-secondary"
                                style={{
                                  width: `${
                                    (result.shots.away /
                                      (result.shots.home + result.shots.away ||
                                        1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-slate-900 text-white space-y-4">
                      <p className="text-xs font-black uppercase tracking-widest text-primary">
                        Quick Predictions
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            BTTS:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              result.btts.prediction
                                ? "bg-green-500 shadow-lg shadow-green-500/20"
                                : "bg-red-500"
                            }`}
                          >
                            {result.btts.prediction ? "YES" : "NO"} (
                            {result.btts.probability}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            O2.5:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              result.over25Goals.prediction
                                ? "bg-green-500 shadow-lg shadow-green-500/20"
                                : "bg-red-500"
                            }`}
                          >
                            {result.over25Goals.prediction ? "YES" : "NO"} (
                            {result.over25Goals.probability}%)
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex gap-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-yellow-400">
                            warning
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            Risk: {result.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-primary">
                            speed
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            Tempo: {result.matchTempo.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <div className="p-6 rounded-xl bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        description
                      </span>
                      {t("detailedAnalysis")}
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed italic">
                      {result.detailedAnalysis}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-sm transition-transform active:scale-95"
                onClick={() => setOpen(false)}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
