"use client";

import { useEffect, useState } from "react";
import { getStoredLang, saveLang } from "lib/session";

export function useLang(defaultLang = "es") {
  const [lang, setLangState] = useState(defaultLang);

  useEffect(() => {
    setLangState(getStoredLang());
  }, []);

  function setLang(nextLang) {
    setLangState(nextLang);
    saveLang(nextLang);
  }

  return { lang, setLang };
}
