import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map((file) => ({
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
    const droppedFiles = Array.from(e.dataTransfer.files).map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleClear = () => {
    setFiles([]);
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
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus({ success: false, message: "Error uploading files!" });
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans px-4 py-10">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-6">{/* Logo placeholder */}</div>

        <h1 className="text-2xl font-bold mb-4">
          Image Upload and Compression
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
              {files.map((file, index) => (
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
      </div>

      <div className="flex flex-col items-center mt-10 w-1/2 mx-auto">
        <div className="mt-10 text-left">
          <h2 className="text-xl font-bold mb-2">Image Compression</h2>
          <p className="text-gray-700 text-sm">
            In terms of digital files, compression is the act of encoding
            information using fewer bits than what’s found in the original file.
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
        </div>
        <div className="mt-4 text-left">
          <h2 className="text-xl font-bold mb-2">
            Why would you want to compress images?
          </h2>
          <p className="text-gray-700 text-sm">
            Depending on the source of an image, the file could be quite large.
            A JPG from a professional DSLR camera, for example, could be dozens
            of megabytes. Depending on your needs, this could be too big.
            Compressing this image would be very useful.
            <br />
            <br />
            Likewise, you might have large images on your phone. These images
            could be taking up a lot of hard drive space and preventing you from
            taking more photos. Compressing them could free up more internal
            storage, fixing this problem.
          </p>
        </div>
        <div className="mt-4 text-left">
          <h2 className="text-xl font-bold mb-2">
            Is it safe to compress images?
          </h2>
          <p className="text-gray-700 text-sm">
            There is no need to be worried about the safety of our free service.
            Your original files will stay untouched on your system, so if you
            are unhappy with your compressed files, you can simply try again.
            Also, our unmanned system purges all data after one hour, so you
            don’t need to worry about the security of your data.
          </p>
        </div>
      </div>

      <footer className="mt-10 text-center text-gray-600 text-sm">
        <p>All uploaded files will be deleted after 1 hour.</p>
        <p>All rights reserved © 2025 Image Upload and Compression</p>
      </footer>
    </div>
  );
}

export default App;
