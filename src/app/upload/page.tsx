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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getExpiryDate = () => {
    let theDate = new Date();
    theDate.setHours(theDate.getHours() + 1);
    return theDate.toISOString();
  };

  const startUpload = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];
      if (!file) return;

      const endpoint =
        endpointInputRef.current?.value || "http://tusd.tusdemo.net/files/";

      const chunkSize =
        parseInt(chunkSizeInputRef.current?.value || "", 10) || Infinity;

      const parallelUploads =
        parseInt(parallelUploadsInputRef.current?.value || "", 10) || 1;

      const options: tus.UploadOptions = {
        endpoint,
        chunkSize: chunkSize,
        parallelUploads: parallelUploads,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          expiry: getExpiryDate(),
          filename: file.name,
          filetype: file.type,
          requiresignedurls: "true",
        },
        onError: (error) => {
          setErrorMessage(error.message);
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
        // onAfterResponse: function (req, res) {
        //   return new Promise((resolve) => {
        //     var mediaIdHeader = res.getHeader("stream-media-id");
        //     if (mediaIdHeader) {
        //       mediaId = mediaIdHeader;
        //     }
        //     console.log(mediaId);
        //     resolve();
        //   });
        // },
        // onUploadUrlAvailable: function () {
        //   console.log("Upload url is available");
        // },
        onShouldRetry: function (err, retryAttempt, options) {
          console.log("Error", err);
          console.log("Request", err.originalRequest);
          console.log("Response", err.originalResponse);

          var status = err.originalResponse
            ? err.originalResponse.getStatus()
            : 0;
          // Do not retry if the status is a 403.
          if (status === 403) {
            return false;
          }

          // For any other status code, we retry.
          return false;
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

      {upload && (
        <div className="w-full bg-blue-400 rounded-lg p-4 text-white relative overflow-hidden">
          <p className="text-xs">{upload.url}</p>
          <span
            className="text-black top-2 right-2 absolute font-bold text-2xl cursor-pointer"
            onClick={() => reset()}
          >
            X
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="w-full bg-red-400 rounded-lg p-4 text-white relative">
          {errorMessage}
          <span
            className="text-black top-2 right-2 absolute font-bold text-2xl cursor-pointer"
            onClick={() => setErrorMessage(null)}
          >
            X
          </span>
        </div>
      )}

      {/* <p>
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
      </p> */}

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
          defaultValue="http://tusd.tusdemo.net/files/"
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
