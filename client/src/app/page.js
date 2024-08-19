import Image from 'next/image';
import Room from './pages/room';
import UploadForm from './pages/uploadPage';
import VTubeHome from './pages/vtubeHome';
import VideoPlayer from './pages/videoPlayer';

export default function Home() {
  return (
    <>
      <div>
        <div>Hello world - Home</div>
        {/* <UploadForm /> */}
        {/* <VTubeHome /> */}
        <VideoPlayer />
        {/* <Room /> */}
      </div>
    </>
  );
}
