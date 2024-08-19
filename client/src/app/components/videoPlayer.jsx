'use client';
import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ src, isHls }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isHls && Hls.isSupported()) {
      const video = videoRef.current;
      const hls = new Hls();
      hls.attachMedia(video);
      hls.loadSource(src);
    }
  }, [src, isHls]);

  return isHls ? (
    <video ref={videoRef} controls />
  ) : (
    <ReactPlayer url={src} width='100%' height='100%' controls />
  );
};

export default VideoPlayer;
