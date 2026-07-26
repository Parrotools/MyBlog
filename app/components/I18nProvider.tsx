"use client";

import { createContext, useContext } from "react";
import { dicts, type Dict, type Locale } from "../lib/i18n";

const I18nContext = createContext<{ locale: Locale; t: Dict }>({
  locale: "en",
  t: dicts.en,
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dicts[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
