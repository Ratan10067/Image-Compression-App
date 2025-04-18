# Image Compression Application

A Node.js application that provides image compression using DCT (Discrete Cosine Transform) and implements JPEG-like compression techniques.

## Features

- Image upload and compression
- JPEG-like compression algorithm
- Image decompression
- Automatic cleanup of processed files

## API Routes

### Upload and Compress Image

```http
POST /upload
```

- **Purpose**: Upload and compress images
- **Input**: Form data with key `files` (supports multiple files)
- **Response**:
  ```json
  {
    "message": "Files uploaded and compressed successfully!",
    "files": [
      {
        "originalName": "example.jpg",
        "storedName": "timestamp-example.jpg",
        "compressedPath": "/uploads/compressed/compressed-timestamp-example.jpg.json"
      }
    ],
    "filePath": "/uploads/compressed/compressed-timestamp-example.jpg.json"
  }
  ```

### Decompress Image

```http
POST /decompress
```

- **Purpose**: Decompress previously compressed images
- **Input**: JSON body with `filePath` parameter
- **Response**: Decompressed image file

### Cleanup Files

```http
DELETE /cleanup
```

- **Purpose**: Remove all processed files from uploads directory
- **Response**:
  ```json
  {
    "message": "Cleanup successful"
  }
  ```

## Compression Details

### Compression Algorithm

The application implements a JPEG-like compression using the following steps:

1. **DCT Transform**: Converts image blocks into frequency domain
2. **Quantization**: Reduces data using quality-based quantization matrix
3. **Zigzag Scanning**: Converts 2D blocks to 1D arrays
4. **Run-Length Encoding (RLE)**: Compresses consecutive values
5. **Huffman-like Encoding**: Further compresses data using variable-length codes

### Quality Settings

- Quality range: 1-100
- Default quality: 75
- Quality < 50: Higher compression, lower quality
- Quality > 50: Lower compression, higher quality

### Storage Structure

```
/uploads/
├── (original uploaded images - temporary)
└── compressed/
    └── (compressed .json files)
```

## Technical Requirements

- Node.js
- Express.js
- Sharp (for image processing)
- Multer (for file uploads)
- DCT2 (for DCT transformations)

## Environment Variables

```env
PORT=5000
UPLOADS_DIR=./uploads
```

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

Server will start at `http://localhost:5000`
