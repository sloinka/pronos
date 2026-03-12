"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function SubscriptionBanner() {
  const t = useTranslations("matches");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-primary shadow-2xl rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-background-dark">
            <div className="hidden sm:flex bg-background-dark text-primary p-2 rounded-lg">
              <span className="material-symbols-outlined font-black">workspace_premium</span>
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight text-slate-900">{t("unlockAllPredictions")}</h3>
              <p className="text-sm font-medium opacity-80 text-slate-800">{t("unlimitedAccess")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              href="/pricing"
              className="flex-1 md:flex-none px-6 py-2.5 bg-background-dark text-white font-black rounded-lg text-sm hover:scale-105 transition-transform text-center"
            >
              {t("subscribeNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
