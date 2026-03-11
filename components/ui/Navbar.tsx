"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("common");
  const { data: session } = useSession();

  return (
    <nav className="navbar bg-surface border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          {t("appName")}
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-text-light/70 hover:text-text-light transition"
          >
            {t("home")}
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-text-light/70 hover:text-text-light transition"
          >
            {t("pricing")}
          </Link>

          <LanguageSwitcher />

          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-light/70">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="btn btn-sm btn-ghost text-text-light/70"
              >
                {t("signOut")}
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="btn btn-sm btn-primary">
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
