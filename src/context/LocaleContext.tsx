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
  translateDual: (text: string) => string;
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
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sr", name: "Serbian", nativeName: "Српски" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbekcha" },
  { code: "ps", name: "Pashto", nativeName: "پښتو" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "lo", name: "Lao", nativeName: "ລາວ" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "so", name: "Somali", nativeName: "Soomaali" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "eu", name: "Basque", nativeName: "Euskara" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda" },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy" },
  { code: "ht", name: "Haitian Creole", nativeName: "Kreyòl Ayisyen" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча" },
  { code: "tk", name: "Turkmen", nativeName: "Türkmençe" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ" },
  { code: "tt", name: "Tatar", nativeName: "Татарча" },
  { code: "eo", name: "Esperanto", nativeName: "Esperanto" },
  { code: "la", name: "Latin", nativeName: "Latina" },
  { code: "jv", name: "Javanese", nativeName: "Basa Jawa" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
  { code: "ceb", name: "Cebuano", nativeName: "Cebuano" },
  { code: "ny", name: "Chichewa", nativeName: "Chichewa" },
  { code: "sn", name: "Shona", nativeName: "chiShona" },
  { code: "st", name: "Sesotho", nativeName: "Sesotho" },
  { code: "sm", name: "Samoan", nativeName: "Gagana Samoa" },
  { code: "mi", name: "Maori", nativeName: "Te Reo Māori" },
  { code: "haw", name: "Hawaiian", nativeName: "ʻŌlelo Hawaiʻi" },
  { code: "co", name: "Corsican", nativeName: "Corsu" },
  { code: "fy", name: "Frisian", nativeName: "Frysk" },
  { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch" },
  { code: "yi", name: "Yiddish", nativeName: "ייִדיש" },
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
  DK: "da", FI: "fi", NO: "no", SK: "sk", BG: "bg", HR: "hr", RS: "sr", SI: "sl", LT: "lt", LV: "lv", EE: "et", GE: "ka", AM: "hy", AZ: "az", KZ: "kk", UZ: "uz", AF: "ps", NP: "ne", LK: "si", MM: "my", KH: "km", LA: "lo", ET: "am", SO: "so", MY: "ms", ID: "id",
  AL: "sq", MK: "mk", BA: "bs", MT: "mt", IS: "is", MN: "mn",
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
  translateDual: (t) => t,
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
      trimmed[lang] = Object.fromEntries(entries.slice(-800));
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
    // Clear pending to retrigger translations for new language
    pendingTexts.current = new Set();
    inFlightTexts.current = new Set();
    forceUpdate(n => n + 1);
  }, [locale]);

  // Track in-flight texts to prevent duplicate requests
  const inFlightTexts = useRef<Set<string>>(new Set());

  const processBatch = useCallback(async () => {
    if (locale.languageCode === "en" || pendingTexts.current.size === 0) return;
    
    // Filter out texts already cached or in-flight
    const candidates = Array.from(pendingTexts.current).filter(
      t => !translationCache.current[locale.languageCode]?.[t] && !inFlightTexts.current.has(t)
    );
    pendingTexts.current = new Set();
    
    if (candidates.length === 0) return;
    
    const textsToTranslate = candidates.slice(0, 50);
    const remaining = candidates.slice(50);
    if (remaining.length > 0) {
      remaining.forEach(t => pendingTexts.current.add(t));
    }
    
    // Mark as in-flight
    textsToTranslate.forEach(t => inFlightTexts.current.add(t));
    
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

      // Remove from in-flight
      textsToTranslate.forEach(t => inFlightTexts.current.delete(t));

      // If there are still pending texts, process another batch
      if (pendingTexts.current.size > 0) {
        batchTimer.current = setTimeout(processBatch, 200);
      }
    } catch (e) {
      console.error("Translation error:", e);
      textsToTranslate.forEach(t => inFlightTexts.current.delete(t));
    } finally {
      setIsTranslating(false);
    }
  }, [locale.languageCode, locale.language]);

  const translate = useCallback((text: string): string => {
    if (!text || locale.languageCode === "en") return text;
    
    const cached = translationCache.current[locale.languageCode]?.[text];
    if (cached) return cached;
    
    // Don't re-queue if already in-flight or pending
    if (!pendingTexts.current.has(text) && !inFlightTexts.current.has(text)) {
      pendingTexts.current.add(text);
      clearTimeout(batchTimer.current);
      batchTimer.current = setTimeout(processBatch, 50);
    }
    
    return text;
  }, [locale.languageCode, processBatch]);

  // Dual-language: returns "English (Translation)" for form pages
  const translateDual = useCallback((text: string): string => {
    if (!text || locale.languageCode === "en") return text;
    
    const cached = translationCache.current[locale.languageCode]?.[text];
    if (cached) return `${text} (${cached})`;
    
    if (!pendingTexts.current.has(text) && !inFlightTexts.current.has(text)) {
      pendingTexts.current.add(text);
      clearTimeout(batchTimer.current);
      batchTimer.current = setTimeout(processBatch, 100);
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
      translateDual,
      isTranslating,
      availableLanguages: SUPPORTED_LANGUAGES,
      isEU,
      isCA,
    }}>
      {children}
    </LocaleContext.Provider>
  );
};
