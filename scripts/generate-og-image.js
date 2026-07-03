#!/usr/bin/env node
/**
 * generate-og-image.js
 * 
 * Gera a imagem OG (Open Graph) para TradeXa Fretes.
 * 
 * Uso:
 *   node scripts/generate-og-image.js
 * 
 * Pré-requisitos (instalar uma vez):
 *   npm install sharp
 * 
 * Esta gera: public/og-image.png (1200x630px)
 */

const fs = require("fs");
const path = require("path");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  AVISO: sharp não encontrado.                       ║
║                                                     ║
║  1. Instale com: npm install --save-dev sharp       ║
║  2. Execute: node scripts/generate-og-image.js      ║
║                                                     ║
║  Enquanto isso, uma versão SVG foi criada em:       ║
║  public/og-image.svg                                ║
║                                                     ║
║  O hook useSeo.tsx já referencia a imagem WebP em:  ║
║  https://www.tradexafretes.com.br/og-image.webp     ║
║                                                     ║
║  Ações necessárias:                                 ║
║  - Nenhuma — o WebP já é usado como OG Image       ║
║  - Gere o PNG com este script se quiser PNG         ║
║  - Ou converta manualmente o SVG para PNG           ║
║  - E ajuste o DEFAULT_OG_IMAGE em useSeo.tsx        ║
║    se quiser usar PNG em vez de WebP                ║
╚══════════════════════════════════════════════════════╝
    `);
    return;
  }

  const ROOT = path.resolve(__dirname, "..");
  const OUTPUT = path.join(ROOT, "public", "og-image.png");

  const width = 1200;
  const height = 630;

  // Generate the image using Sharp
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e3a5f"/>
          <stop offset="100%" stop-color="#2563eb"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#60a5fa"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <circle cx="1050" cy="-50" r="400" fill="#ffffff" opacity="0.03"/>
      <circle cx="-100" cy="${height}" r="350" fill="#ffffff" opacity="0.03"/>
      <circle cx="600" cy="315" r="500" fill="#ffffff" opacity="0.02"/>
      <text x="80" y="180" font-family="Inter, sans-serif" font-weight="800" font-size="56" fill="#ffffff">TradeXa</text>
      <text x="80" y="240" font-family="Inter, sans-serif" font-weight="300" font-size="36" fill="#93c5fd">Fretes</text>
      <text x="80" y="340" font-family="Inter, sans-serif" font-weight="700" font-size="42" fill="#ffffff">Plataforma de Fretes</text>
      <text x="80" y="395" font-family="Inter, sans-serif" font-weight="400" font-size="24" fill="#bfdbfe">Conectamos embarcadores a transportadoras verificadas</text>
      <!-- Badges -->
      <g transform="translate(80, 440)">
        <rect x="0" y="0" width="240" height="50" rx="25" fill="url(#accent)" opacity="0.2"/>
        <text x="120" y="32" font-family="Inter, sans-serif" font-weight="600" font-size="18" fill="#ffffff" text-anchor="middle">Cotações em minutos</text>
      </g>
      <g transform="translate(340, 440)">
        <rect x="0" y="0" width="240" height="50" rx="25" fill="url(#accent)" opacity="0.2"/>
        <text x="120" y="32" font-family="Inter, sans-serif" font-weight="600" font-size="18" fill="#ffffff" text-anchor="middle">Rastreamento ao vivo</text>
      </g>
      <g transform="translate(600, 440)">
        <rect x="0" y="0" width="240" height="50" rx="25" fill="url(#accent)" opacity="0.2"/>
        <text x="120" y="32" font-family="Inter, sans-serif" font-weight="600" font-size="18" fill="#ffffff" text-anchor="middle">Pagamento seguro</text>
      </g>
      <text x="${width - 80}" y="590" font-family="Inter, sans-serif" font-weight="500" font-size="18" fill="#93c5fd" text-anchor="end" opacity="0.8">tradexafretes.com.br</text>
      <!-- Truck -->
      <g transform="translate(900, 160)">
        <rect x="0" y="20" width="180" height="60" rx="10" fill="#3b82f6" opacity="0.3"/>
        <rect x="30" y="40" width="30" height="40" rx="6" fill="#60a5fa"/>
        <rect x="70" y="40" width="50" height="40" rx="6" fill="#60a5fa"/>
        <circle cx="45" cy="90" r="16" fill="#93c5fd"/>
        <circle cx="135" cy="90" r="16" fill="#93c5fd"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(OUTPUT);

  console.log(`✅ OG Image generated: ${OUTPUT}`);
  console.log(`   Size: ${width}x${height}`);
  console.log(`   URL: https://www.tradexafretes.com.br/og-image.png`);
}

main().catch(console.error);
