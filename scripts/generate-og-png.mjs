#!/usr/bin/env node
/**
 * Generate OG Image PNG from the SVG source
 * Usage: node scripts/generate-og-png.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.log("⚠️  sharp not installed. Installing...");
    console.log("   Run: npm install --save-dev sharp");
    console.log("   Then run this script again.");
    process.exit(1);
  }

  const svgPath = path.join(ROOT, "public", "og-image.svg");
  const pngPath = path.join(ROOT, "public", "og-image.png");
  const width = 1200;
  const height = 630;

  const svgContent = fs.readFileSync(svgPath, "utf-8");

  await sharp(Buffer.from(svgContent))
    .resize(width, height)
    .png()
    .toFile(pngPath);

  const stats = fs.statSync(pngPath);
  console.log(`✅ OG Image PNG generated: ${pngPath}`);
  console.log(`   Size: ${width}x${height}`);
  console.log(`   File size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`   URL: https://www.tradexafretes.com.br/og-image.png`);
}

main().catch(console.error);
