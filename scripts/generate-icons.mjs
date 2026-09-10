import { createCanvas } from "canvas";
import { writeFileSync, existsSync, rmSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "src-tauri", "icons");
const TEMP_DIR = join(__dirname, ".icon-temp");

const WINDOWS_STORE_SIZES = [
  { name: "Square30x30Logo", size: 30 },
  { name: "Square44x44Logo", size: 44 },
  { name: "Square71x71Logo", size: 71 },
  { name: "Square89x89Logo", size: 89 },
  { name: "Square107x107Logo", size: 107 },
  { name: "Square142x142Logo", size: 142 },
  { name: "Square150x150Logo", size: 150 },
  { name: "Square284x284Logo", size: 284 },
  { name: "Square310x310Logo", size: 310 },
  { name: "StoreLogo", size: 50 },
];

function drawIcon(canvas, size) {
  const ctx = canvas.getContext("2d");
  const s = size / 512;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // === DARK ROUNDED RECTANGLE BACKGROUND ===
  const radius = 96 * s;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.arcTo(size, 0, size, radius, radius);
  ctx.lineTo(size, size - radius);
  ctx.arcTo(size, size, size - radius, size, radius);
  ctx.lineTo(radius, size);
  ctx.arcTo(0, size, 0, size - radius, radius);
  ctx.lineTo(0, radius);
  ctx.arcTo(0, 0, radius, 0, radius);
  ctx.closePath();
  ctx.fillStyle = "#18181b";
  ctx.fill();

  // === PURPLE GRADIENT CIRCLE ===
  const circleR = 170 * s;
  const circleGrad = ctx.createLinearGradient(
    cx - circleR,
    cy - circleR,
    cx + circleR,
    cy + circleR,
  );
  circleGrad.addColorStop(0, "#6366f1");
  circleGrad.addColorStop(1, "#818cf8");

  ctx.beginPath();
  ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
  ctx.fillStyle = circleGrad;
  ctx.fill();

  // === WHITE LIGHTNING BOLT ===
  ctx.beginPath();
  ctx.moveTo(cx - 10 * s, cy - 120 * s);
  ctx.lineTo(cx + 50 * s, cy - 20 * s);
  ctx.lineTo(cx + 5 * s, cy - 20 * s);
  ctx.lineTo(cx + 10 * s, cy + 120 * s);
  ctx.lineTo(cx - 50 * s, cy + 20 * s);
  ctx.lineTo(cx - 5 * s, cy + 20 * s);
  ctx.closePath();

  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function createIco(images) {
  const count = images.length;
  const headerSize = 6;
  const directorySize = count * 16;
  let dataOffset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const directory = Buffer.alloc(directorySize);
  const imageDatas = [];

  for (let i = 0; i < count; i++) {
    const { size, data } = images[i];
    const entryOffset = i * 16;
    const dirEntry = directory.slice(entryOffset, entryOffset + 16);
    dirEntry.writeUInt8(size > 255 ? 0 : size, 0);
    dirEntry.writeUInt8(size > 255 ? 0 : size, 1);
    dirEntry.writeUInt8(0, 2);
    dirEntry.writeUInt8(0, 3);
    dirEntry.writeUInt16LE(1, 4);
    dirEntry.writeUInt16LE(32, 6);
    dirEntry.writeUInt32LE(data.length, 8);
    dirEntry.writeUInt32LE(dataOffset, 12);
    imageDatas.push(data);
    dataOffset += data.length;
  }

  return Buffer.concat([header, directory, ...imageDatas]);
}

async function main() {
  console.log("Drawing lightning bolt icon...");

  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true });

  const allSizes = [
    16, 30, 32, 44, 48, 50, 64, 71, 89, 107, 128, 142, 150, 256, 284, 310, 512,
  ];
  const pngBuffers = {};

  for (const size of allSizes) {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);
    pngBuffers[size] = canvas.toBuffer("image/png");
    console.log(`  ${size}x${size} drawn`);
  }

  console.log("Creating macOS iconset...");
  const iconsetDir = join(TEMP_DIR, "AppIcon.iconset");
  mkdirSync(iconsetDir, { recursive: true });

  const iconsetEntries = {
    "icon_16x16.png": pngBuffers[16],
    "icon_16x16@2x.png": pngBuffers[32],
    "icon_32x32.png": pngBuffers[32],
    "icon_32x32@2x.png": pngBuffers[64],
    "icon_128x128.png": pngBuffers[128],
    "icon_128x128@2x.png": pngBuffers[256],
    "icon_256x256.png": pngBuffers[256],
    "icon_256x256@2x.png": pngBuffers[512],
    "icon_512x512.png": pngBuffers[512],
    "icon_512x512@2x.png": pngBuffers[512],
  };

  for (const [name, buffer] of Object.entries(iconsetEntries)) {
    writeFileSync(join(iconsetDir, name), buffer);
  }

  try {
    execSync(
      `iconutil -c icns "${iconsetDir}" -o "${join(ICONS_DIR, "icon.icns")}"`,
    );
    console.log("  icon.icns generated");
  } catch (e) {
    console.warn("  iconutil failed:", e.message);
  }

  console.log("Creating .ico...");
  const icoImages = [
    { size: 16, data: pngBuffers[16] },
    { size: 32, data: pngBuffers[32] },
    { size: 48, data: pngBuffers[48] },
    { size: 64, data: pngBuffers[64] },
    { size: 128, data: pngBuffers[128] },
    { size: 256, data: pngBuffers[256] },
  ];
  writeFileSync(join(ICONS_DIR, "icon.ico"), createIco(icoImages));
  console.log("  icon.ico generated");

  writeFileSync(join(ICONS_DIR, "icon.png"), pngBuffers[512]);
  writeFileSync(join(ICONS_DIR, "128x128.png"), pngBuffers[128]);
  writeFileSync(join(ICONS_DIR, "128x128@2x.png"), pngBuffers[256]);
  writeFileSync(join(ICONS_DIR, "32x32.png"), pngBuffers[32]);
  console.log("  Main PNGs written");

  console.log("Creating Windows Store logos...");
  for (const { name, size } of WINDOWS_STORE_SIZES) {
    writeFileSync(join(ICONS_DIR, `${name}.png`), pngBuffers[size]);
    console.log(`  ${name}.png (${size}x${size})`);
  }

  rmSync(TEMP_DIR, { recursive: true });
  console.log("\nAll icons generated!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
