# Image Compression Application

A full-stack application that implements JPEG-like compression using DCT (Discrete Cosine Transform) algorithm. The application provides both compression and decompression capabilities with a modern web interface.

## 🚀 Tech Stack

### Frontend

- React.js + Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- Sharp (image processing)
- DCT2 (discrete cosine transform)
- Multer (file handling)

## ✨ Features

- Upload multiple images via drag & drop or file selector
- JPEG-like compression using DCT algorithm
- Image preview before and after compression
- Automatic file cleanup (every 1 hour)
- Download compressed images
- Responsive UI design

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm/yarn

### Backend Setup

```bash
cd Backend
npm install
```

### Frontend Setup

```bash
cd Frontend
npm install
```

## 🚦 Running the Application

### Start Backend Server

```bash
cd Backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Development Server

```bash
cd Frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 📡 API Endpoints

### Upload and Compress Image

```http
POST /upload
Content-Type: multipart/form-data

files: [File]
```

Response:

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
Content-Type: application/json

{
    "filePath": "/path/to/compressed/file.json"
}
```

Response: Decompressed image file

### Cleanup Files

```http
DELETE /cleanup
```

Response:

```json
{
  "message": "Cleanup successful"
}
```

## 🔧 Technical Implementation

### Compression Algorithm

1. DCT Transform (converts image blocks to frequency domain)
2. Quantization (reduces data using quality matrix)
3. Zigzag Scanning (converts 2D blocks to 1D arrays)
4. Run-Length Encoding (RLE)
5. Huffman-like Encoding

### Quality Settings

- Range: 1-100
- Default: 75
- Below 50: Higher compression, lower quality
- Above 50: Lower compression, higher quality

### File Structure

```
image-compression-app/
├── Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── Backend/
    ├── app.js
    ├── pipeline.js
    └── package.json
```

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000
UPLOADS_DIR=./uploads
```
