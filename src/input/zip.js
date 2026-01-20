const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { compare } = require("natural-orderby");

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * ZIP内の画像を展開する（元ファイル名を保持）
 * @param {string} zipPath - 入力ZIPファイル
 * @param {string} outDir - 展開先ディレクトリ
 */
module.exports = async function extractFromZip(zipPath, outDir) {
  const buffer = fs.readFileSync(zipPath);
  const zip = await JSZip.loadAsync(buffer);

  const entries = Object.values(zip.files)
    .filter(f => !f.dir)
    .filter(f => IMAGE_EXTS.includes(path.extname(f.name).toLowerCase()))
    .sort((a, b) => compare()(a.name, b.name));

  if (entries.length === 0) {
    throw new Error("ZIPに画像ファイルが見つかりません");
  }

  console.log(`ZIP images: ${entries.length}`);

  for (const entry of entries) {
    const baseName = path.basename(entry.name);

    // 念のため危険な名前を除外
    if (!baseName || baseName.startsWith(".")) continue;

    const outPath = path.join(outDir, baseName);
    const data = await entry.async("nodebuffer");

    fs.writeFileSync(outPath, data);
  }
};
