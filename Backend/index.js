const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
const dotenv = require("dotenv");
const { compressImage, decompressImage } = require("./pipeline.js");
const serverless = require("serverless-http");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(os.tmpdir(), "uploads");
const COMPRESSED_DIR = path.join(UPLOADS_DIR, "compressed");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(COMPRESSED_DIR)) {
  fs.mkdirSync(COMPRESSED_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve uploaded files
app.use("/api/uploads", express.static(UPLOADS_DIR));

app.get("/api/test", (req, res) => {
  res.send("Backend is working!");
});

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded." });
    }

    const uploadedFiles = [];

    for (let file of req.files) {
      const compressedFilePath = path.join(
        COMPRESSED_DIR,
        `compressed-${file.filename}.json`
      );

      await compressImage(file.path, compressedFilePath);

      uploadedFiles.push({
        originalName: file.originalname,
        storedName: file.filename,
        compressedPath: `/api/uploads/compressed/compressed-${file.filename}.json`,
      });

      fs.unlinkSync(file.path);
    }

    res.status(200).send({
      message: "Files uploaded and compressed successfully!",
      files: uploadedFiles,
      filePath: `/api/uploads/compressed/compressed-${req.files[0].filename}.json`,
    });
  } catch (error) {
    console.error("Error during upload/compression:", error);
    res
      .status(500)
      .send({ message: "Upload/compression error", error: error.message });
  }
});

app.post("/api/decompress", upload.single("file"), async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res
        .status(400)
        .send({ message: "No compressed file path provided." });
    }

    let sanitizedFilePath = filePath.replace(/^\/api\/uploads\//, "");
    const compressedFolder = path.join(UPLOADS_DIR, "compressed");

    let absoluteFilePath;
    if (sanitizedFilePath.startsWith("compressed/")) {
      absoluteFilePath = path.join(UPLOADS_DIR, sanitizedFilePath);
    } else {
      absoluteFilePath = path.join(compressedFolder, sanitizedFilePath);
    }

    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).send({ message: "Compressed file not found." });
    }

    const decompressedFilePath = path.join(
      UPLOADS_DIR,
      `decompressed-${path.basename(sanitizedFilePath)}.png`
    );

    await decompressImage(absoluteFilePath, decompressedFilePath);

    res.sendFile(decompressedFilePath, (err) => {
      if (err) {
        console.error("Error sending decompressed file:", err);
        res.status(500).send({ message: "Error sending decompressed file." });
      }
    });
  } catch (error) {
    console.error("Error during decompression:", error);
    res
      .status(500)
      .send({ message: "Decompression error", error: error.message });
  }
});

app.delete("/api/cleanup", (req, res) => {
  const deleteFilesInDirectory = (directoryPath) => {
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) return reject(err);
        const filesToDelete = files.filter((file) =>
          file.match(/\.(png|jpg|jpeg|gif|json)$/i)
        );
        const promises = filesToDelete.map((file) =>
          fs.promises
            .unlink(path.join(directoryPath, file))
            .catch(console.error)
        );
        Promise.all(promises).then(resolve).catch(reject);
      });
    });
  };

  Promise.all([
    deleteFilesInDirectory(UPLOADS_DIR),
    deleteFilesInDirectory(COMPRESSED_DIR),
  ])
    .then(() => res.send({ message: "Cleanup successful" }))
    .catch((err) => {
      console.error("Cleanup error:", err);
      res.status(500).send({ message: "Cleanup failed", error: err.message });
    });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Local: http://localhost:${PORT}`));
}

module.exports = app;
module.exports.handler = serverless(app);
