import React, { useState, useRef } from "react";
import axios from "axios";
import "./index.css";
function App() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [decompressedImage, setDecompressedImage] = useState(null);
  const [checked, setChecked] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
      .filter((f) => f && f.type)
      .map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));
    setFiles((prev) => [...prev, ...selected]);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files)
      .filter((f) => f && f.type)
      .map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleClear = () => {
    setFiles([]);
    setUploadStatus(null);
    setDecompressedImage(null);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(({ file }) => formData.append("files", file));
    try {
      const { data } = await axios.post(
        "http://localhost:5000/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUploadStatus({ success: true, message: "Files uploaded!" });
      setDecompressedImage(data.filePath);
    } catch (err) {
      setUploadStatus({ success: false, message: "Upload failed." });
      console.error(err);
    }
  };

  const handleDecompress = async () => {
    if (!decompressedImage) return alert("Upload first!");
    try {
      const { data } = await axios.post(
        "http://localhost:5000/decompress",
        { filePath: decompressedImage },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        }
      );
      const blobUrl = URL.createObjectURL(data);
      setDecompressedImage(blobUrl);
      setChecked(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <img
          src="https://apowersoft.id/cdn/img/compress-online/picture.svg"
          alt="My App Logo"
          className="mx-auto mb-6 w-32 h-auto"
        />

        <h1 className="text-3xl font-extrabold mb-8 items-center text-center">
          Image Compressor &amp; Decompressor
        </h1>

        {/* Upload Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <label className="btn-primary">
            Select Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
          <button className="btn-secondary" onClick={handleClear}>
            Clear Queue
          </button>
        </div>

        {/* Drop Zone */}
        <div
          className="border-2 border-dashed border-blue-300 p-6 rounded-lg mb-6 bg-white hover:border-blue-500 transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {files.length ? (
            <div className="grid grid-cols-4 gap-4">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded shadow p-2 flex flex-col"
                >
                  {f.preview ? (
                    <img
                      src={f.preview}
                      alt=""
                      className="h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {f.file.name}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-center text-gray-600">
                    {(f.file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-blue-400">Drag & drop files here</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {!uploadStatus?.success && (
            <button
              className="btn-green px-8"
              onClick={handleUpload}
              disabled={!files.length}
            >
              Upload ({files.length})
            </button>
          )}
          {uploadStatus?.success && (
            <button className="btn-purple px-8" onClick={handleDecompress}>
              Decompress
            </button>
          )}
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div
            className={`p-3 mb-6 rounded text-center ${
              uploadStatus.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {uploadStatus.message}
          </div>
        )}

        {/* Decompressed Preview & Download */}
        {checked && (
          <div className="bg-white p-6 rounded shadow-lg mb-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Decompressed Image</h2>
            <img
              src={decompressedImage}
              alt="Decompressed"
              className="mx-auto mb-4 max-w-full rounded"
            />
            <a
              href={decompressedImage}
              download="decompressed.png"
              className="inline-block btn-blue"
            >
              Download Image
            </a>
          </div>
        )}
        <div className="mt-10 text-left">
          <h2 className="text-xl font-bold mb-2">Image Compression</h2>
          <p className="text-gray-700 text-sm">
            In terms of digital files, compression is the act of encoding
            information using fewer bits than what's found in the original file.
            Simply put, it means converting a large file into a smaller file.
            <br />
            <br />
            There are two types of compression: lossless and lossy. Lossless
            compression is when the compression tool removes empty, needless, or
            duplicated bits from the original file. This results in a smaller
            file that has the exact same quality as the original. Lossy
            compression is when the compressor removes excessive or unimportant
            bits from the original file. This results in a smaller file but with
            a reduced quality. With lossy compression, how small you want the
            final file to be will depend on how much loss of quality you’re
            comfortable with.
          </p>
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">
              Why would you want to compress images?
            </h2>
            <p className="text-gray-700 text-sm">
              Depending on the source of an image, the file could be quite
              large. A JPG from a professional DSLR camera, for example, could
              be dozens of megabytes. Depending on your needs, this could be too
              big. Compressing this image would be very useful.
              <br />
              <br />
              Likewise, you might have large images on your phone. These images
              could be taking up a lot of hard drive space and preventing you
              from taking more photos. Compressing them could free up more
              internal storage, fixing this problem.
            </p>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">
              How does the image compressor work?
            </h2>
            <p className="text-gray-700 text-sm">
              Our tool uses lossy compression to shrink down image files. It
              supports three file types: PNG, JPG/JPEG, and GIF. This system
              intelligently analyzes uploaded images and reduces them to the
              smallest possible file size without negatively affecting the
              overall quality.
              <br />
              <br />
              To begin, you’ll need to upload some images you’d like to
              compress. You can upload up to 20 images at once and you can feel
              free to mix and match file types. In other words, you don’t need
              to only upload JPGs and wait to upload PNGs. Our server can
              automatically parse out the files for you.
              <br />
              <br />
              First, hit the “Upload Files” button and navigate to your images.
              Once uploaded, you’ll see thumbnails for all your images arriving
              in the queue. You’ll be able to see their real-time progress as
              our server analyzes them.
            </p>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">
              Is it safe to compress images?
            </h2>
            <p className="text-gray-700 text-sm">
              There is no need to be worried about the safety of our free
              service. Your original files will stay untouched on your system,
              so if you are unhappy with your compressed files, you can simply
              try again. Also, our unmanned system purges all data after one
              hour, so you don’t need to worry about the security of your data.
            </p>
          </div>
        </div>
      </div>
      <div />
      <div className="max-w-3xl mx-auto mt-10">
        <footer className="mt-10 text-center text-gray-600 text-sm">
          <p>All uploaded images will be automatically deleted after 1 hour.</p>
          <p>All rights reserved © 2025 Lossy & Lossless Image Compression</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
