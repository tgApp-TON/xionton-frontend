#!/usr/bin/env node
/**
 * One-off: convert logo.svg to public/icon.png at 512x512
 * Run: node scripts/convert-logo-to-png.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'logo.svg');
const outPath = join(root, 'public', 'icon.png');

const svg = readFileSync(svgPath, 'utf8');
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
const rendered = resvg.render();
const pngData = rendered.asPng();
writeFileSync(outPath, pngData);
console.log(`Wrote ${outPath} (${rendered.width}x${rendered.height})`);
