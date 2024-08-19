'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
const MAX_FILE_SIZE_MB = 1024;
const UploadForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_URL;
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status, router]);
  if (status === 'loading' || isLoading) {
    return (
      <div className='container mx-auto flex justify-center items-center h-screen'>
        Loading...
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(
          'The selected file is greater than 1 GB. Please select a smaller file.'
        );
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!title || !author) {
      alert('Title and Author are required fields.');
      return;
    }
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    // Check file size before starting the upload process
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      // Convert MB to bytes
      alert('The selected file is greater than the maximum limit.');
      return;
    }
    try {
      ////////////////////////////////////////////////////
      const formData = new FormData();
      formData.append('filename', selectedFile.name);
      const initializeRes = await axios.post(
        `${UPLOAD_BASE_URL}/uploads/initialize`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const { uploadId } = initializeRes.data;
      console.log('Upload id is ', uploadId);

      ////////////////////////////////////////////////////

      const chunkSize = 5 * 1024 * 1024; // 5 MB chunks
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);

      let start = 0;
      const uploadPromises = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = selectedFile.slice(start, start + chunkSize);
        start += chunkSize;
        const chunkFormData = new FormData();
        chunkFormData.append('filename', selectedFile.name);
        chunkFormData.append('chunk', chunk);
        chunkFormData.append('totalChunks', totalChunks);
        chunkFormData.append('chunkIndex', chunkIndex);
        chunkFormData.append('uploadId', uploadId);

        const uploadPromise = axios.post(
          `${UPLOAD_BASE_URL}/uploads`,
          chunkFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      ////////////////////////////////////////////////////

      const completeRes = await axios.post(
        `${UPLOAD_BASE_URL}/uploads/complete`,
        {
          filename: selectedFile.name,
          totalChunks: totalChunks,
          uploadId: uploadId,
          title: title,
          description: description,
          author: author,
        }
      );

      console.log(completeRes.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='container mx-auto max-w-lg p-10 h-screen bg-blue-300'>
      {/* <div>{UPLOAD_BASE_URL}</div> */}
      <form encType='multipart/form-data'>
        <div className='mb-4'>
          <input
            type='text'
            name='title'
            placeholder='Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className='px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='mb-4'>
          <input
            type='text'
            name='description'
            placeholder='Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='mb-4'>
          <input
            type='text'
            name='author'
            placeholder='Author'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className='px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
          />
        </div>
        <div className='mb-4'>
          <input
            type='file'
            name='file'
            onChange={handleFileChange}
            className='px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
          />
        </div>
        <button
          type='button'
          onClick={handleUpload}
          className='text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
