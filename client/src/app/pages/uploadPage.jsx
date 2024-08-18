'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { redirect } from 'next/navigation';

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL;
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpload(selectedFile);
  };
  const handleUpload = async (file) => {
    try {
      const chunkSize = 100 * 1024 * 1024; // 100 MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      console.log('filesize', file.size);
      console.log('chunksize', chunkSize);
      console.log('totalchunks', totalChunks);

      // const formData = new FormData();
      // formData.append('file', file);

      let start = 0;
      const uploadPromises = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = file.slice(start, start + chunkSize);
        start += chunkSize;
        const chunkFormData = new FormData();
        chunkFormData.append('filename', file.name);
        chunkFormData.append('chunk', chunk);
        chunkFormData.append('totalChunks', totalChunks);
        chunkFormData.append('chunkIndex', chunkIndex);

        console.log('uploading chunk: ', chunkIndex + 1, 'of: ', totalChunks);
        const res = await axios.post(
          `${UPLOAD_URL}/uploads/upload1`,
          chunkFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log('response data is: ', res.data);
      }

      const res = await axios.post(`${UPLOAD_URL}/uploads/upload1`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('response data is: ', res.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='container justify-center mx-auto max-w-lg p-10'>
      <div>Upload a image file {UPLOAD_URL.toLowerCase()}</div>
      <form onSubmit={handleSubmit}>
        <input
          type='file'
          name='file'
          onChange={handleFileChange}
          className='px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
        />

        <button
          type='submit'
          className='text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
