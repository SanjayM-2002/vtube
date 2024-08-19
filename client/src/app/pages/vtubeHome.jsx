'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NavBar from '../components/navbar';
import VideoPlayer from '../components/videoPlayer';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const VTubeHome = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const WATCH_BASE_URL = process.env.NEXT_PUBLIC_WATCH_URL;

  useEffect(() => {
    const getVideos = async () => {
      try {
        const res = await axios.get(`${WATCH_BASE_URL}/watch/getVideos`);
        console.log(res);
        setVideos(res.data);
        setLoading(false); // Set loading to false when videos are fetched
      } catch (error) {
        console.log('Error in fetching videos : ', error);
        setLoading(false);
      }
    };
    getVideos();
  }, []);

  return (
    <div>
      <NavBar />
      {loading ? (
        <div className='container mx-auto flex justify-center items-center h-screen'>
          Loading...
        </div>
      ) : (
        <div className='container mx-auto p-4 h-screen bg-slate-400'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {videos.map((video) => (
              <div
                key={video.id}
                className='bg-white rounded-lg shadow-lg overflow-hidden'
              >
                <div className='relative pb-9/16'>
                  <VideoPlayer
                    src={video.masterUrl || video.url}
                    isHls={!!video.masterUrl}
                  />
                </div>
                <div className='p-4'>
                  <h2 className='text-lg font-semibold mb-2 truncate'>
                    {video.title}
                  </h2>
                  <p className='text-gray-600 truncate'>
                    Author - {video.author}
                  </p>
                  <p className='text-gray-600 truncate'>{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VTubeHome;
