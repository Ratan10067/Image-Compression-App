const fs = require("fs");

function compressLossless(inputPath, outputJSON) {
  const image = fs.readFileSync(inputPath);
  const width = 256; // Define width for simplicity
  const height = Math.floor(image.length / width);
  const residuals = [];

  // Predictive coding
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const currentPixel = image[y * width + x];
      const predictedPixel = x > 0 ? image[y * width + x - 1] : 0;
      const residual = currentPixel - predictedPixel;
      residuals.push(residual);
    }
  }

  // Save as JSON (you can enhance this with Huffman coding)
  fs.writeFileSync(outputJSON, JSON.stringify({ width, height, residuals }));
  console.log("✅ Lossless compression complete.");
}

function decompressLossless(inputJSON, outputPath) {
  const { width, height, residuals } = JSON.parse(fs.readFileSync(inputJSON));
  const image = Buffer.alloc(width * height);

  // Predictive decoding
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const residual = residuals[y * width + x];
      const predictedPixel = x > 0 ? image[y * width + x - 1] : 0;
      const currentPixel = residual + predictedPixel;
      image[y * width + x] = Math.min(255, Math.max(0, currentPixel));
    }
  }

  fs.writeFileSync(outputPath, image);
  console.log("✅ Lossless decompression complete.");
}

module.exports = {
  compressLossless,
  decompressLossless,
};
