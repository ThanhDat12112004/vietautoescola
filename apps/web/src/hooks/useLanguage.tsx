import React, { createContext, useContext, useState } from "react";
import type { Language } from '@/lib/api/types';

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (vi: string, es: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
  t: (vi) => vi,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>("vi");

  const t = (vi: string, es: string) => (lang === "vi" ? vi : es);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
