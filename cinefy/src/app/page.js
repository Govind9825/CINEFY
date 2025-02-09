import Image from "next/image";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

export default function Home() {
  return (
    <>
      <div className="bg-black h-screen w-full">
        <Navbar/>
        <Footer/>
      </div>
    </>
  );
}
