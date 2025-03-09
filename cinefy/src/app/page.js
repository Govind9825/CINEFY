import Image from "next/image";
import dbConnect from "./lib/db";

export default async function Home() {
  await dbConnect()
  return (
    <>
      <div className="absolute inset-0 w-full h-full">
              <Image
                className="object-cover"
                src="/login/login.png"
                layout="fill"
                alt="Login Background"
              />
            </div>
    </>
  );
}
