import Image from 'next/image';
import Room from './pages/room';
import VTubeHome from './pages/vtubeHome';
import VideoPlayer from './components/videoPlayer';

export default function Home() {
  return (
    <>
      <div>
        {/* <div>Hello world - Home</div> */}

        <VTubeHome />
        {/* <VideoPlayer /> */}
        {/* <Room /> */}
      </div>
    </>
  );
}
