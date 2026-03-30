import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LocaleInfo {
  country: string;
  countryCode: string;
  language: string;
  languageCode: string;
  region: string;
}

interface TranslationCache {
  [key: string]: { [text: string]: string };
}

interface LocaleContextType {
  locale: LocaleInfo;
  setLanguage: (langCode: string) => void;
  translate: (text: string) => string;
  isTranslating: boolean;
  availableLanguages: { code: string; name: string; nativeName: string }[];
  isEU: boolean;
  isCA: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "tl", name: "Filipino", nativeName: "Tagalog" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
];

const EU_COUNTRIES = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
  "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","GB","IS","LI","NO","CH"
];

const COUNTRY_TO_LANG: Record<string, string> = {
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en",
  MX: "es", ES: "es", AR: "es", CO: "es", PE: "es", CL: "es", VE: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  FR: "fr", BE: "fr", CH: "fr", SN: "fr", CI: "fr", ML: "fr", CM: "fr", CD: "fr", MG: "fr", HT: "fr",
  BR: "pt", PT: "pt", AO: "pt", MZ: "pt",
  CN: "zh", TW: "zh-TW", HK: "zh-TW",
  SA: "ar", EG: "ar", IQ: "ar", MA: "ar", DZ: "ar", SD: "ar", SY: "ar", YE: "ar", TN: "ar", JO: "ar", LY: "ar", LB: "ar", AE: "ar", OM: "ar", KW: "ar", QA: "ar", BH: "ar",
  IN: "hi", RU: "ru", JP: "ja", KR: "ko", DE: "de", AT: "de", IT: "it", TR: "tr", VN: "vi", TH: "th", PL: "pl", UA: "uk", NL: "nl", SE: "sv", BD: "bn", IL: "he", IR: "fa", PK: "ur", PH: "tl",
  KE: "sw", TZ: "sw", RO: "ro", HU: "hu", GR: "el", CZ: "cs",
};

const DEFAULT_LOCALE: LocaleInfo = {
  country: "United States",
  countryCode: "US",
  language: "English",
  languageCode: "en",
  region: "NA",
};

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLanguage: () => {},
  translate: (t) => t,
  isTranslating: false,
  availableLanguages: SUPPORTED_LANGUAGES,
  isEU: false,
  isCA: false,
});

export const useLocale = () => useContext(LocaleContext);

const CACHE_KEY = "tfcs_translation_cache";
const LOCALE_KEY = "tfcs_locale_override";

function loadCache(): TranslationCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCache(cache: TranslationCache) {
  try {
    const trimmed: TranslationCache = {};
    for (const lang of Object.keys(cache)) {
      const entries = Object.entries(cache[lang]);
      trimmed[lang] = Object.fromEntries(entries.slice(-500));
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch { }
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<LocaleInfo>(DEFAULT_LOCALE);
  const [isTranslating, setIsTranslating] = useState(false);
  const translationCache = useRef<TranslationCache>(loadCache());
  const pendingTexts = useRef<Set<string>>(new Set());
  const batchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const savedOverride = localStorage.getItem(LOCALE_KEY);
    if (savedOverride) {
      try {
        const parsed = JSON.parse(savedOverride);
        setLocale(parsed);
        return;
      } catch { }
    }

    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        if (data && data.country_code) {
          const countryCode = data.country_code;
          const langCode = COUNTRY_TO_LANG[countryCode] || "en";
          const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
          
          const newLocale: LocaleInfo = {
            country: data.country_name || "Unknown",
            countryCode,
            language: langInfo.name,
            languageCode: langCode,
            region: data.continent_code || "NA",
          };
          setLocale(newLocale);
        }
      })
      .catch(() => {
        const browserLang = navigator.language.split("-")[0];
        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
        if (langInfo && langInfo.code !== "en") {
          setLocale(prev => ({ ...prev, language: langInfo.name, languageCode: langInfo.code }));
        }
      });
  }, []);

  const setLanguage = useCallback((langCode: string) => {
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (!langInfo) return;
    
    const newLocale: LocaleInfo = {
      ...locale,
      language: langInfo.name,
      languageCode: langCode,
    };
    setLocale(newLocale);
    localStorage.setItem(LOCALE_KEY, JSON.stringify(newLocale));
    forceUpdate(n => n + 1);
  }, [locale]);

  const processBatch = useCallback(async () => {
    if (locale.languageCode === "en" || pendingTexts.current.size === 0) return;
    
    const textsToTranslate = Array.from(pendingTexts.current).slice(0, 20);
    pendingTexts.current.clear();
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate-content", {
        body: {
          texts: textsToTranslate,
          targetLanguage: locale.languageCode,
          targetLanguageName: locale.language,
        },
      });

      if (!error && data?.translations) {
        if (!translationCache.current[locale.languageCode]) {
          translationCache.current[locale.languageCode] = {};
        }
        for (let i = 0; i < textsToTranslate.length; i++) {
          if (data.translations[i]) {
            translationCache.current[locale.languageCode][textsToTranslate[i]] = data.translations[i];
          }
        }
        saveCache(translationCache.current);
        forceUpdate(n => n + 1);
      }
    } catch (e) {
      console.error("Translation error:", e);
    } finally {
      setIsTranslating(false);
    }
  }, [locale.languageCode, locale.language]);

  const translate = useCallback((text: string): string => {
    if (!text || locale.languageCode === "en") return text;
    
    const cached = translationCache.current[locale.languageCode]?.[text];
    if (cached) return cached;
    
    if (!pendingTexts.current.has(text)) {
      pendingTexts.current.add(text);
      clearTimeout(batchTimer.current);
      batchTimer.current = setTimeout(processBatch, 300);
    }
    
    return text;
  }, [locale.languageCode, processBatch]);

  const isEU = EU_COUNTRIES.includes(locale.countryCode);
  const isCA = locale.countryCode === "US" && locale.region === "NA";

  return (
    <LocaleContext.Provider value={{
      locale,
      setLanguage,
      translate,
      isTranslating,
      availableLanguages: SUPPORTED_LANGUAGES,
      isEU,
      isCA,
    }}>
      {children}
    </LocaleContext.Provider>
  );
};
