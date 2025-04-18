// Import necessary modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv"); // To handle environment variables
const { compressImage, decompressImage } = require("./pipeline.js"); // Import compression and decompression functions
const { log } = require("console");
const glob = require("glob");
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

    res.sendFile(decompressedFilePath, (err) => {
      if (err) {
        console.error("Error sending decompressed file:", err);
        res.status(500).send({ message: "Error sending decompressed file." });
      }
    });
  } catch (error) {
    console.error("Error during file decompression:", error);

    res.status(500).send({
      message: "An error occurred while decompressing the file.",
      error: error.message,
    });
  }
});

app.delete("/cleanup", (req, res) => {
  const uploadDirectoryPath = path.join(__dirname, "uploads");
  const compressedDirectoryPath = path.join(uploadDirectoryPath, "compressed");

  // Function to delete files from a given directory
  const deleteFilesInDirectory = (directoryPath) => {
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return reject(err); // Reject the promise if reading fails
        }

        // Filter out only image and json files
        const filesToDelete = files.filter((file) =>
          file.match(/\.(png|jpg|jpeg|gif|json)$/i)
        );

        if (filesToDelete.length === 0) {
          console.log(`No files to delete in ${directoryPath}`);
          return resolve(); // Resolve if no files to delete
        }

        // Deleting the files
        const promises = filesToDelete.map((file) => {
          const filePath = path.join(directoryPath, file);
          return fs.promises
            .unlink(filePath) // Using promises to delete files
            .catch((unlinkErr) => {
              console.error(`Error deleting file: ${file}`, unlinkErr);
            });
        });

        // Wait for all deletions to finish
        Promise.all(promises)
          .then(() => {
            console.log(`All files deleted in ${directoryPath}`);
            resolve(); // Resolve after all deletions
          })
          .catch((cleanupErr) => {
            console.error(
              `Error during cleanup in ${directoryPath}:`,
              cleanupErr
            );
            reject(cleanupErr); // Reject if there was an error during cleanup
          });
      });
    });
  };

  // Delete files from both uploads and compressed directories
  Promise.all([
    deleteFilesInDirectory(uploadDirectoryPath),
    deleteFilesInDirectory(compressedDirectoryPath),
  ])
    .then(() => {
      res.send({ message: "Cleanup successful" });
    })
    .catch((err) => {
      console.error("Error cleaning up:", err);
      res.status(500).send({ message: "Error cleaning up files" });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
