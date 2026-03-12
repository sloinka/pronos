"use client";

import { useTranslations } from "next-intl";

export default function AIPreview({ preview }: { preview: string }) {
  const t = useTranslations("matchDetail");

  return (
    <section className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white dark:bg-slate-950 rounded-[calc(0.75rem-1px)] p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>{" "}
            {t("aiPreview").toUpperCase()}
          </div>
        </div>
        <h4 className="text-xl font-bold mb-4 dark:text-white">
          {t("tacticalAnalysis")}
        </h4>
        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line">
          {preview}
        </div>
      </div>
    </section>
  );
}
