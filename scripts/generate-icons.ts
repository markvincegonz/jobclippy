import sharp from "sharp";
import * as path from "path";
import * as fs from "fs";

const src = "C:/Users/Maku/.gemini/antigravity/brain/d0915f5f-0a9d-4c4d-9d24-849ac6598eeb/.user_uploaded/media_1794268621071_92999f96.png";

async function run() {
  if (!fs.existsSync("public")) fs.mkdirSync("public", { recursive: true });
  if (!fs.existsSync("src/app")) fs.mkdirSync("src/app", { recursive: true });
  if (!fs.existsSync("extension/icons")) fs.mkdirSync("extension/icons", { recursive: true });

  await sharp(src).resize(512, 512).png().toFile("public/brand-icon.png");
  await sharp(src).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(src).resize(32, 32).png().toFile("src/app/icon.png");
  await sharp(src).resize(180, 180).png().toFile("src/app/apple-icon.png");
  await sharp(src).resize(16, 16).png().toFile("extension/icons/icon-16.png");
  await sharp(src).resize(48, 48).png().toFile("extension/icons/icon-48.png");
  await sharp(src).resize(128, 128).png().toFile("extension/icons/icon-128.png");

  console.log("Successfully generated all brand icon assets!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

