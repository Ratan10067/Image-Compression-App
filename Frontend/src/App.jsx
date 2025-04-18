import { React, useState } from "react";

function App() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleClear = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans px-4 py-10">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="" className="w-48 h-auto" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Lossy & Lossless Image Compression
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          This online image optimizer uses a smart combination of the best
          optimization and lossy compression algorithms to shrink JPEG, GIF, and
          PNG images.
        </p>

        <div className="flex justify-center gap-4 mb-4">
          <label className="px-4 py-2 bg-blue-500 text-white font-semibold rounded cursor-pointer hover:bg-blue-600">
            Upload Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            className="px-4 py-2 bg-red-200 text-red-800 font-semibold rounded hover:bg-red-300"
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
          <p className="text-blue-500 font-semibold">Drop Your Files Here</p>
        </div>

        <button
          className="mt-6 px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
          disabled
        >
          Download All ({files.length})
        </button>

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
      <footer className="mt-10 text-center text-gray-600 text-sm">
        <p>All uploaded images will be automatically deleted after 1 hour.</p>
        <p>All rights reserved © 2025 Lossy & Lossless Image Compression</p>
      </footer>
    </div>
  );
}

export default App;
