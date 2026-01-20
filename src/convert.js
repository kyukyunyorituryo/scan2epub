#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const extractFromZip = require("./input/zip");
const extractFromPdf = require("./input/pdf");
const processImages = require("./process/image");
const prepareEpubImages = require("./output/images");

const fxlepub = require("./fxlepub3");

/**
 * CLI entry point
 */
async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error("Usage: node convert.js <input.pdf | input.zip>");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error("Input file not found:", inputPath);
    process.exit(1);
  }

  const ext = path.extname(inputPath).toLowerCase();

  // 作業ディレクトリ
  const workDir = path.resolve("work");
  const rawDir = path.join(workDir, "00_raw");
  const trimmedDir = path.join(workDir, "02_trimmed");
  const finalDir = path.join(workDir, "03_final");
cleanDir(workDir);
cleanDir(rawDir);
cleanDir(trimmedDir);
cleanDir(finalDir);
  ensureDir(workDir);
  ensureDir(rawDir);
  ensureDir(trimmedDir);
  ensureDir(finalDir);

  console.log("=== extract images ===");

  if (ext === ".zip") {
    await extractFromZip(inputPath, rawDir);
  } else if (ext === ".pdf") {
    await extractFromPdf(inputPath, rawDir);
  } else {
    console.error("Unsupported input format:", ext);
    process.exit(1);
  }

  console.log("=== process images ===");
  await processImages(rawDir, trimmedDir);

  console.log("=== prepare epub images ===");
  const pageFiles = await prepareEpubImages(trimmedDir, finalDir);

console.log("=== generate epub ===");

// index（目次）を自動生成
const coverExt = pageFiles[0].ext;
const index = [
  [`cover.${coverExt}`, "表紙"],
  ...pageFiles.map((img, i) => [img.file_name, String(i + 1)])
];

const outputEpub = path.resolve(
  path.basename(inputPath, ext) + ".epub"
);

fxlepub.gen({
  url: path.join(finalDir, "item", "image") + path.sep,
  output: outputEpub,
  title: path.basename(inputPath, ext),
  author1: "",
  author2: "",
  panel_view: "single",
  page_direction: "rtl",
  index
});

  console.log("Done:", outputEpub);
}

/**
 * ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}