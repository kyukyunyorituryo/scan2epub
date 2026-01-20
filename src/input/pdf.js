const fs = require("fs");
const path = require("path");
const pdf = require("pdf-poppler");

/**
 * PDFを画像に変換する
 * @param {string} pdfPath - 入力PDF
 * @param {string} outDir - 出力ディレクトリ
 * @param {object} [options]
 */
module.exports = async function pdfToImages(pdfPath, outDir, options = {}) {
  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDFファイルが存在しません");
  }

  fs.mkdirSync(outDir, { recursive: true });

  const {
    dpi = 300,
    format = "png",
    width = null,
    height = null
  } = options;

  const outPrefix = path.join(outDir, "page");

  const opts = {
    format,
    out_dir: outDir,
    out_prefix: "page",
    page: null,
    dpi,
  };

  if (width) opts.scale = width;
  if (height) opts.scale = height;

  console.log("PDF → Image 開始");

  await pdf.convert(pdfPath, opts);

  // pdf-poppler は page-1.png 形式で出力するため整形
  const files = fs.readdirSync(outDir)
    .filter(f => f.startsWith("page-"))
    .sort((a, b) => {
      const na = parseInt(a.match(/page-(\d+)/)[1], 10);
      const nb = parseInt(b.match(/page-(\d+)/)[1], 10);
      return na - nb;
    });

  let index = 1;
  for (const file of files) {
    const ext = path.extname(file);
    const newName = String(index).padStart(4, "0") + ext;

    fs.renameSync(
      path.join(outDir, file),
      path.join(outDir, newName)
    );

    index++;
  }

  console.log(`PDF pages: ${files.length}`);
};
