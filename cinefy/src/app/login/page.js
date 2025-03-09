"use client";

import React from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { SiGoogle } from "react-icons/si";

const Login = () => {
  return (
    <>
      <div className="absolute inset-0 w-full h-full">
        <Image
          className="object-fit"
          src="/login/login.png"
          layout="fill"
          alt="Login Background"
        />
      </div>

      <div className="absolute left-[50%] top-[50%] w-[437px] h-[200px] -translate-x-1/2 -translate-y-1/2 rounded-[50px] border-2 border-white/40 bg-gradient-to-b from-white/40 to-transparent shadow-inner backdrop-blur-[21px] p-6">
        
        <h2 className="text-center text-white text-[40px] font-[400] font-[BagelFatOne-Regular]">
          LOGIN
        </h2>

        <button
          onClick={() => signIn("google")}
          className="mt-6 w-[300px] h-[50px] rounded-full bg-white text-black text-[15px] font-[Risque-Regular] shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 mx-auto"
        >
          <SiGoogle size={20}  /> 
          Google
        </button>

        {/* <div className="mt-4 w-[80%] mx-auto h-[1px] bg-white/50"></div> */}
      </div>
    </>
  );
};

export default Login;
