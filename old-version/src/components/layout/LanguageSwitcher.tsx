import { useTranslation } from "react-i18next";

const languages = [
  { code: "pt-BR", label: "🇧🇷 PT", labelFull: "Português (Brasil)" },
  { code: "en", label: "🇺🇸 EN", labelFull: "English" },
  { code: "es", label: "🇪🇸 ES", labelFull: "Español" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface hover:text-text">
        <span>{current.label}</span>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className="absolute right-0 top-full z-50 mt-1 hidden min-w-[160px] rounded-lg border border-border bg-white shadow-lg group-hover:block">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-surface ${
              lang.code === i18n.language ? "font-semibold text-primary" : "text-text"
            } ${lang === languages[0] ? "rounded-t-lg" : ""} ${lang === languages[languages.length - 1] ? "rounded-b-lg" : ""}`}
          >
            <span className="text-base">{lang.labelFull}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
