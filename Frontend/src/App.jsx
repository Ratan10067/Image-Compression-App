import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [decompressedImage, setDecompressedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
      .filter((file) => file && file.type) // Ensure valid files
      .map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter((file) => file && file.type) // Ensure valid files
      .map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleClear = () => {
    setFiles([]);
    setUploadStatus(null);
    setDecompressedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus({
        success: true,
        message: "Files uploaded successfully!",
      });
      console.log(response.data);
      const filePath = response.data.filePath; // Assuming the backend sends a filePath
      setDecompressedImage(filePath);
    } catch (error) {
      setUploadStatus({ success: false, message: "Error uploading files!" });
      console.error("Error uploading files:", error);
    }
  };

  const handleDecompress = async () => {
    try {
      if (!decompressedImage) {
        alert("Please upload and compress an image first!");
        return;
      }

      const filePath = decompressedImage;
      console.log("Decompressing file:", filePath);

      const response = await axios.post(
        "http://localhost:5000/decompress",
        { filePath },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        "Decompressed image path:",
        response.data.decompressedImagePath
      );
      console.log("Decompressed image:", response.data);
      setDecompressedImage(response.data.decompressedImagePath);
      console.log(decompressedImage);
    } catch (error) {
      console.error("Error decompressing file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans px-4 py-10">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">
          Image Upload, Compression, and Decompression
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <label className="px-4 py-2 bg-blue-500 text-white font-semibold rounded cursor-pointer hover:bg-blue-600">
            Select Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
          <button
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600"
            onClick={handleClear}
          >
            Clear Queue
          </button>
        </div>

        <div
          className="border border-dashed border-blue-400 bg-blue-50 p-10 rounded-lg transition-all duration-300"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {files.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {files
                .filter((file) => file && file.file) // Filter out invalid entries
                .map((file, index) => (
                  <div
                    key={index}
                    className="relative border rounded-lg overflow-hidden shadow-sm"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500">
                        <p className="text-sm">{file.file.name}</p>
                      </div>
                    )}
                    <div className="bg-white p-2 text-center">
                      <p className="text-sm truncate">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-blue-500 font-semibold">
              Drag and drop your files here
            </p>
          )}
        </div>

        {!uploadStatus?.success && (
          <button
            className={`mt-6 px-6 py-2 rounded-lg font-semibold ${
              files.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            onClick={handleUpload}
            disabled={files.length === 0}
          >
            Upload Files ({files.length})
          </button>
        )}

        {uploadStatus?.success && (
          <button
            className="mt-6 px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600"
            onClick={handleDecompress}
          >
            Decompress Image
          </button>
        )}

        {uploadStatus && (
          <div
            className={`mt-4 p-4 rounded ${
              uploadStatus.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {uploadStatus.message}
          </div>
        )}

        {decompressedImage && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">Decompressed Image</h3>
            <img
              src={decompressedImage}
              alt="Decompressed"
              className="mt-4 w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
