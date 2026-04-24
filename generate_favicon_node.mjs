import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { createWriteStream, existsSync, writeFileSync } from 'fs';
import { get } from 'https';

const FONT_PATH = 'BarlowCondensed-ExtraBoldItalic.ttf';

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

function drawFavicon(size, radius, fontSize) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Clip to rounded rectangle
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // Diagonal gradient background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgb(19,28,44)');
  grad.addColorStop(1, 'rgb(29,48,72)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Centered "S"
  ctx.font = `italic 800 ${fontSize}px BarlowCondensed`;
  ctx.fillStyle = 'rgba(236,240,246,1)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', size / 2, size / 2);

  return canvas;
}

if (!existsSync(FONT_PATH)) {
  console.log('Downloading font...');
  await download(
    'https://github.com/google/fonts/raw/main/ofl/barlowcondensed/BarlowCondensed-ExtraBoldItalic.ttf',
    FONT_PATH
  );
  console.log('Font downloaded.');
}

GlobalFonts.registerFromPath(FONT_PATH, 'BarlowCondensed');

writeFileSync('favicon.png', drawFavicon(512, 110, 340).toBuffer('image/png'));
console.log('Saved favicon.png');

for (const s of [16, 32, 48]) {
  const r = Math.round(110 * s / 512);
  const f = Math.round(340 * s / 512);
  writeFileSync(`favicon-${s}.png`, drawFavicon(s, r, f).toBuffer('image/png'));
  console.log(`Saved favicon-${s}.png`);
}

console.log('Done');
