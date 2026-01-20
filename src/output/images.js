const fs = require("fs");
const path = require("path");

module.exports = function prepareEpubImages(inDir, outDir) {
  const imageDir = path.join(outDir, "item", "image");
  fs.mkdirSync(imageDir, { recursive: true });

  const files = fs.readdirSync(inDir)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  if (files.length === 0) {
    throw new Error("EPUB用に配置する画像がありません");
  }

  // cover 判定
  const coverFile = files.find(f => /^cover\.(jpg|jpeg|png)$/i.test(f));

  const images = [];
  let index = 1;

  for (const file of files) {
    // cover はページ画像として扱わない
    if (coverFile && file === coverFile) continue;

    const ext = path.extname(file).slice(1);
    const id = String(index).padStart(3, "0");
    const fileId = `i-${id}`;
    const outName = `${fileId}.${ext}`;

    fs.copyFileSync(
      path.join(inDir, file),
      path.join(imageDir, outName)
    );

    images.push({
      id,
      file_id: fileId,
      file_name: outName,
      ext
    });

    index++;
  }

  // cover 配置
  if (coverFile) {
    const ext = path.extname(coverFile).slice(1);
    fs.copyFileSync(
      path.join(inDir, coverFile),
      path.join(imageDir, `cover.${ext}`)
    );
  } else {
    // cover が無い場合 → 先頭ページを cover にコピー
    const first = images[0];
    fs.copyFileSync(
      path.join(imageDir, first.file_name),
      path.join(imageDir, `cover.${first.ext}`)
    );
  }

  console.log(`EPUB images prepared: ${images.length}`);
  return images;
};
