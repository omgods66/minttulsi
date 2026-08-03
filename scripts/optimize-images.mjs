import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(projectRoot, "assets", "source-images");
const generatedDirectory = path.join(projectRoot, "assets", "generated");
const outputDirectory = path.join(projectRoot, "public", "images");

const images = [
  { input: "mint1.webp", output: "mint-tulsi-1", width: 1600 },
  { input: "mint2.jpg", output: "mint-tulsi-2", width: 800 },
  { input: "mint3.jpg", output: "mint-tulsi-3", width: 1200 },
  { input: "mint4.webp", output: "mint-tulsi-4", width: 1200 },
];

await mkdir(outputDirectory, { recursive: true });

for (const image of images) {
  const inputPath = path.join(sourceDirectory, image.input);
  const pipeline = sharp(inputPath, { failOn: "none" })
    .rotate()
    .resize({
      width: image.width,
      height: image.width,
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    });

  await Promise.all([
    pipeline
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(path.join(outputDirectory, `${image.output}.png`)),
    pipeline
      .clone()
      .webp({ quality: 88, effort: 6, smartSubsample: true })
      .toFile(path.join(outputDirectory, `${image.output}.webp`)),
  ]);
}

await sharp(path.join(generatedDirectory, "mint-tulsi-logo-source.png"))
  .trim({ background: "#fbf8f0", threshold: 22 })
  .extend({
    top: 26,
    bottom: 26,
    left: 42,
    right: 42,
    background: "#fbf8f0",
  })
  .resize({ width: 760, withoutEnlargement: true })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(projectRoot, "public", "mint-tulsi-logo.png"));

await sharp(path.join(generatedDirectory, "mint-tulsi-social-source.png"))
  .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(projectRoot, "public", "og.png"));

console.log(
  `Optimized ${images.length} product images plus the logo and social card.`,
);
