// Import necessary modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv"); // To handle environment variables
const { compressImage, decompressImage } = require("./pipeline.js"); // Import compression and decompression functions
const { log } = require("console");

// Initialize dotenv for environment variables
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json()); // Add this to handle JSON requests
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Define base directories for file storage (uploads and compressed files)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
const COMPRESSED_DIR = path.join(UPLOADS_DIR, "compressed");

// Ensure the directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(COMPRESSED_DIR)) {
  fs.mkdirSync(COMPRESSED_DIR, { recursive: true });
}

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR); // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to avoid file conflicts
  },
});
const upload = multer({ storage });

// Serve uploaded files (images) from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API endpoint for file upload and compression
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded." });
    }

    const uploadedFiles = [];

    // Compress each uploaded image
    for (let file of req.files) {
      const compressedFilePath = path.join(
        COMPRESSED_DIR,
        `compressed-${file.filename}.json`
      );

      // Compress the image using the compressImage function
      await compressImage(file.path, compressedFilePath);

      uploadedFiles.push({
        originalName: file.originalname,
        storedName: file.filename,
        compressedPath: `/uploads/compressed/compressed-${file.filename}.json`, // Correct relative path
      });

      // Optionally delete the original file after compression
      fs.unlinkSync(file.path);
    }
    console.log(req.files);

    res.status(200).send({
      message: "Files uploaded and compressed successfully!",
      files: uploadedFiles,
      filePath: `/uploads/compressed/compressed-${req.files[0].filename}.json`, // Correct relative path
    });
  } catch (error) {
    console.error("Error during file upload or compression:", error);
    res.status(500).send({
      message: "An error occurred while uploading or compressing files.",
      error: error.message,
    });
  }
});

// API endpoint for decompressing the image
// Use express.urlencoded() to parse form data sent as multipart/form-data
app.post("/decompress", upload.single("file"), async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res
        .status(400)
        .send({ message: "No compressed file path provided." });
    }

    // Log the received file path for debugging
    console.log("Received compressed file path:", filePath);

    // Sanitize the filePath by removing the leading '/uploads/' if it exists
    let sanitizedFilePath = filePath.replace(/^\/uploads\//, "");

    // Resolve the absolute path to the compressed file
    const compressedFolder = path.join(__dirname, "uploads", "compressed");

    console.log(
      "Files in the compressed folder:",
      fs.readdirSync(compressedFolder)
    );

    // Ensure the sanitizedFilePath doesn't already include the 'compressed' directory
    let absoluteFilePath;
    if (sanitizedFilePath.startsWith("compressed/")) {
      absoluteFilePath = path.join(__dirname, "uploads", sanitizedFilePath);
    } else {
      absoluteFilePath = path.join(
        __dirname,
        "uploads",
        "compressed",
        sanitizedFilePath
      );
    }

    console.log("Absolute file path for decompression:", absoluteFilePath);

    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
      console.log(2); // Debugging line
      return res.status(404).send({ message: "Compressed file not found." });
    }

    console.log("File exists at path:", absoluteFilePath);

    // Construct the decompressed file path
    const decompressedFilePath = path.join(
      __dirname,
      "uploads",
      `compressed-${path.basename(sanitizedFilePath)}.png`
    );
    console.log("Decompressed file path:", decompressedFilePath);

    // Your decompression logic goes here...
    await decompressImage(absoluteFilePath, decompressedFilePath);

    res.status(200).send({
      message: "File decompressed successfully!",
      decompressedImagePath: `/uploads/decompressed-${path.basename(
        sanitizedFilePath
      )}.png`,
    });
  } catch (error) {
    console.error("Error during file decompression:", error);

    res.status(500).send({
      message: "An error occurred while decompressing the file.",
      error: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
