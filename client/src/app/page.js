import Image from 'next/image';
import Room from './pages/room';
import UploadForm from './pages/uploadPage';

export default function Home() {
  return (
    <>
      <div>
        <div>Hello world </div>
        <UploadForm />
        {/* <Room /> */}
      </div>
    </>
  );
}
