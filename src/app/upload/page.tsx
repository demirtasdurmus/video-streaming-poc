"use client";

import { useState, useRef } from "react";
import * as tus from "tus-js-client";

const UploadDemo: React.FC = () => {
  const [upload, setUpload] = useState<tus.Upload | null>(null);
  const [uploadIsRunning, setUploadIsRunning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endpointInputRef = useRef<HTMLInputElement>(null);
  const chunkSizeInputRef = useRef<HTMLInputElement>(null);
  const parallelUploadsInputRef = useRef<HTMLInputElement>(null);

  const getExpiryDate = () => {
    let theDate = new Date();
    theDate.setHours(theDate.getHours() + 5);
    return theDate.toISOString();
  };

  const startUpload = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];
      if (!file) return;

      const endpoint = endpointInputRef.current?.value || "/api/cloudflare";
      const chunkSize = chunkSizeInputRef.current
        ? parseInt(chunkSizeInputRef.current?.value || "", 10) || Infinity
        : 50 * 1024 * 1024;
      const parallelUploads =
        parseInt(parallelUploadsInputRef.current?.value || "", 10) || 1;

      var mediaId = "";

      const options: tus.UploadOptions = {
        endpoint: endpoint,
        chunkSize: chunkSize,
        parallelUploads: parallelUploads,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          expiry: getExpiryDate(),
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.log("This is the famous error", JSON.stringify(error));
          alert(`Failed because: ${error}`);
          reset();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          setUploadProgress(percentage);
        },
        // onBeforeRequest: function (req) {
        //   const xhr = req.getUnderlyingObject();
        //   xhr.withCredentials = true;
        // },
        onSuccess: () => {
          console.log("Upload finished:", newUpload.url);
          alert(newUpload.url);
          reset();
        },
        onAfterResponse: function (req, res) {
          return new Promise((resolve) => {
            var mediaIdHeader = res.getHeader("stream-media-id");
            if (mediaIdHeader) {
              mediaId = mediaIdHeader;
            }
            console.log(mediaId);
            resolve();
          });
        },
      };

      const newUpload = new tus.Upload(file, options);
      newUpload.start();
      setUpload(newUpload);
      setUploadIsRunning(true);
    }
  };

  const toggleUpload = () => {
    if (upload) {
      if (uploadIsRunning) {
        upload.abort();
        setUploadIsRunning(false);
      } else {
        upload.start();
        setUploadIsRunning(true);
      }
    } else {
      startUpload();
    }
  };

  const reset = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUpload(null);
    setUploadIsRunning(false);
    setUploadProgress(0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">
        tus-js-client demo - File Upload
      </h1>

      <p>
        This demo shows the basic functionality of the tus protocol. You can
        select a file using the controls below and start/pause the upload as you
        wish.
      </p>

      <p>
        For a prettier demo please go to the{" "}
        <a
          href="http://tus.io/demo.html"
          className="text-blue-500 hover:text-blue-700"
        >
          tus.io
        </a>{" "}
        website. This demo is just here to aid developers.
      </p>

      {/* <div
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
        role="alert"
      >
        <p className="font-bold">Warning!</p>
        <p>
          Your browser may not support all features necessary to run
          tus-js-client. Some functionalities might fail silently.
        </p>
      </div> */}

      <div className="mt-4">
        <label
          htmlFor="endpoint"
          className="block text-sm font-medium text-gray-700"
        >
          Upload endpoint:
        </label>
        <input
          ref={endpointInputRef}
          type="text"
          id="endpoint"
          name="endpoint"
          defaultValue="/api/cloudflare"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="chunksize"
          className="block text-sm font-medium text-gray-700"
        >
          Chunk size (bytes):
        </label>
        <input
          ref={chunkSizeInputRef}
          type="number"
          id="chunksize"
          name="chunksize"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="paralleluploads"
          className="block text-sm font-medium text-gray-700"
        >
          Parallel upload requests:
        </label>
        <input
          ref={parallelUploadsInputRef}
          type="number"
          id="paralleluploads"
          name="paralleluploads"
          defaultValue="1"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="w-full mr-3 bg-gray-200 rounded-full h-8 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-8 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>

        <button
          className={`px-4 py-2 ${
            uploadIsRunning ? "bg-red-500" : "bg-green-500"
          } text-white rounded`}
          onClick={toggleUpload}
        >
          {uploadIsRunning ? "Pause" : "Start"} Upload
        </button>
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-medium">Uploads</h3>
      <p id="upload-list" className="mt-2 text-sm text-gray-600">
        Successful uploads will be listed here. Try one!
        {upload?.url}
      </p>
    </div>
  );
};

export default UploadDemo;
