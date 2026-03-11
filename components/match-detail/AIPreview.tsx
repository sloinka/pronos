"use client";

import { useTranslations } from "next-intl";

export default function AIPreview({ preview }: { preview: string }) {
  const t = useTranslations("matchDetail");

  return (
    <div className="bg-surface rounded-xl p-5 border border-primary/20">
      <h3 className="font-semibold mb-3 text-primary">{t("aiPreview")}</h3>
      <div className="text-sm text-text-light/80 leading-relaxed whitespace-pre-line">
        {preview}
      </div>
    </div>
  );
}
