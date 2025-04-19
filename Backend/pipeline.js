const fs = require("fs");
const sharp = require("sharp");

//–– Helper Functions for Haar Wavelet Transform ––

function haarWavelet2D(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transformed = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Horizontal transform
  for (let i = 0; i < rows; i++) {
    const row = matrix[i];
    const temp = [];
    for (let j = 0; j < cols / 2; j++) {
      temp[j] = (row[2 * j] + row[2 * j + 1]) / 2; // Approximation
      temp[j + cols / 2] = (row[2 * j] - row[2 * j + 1]) / 2; // Detail
    }
    transformed[i] = temp;
  }

  // Vertical transform
  for (let j = 0; j < cols; j++) {
    const temp = [];
    for (let i = 0; i < rows / 2; i++) {
      temp[i] = (transformed[2 * i][j] + transformed[2 * i + 1][j]) / 2; // Approximation
      temp[i + rows / 2] =
        (transformed[2 * i][j] - transformed[2 * i + 1][j]) / 2; // Detail
    }
    for (let i = 0; i < rows; i++) {
      transformed[i][j] = temp[i];
    }
  }

  return transformed;
}

function inverseHaarWavelet2D(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const reconstructed = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Vertical inverse transform
  for (let j = 0; j < cols; j++) {
    const temp = [];
    for (let i = 0; i < rows / 2; i++) {
      temp[2 * i] = matrix[i][j] + matrix[i + rows / 2][j];
      temp[2 * i + 1] = matrix[i][j] - matrix[i + rows / 2][j];
    }
    for (let i = 0; i < rows; i++) {
      reconstructed[i][j] = temp[i];
    }
  }

  // Horizontal inverse transform
  for (let i = 0; i < rows; i++) {
    const temp = [];
    for (let j = 0; j < cols / 2; j++) {
      temp[2 * j] = reconstructed[i][j] + reconstructed[i][j + cols / 2];
      temp[2 * j + 1] = reconstructed[i][j] - reconstructed[i][j + cols / 2];
    }
    reconstructed[i] = temp;
  }

  return reconstructed;
}

//–– JPEG 2000 Compression ––
async function compressJPEG2000(inputPath, outputJSON, quality = 75) {
  const { data, info } = await sharp(inputPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const paddedWidth = Math.ceil(width / 2) * 2; // Ensure even dimensions for DWT
  const paddedHeight = Math.ceil(height / 2) * 2;

  const imageMatrix = Array.from({ length: paddedHeight }, (_, y) =>
    Array.from({ length: paddedWidth }, (_, x) =>
      y < height && x < width ? data[y * width + x] : 0
    )
  );

  // Step 1: Apply Discrete Wavelet Transform
  const dwtMatrix = haarWavelet2D(imageMatrix);

  // Step 2: Quantization
  const quantized = dwtMatrix.map((row) =>
    row.map((value) => Math.round(value / (100 / quality)))
  );

  // Step 3: Serialize data to JSON
  fs.writeFileSync(
    outputJSON,
    JSON.stringify({ width, height, quantized, quality }),
    "utf8"
  );

  console.log("✅ JPEG 2000 compression complete:", outputJSON);
}

//–– JPEG 2000 Decompression ––
async function decompressJPEG2000(inputJSON, outputPath) {
  const { width, height, quantized, quality } = JSON.parse(
    fs.readFileSync(inputJSON, "utf8")
  );

  // Step 1: Dequantization
  const dequantized = quantized.map((row) =>
    row.map((value) => value * (100 / quality))
  );

  // Step 2: Apply Inverse Discrete Wavelet Transform
  const reconstructed = inverseHaarWavelet2D(dequantized);

  // Step 3: Convert matrix back to buffer
  const buffer = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      buffer[y * width + x] = Math.min(
        255,
        Math.max(0, Math.round(reconstructed[y][x]))
      );
    }
  }

  await sharp(buffer, { raw: { width, height, channels: 1 } })
    .toFile(outputPath)
    .catch((err) => console.error("Error writing image:", err));

  console.log("✅ JPEG 2000 decompression complete:", outputPath);
}

module.exports = { compressJPEG2000, decompressJPEG2000 };
