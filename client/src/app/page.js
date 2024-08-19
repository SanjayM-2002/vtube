import Image from 'next/image';
import Room from './pages/room';
import UploadForm from './pages/uploadPage';
import VTubeHome from './pages/vtubeHome';

export default function Home() {
  return (
    <>
      <div>
        <div>Hello world - Home</div>
        {/* <UploadForm /> */}
        <VTubeHome />
        {/* <Room /> */}
      </div>
    </>
  );
}
