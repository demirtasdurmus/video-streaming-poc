import React from "react";

const html = `<html>
<head>
  <link href="https://releases.transloadit.com/uppy/v3.0.1/uppy.min.css" rel="stylesheet" />
</head>
<body>
  <div id="drag-drop-area" style="height: 300px"></div>
  <div class="for-ProgressBar"></div>
  <button class="upload-button" style="font-size: 30px; margin: 20px">Upload</button>
  <div class="uploaded-files" style="margin-top: 50px">
    <ol></ol>
  </div>
  <script type="module">
    import {
      Uppy,
      Tus,
      DragDrop,
      ProgressBar,
    } from 'https://releases.transloadit.com/uppy/v3.24.0/uppy.min.mjs';

    const uppy = new Uppy({ debug: true, autoProceed: true });

    const onUploadSuccess = el => (file, response) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = response.uploadURL;
      a.target = '_blank';
      a.appendChild(document.createTextNode(file.name));
      li.appendChild(a);

      document.querySelector(el).appendChild(li);
    };

    uppy
      .use(DragDrop, { target: '#drag-drop-area' })
      .use(Tus, { endpoint: '/api/cloudflare', chunkSize: 150 * 1024 * 1024 })
      .use(ProgressBar, { target: '.for-ProgressBar', hideAfterFinish: false })
      .on('upload-success', onUploadSuccess('.uploaded-files ol'))
      .on('upload-error', (error) => {
        console.log('Upload error:', error)
      })
      .on('complete', (result) => {
        console.log('Upload result:', result)
      })

    const uploadBtn = document.querySelector('button.upload-button');
    uploadBtn.addEventListener('click', () => uppy.upload());
  </script>
</body>
</html>`;

export default function Uppy() {
  return <iframe srcDoc={html} className="w-full h-screen" />;
}
