import { Helmet } from "react-helmet-async";
import { useMemo } from "react";

interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = "https://www.tradexafretes.com.br";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.webp`;
const SITE_NAME = "TradeXa Fretes";
const SITE_TWITTER = "@tradexafretes";
const SUPABASE_HOST = "hovmdpwnkojklbbeersi.supabase.co";
const SITE_DESCRIPTION =
  "Plataforma de fretes que conecta embarcadores a transportadoras verificadas. Cotações em minutos, rastreamento ao vivo e pagamento seguro — tudo em um só lugar.";

/** Google Search Console verification — substitua pelo código real */
const GSC_VERIFICATION = "SEU_CODIGO_DE_VERIFICACAO_AQUI";

/** Map common image extensions to their MIME type */
function ogImageType(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    webp: "image/webp",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    avif: "image/avif",
  };
  return map[ext] || "image/webp";
}

export function useSeo(config: SeoConfig) {
  const fullTitle = config.title.includes(SITE_NAME)
    ? config.title
    : `${config.title} | ${SITE_NAME}`;

  const description = config.description || SITE_DESCRIPTION;
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  const canonical = config.canonical || BASE_URL;
  const ogType = config.ogType || "website";
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content="TradeXa Fretes" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta name="format-detection" content="telephone=no" />
      {config.keywords && <meta name="keywords" content={config.keywords} />}
      {config.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="googlebot" content="index, follow, max-image-preview:large" />
      <meta name="google" content="notranslate" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="Portuguese" />
      <meta name="geo.country" content="BR" />
      <meta name="geo.placename" content="Brasil" />
      <meta name="distribution" content="global" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="TradeXa Fretes" />
      <meta name="copyright" content={`${new Date().getFullYear()} TradeXa Tecnologia Ltda.`} />

      {/* Google Search Console */}
      {GSC_VERIFICATION !== "SEU_CODIGO_DE_VERIFICACAO_AQUI" && (
        <meta name="google-site-verification" content={GSC_VERIFICATION} />
      )}

      {/* Preconnect / dns-prefetch for critical 3rd-party origins */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://api.stripe.com" />
      <link rel="dns-prefetch" href={`https://${SUPABASE_HOST}`} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={`https://${SUPABASE_HOST}`} />

      {/* Preload critical resources */}
      <link rel="preload" href="/logo-fretes.png" as="image" fetchPriority="high" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content={ogImageType(ogImage)} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER} />
      <meta name="twitter:domain" content={new URL(BASE_URL).hostname} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:creator" content={SITE_TWITTER} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Hreflang */}
      <link rel="alternate" href={canonical} hrefLang="pt-BR" />
      <link rel="alternate" href={canonical} hrefLang="x-default" />

      {/* Last Modified */}
      <meta name="revised" content={today} />

      {/* Structured Data */}
      {config.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(config.jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
