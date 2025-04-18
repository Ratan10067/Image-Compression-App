const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

// Define storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Files will be stored in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add a timestamp to file names to avoid conflicts
  },
});

// Initialize multer with storage configuration
const upload = multer({ storage });

// Create uploads directory if not exists
const fs = require("fs");
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// API endpoint for file uploads
app.post("/upload", upload.array("files"), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded." });
    }

    // Map file details for response
    const uploadedFiles = req.files.map((file) => ({
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
    }));

    res.status(200).send({
      message: "Files uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while uploading files.",
      error: error.message,
    });
  }
});

// API endpoint to serve uploaded files (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("File upload server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
