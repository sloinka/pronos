"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function SubscriptionBanner() {
  const t = useTranslations("matches");

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-md bg-bg-dark/60 z-10 flex flex-col items-center justify-center gap-3">
        <p className="text-lg font-semibold text-text-light">
          {t("subscribeToUnlock")}
        </p>
        <Link href="/pricing" className="btn btn-primary btn-sm">
          {t("subscribeToUnlock")}
        </Link>
      </div>
    </div>
  );
}
