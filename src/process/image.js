const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

/**
 * 画像の余白除去 + 白抜き処理
 * @param {string} inDir - 入力画像ディレクトリ
 * @param {string} outDir - 出力画像ディレクトリ
 * @param {object} options
 */
module.exports = async function processImages(inDir, outDir, options = {}) {
  fs.mkdirSync(outDir, { recursive: true });

const {
  trim = true,
  whiten = false,        // 背景白寄せ
  grayscale = false,     // 完全白黒化
  threshold = 245,
  quality = 100,
} = options;

  const files = fs.readdirSync(inDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .sort();

  if (files.length === 0) {
    throw new Error("処理対象の画像がありません");
  }

  for (const file of files) {
    const inPath = path.join(inDir, file);
    const outPath = path.join(outDir, file);

let img = sharp(inPath);

// 背景を白寄せ（カラー保持）
if (whiten) {
  img = img.linear(1.2, -30);
}

// 完全白黒化（任意）
if (options.grayscale) {
  img = img.grayscale();
}

// 余白除去
if (trim) {
  img = img.trim();
}

const ext = path.extname(file).toLowerCase();

if (ext === ".png") {
  await img
    .withMetadata()
    .png()
    .toFile(outPath);
} else {
  await img
    .withMetadata()
    .jpeg({ quality })
    .toFile(outPath);
}
  }

  console.log(`Image processed: ${files.length}`);
};
