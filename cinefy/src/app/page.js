"use client";
import React from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { SiGoogle } from "react-icons/si";

const Login = () => {
  return (
    <div className="relative w-full h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src="/login/login.png"
          alt="Login Background"
          fill
          className="object-cover  brightness-125 contrast-125"
        />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-[450px] min-h-[300px] h-auto flex flex-col items-center justify-center rounded-[30px] sm:rounded-[50px] border-2 border-white/40 bg-gradient-to-b from-white/40 to-transparent shadow-lg backdrop-blur-[20px] p-6 sm:p-8 mx-4">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={80}
          height={80}
          className="mb-4 brightness-150 sm:w-[100px] sm:h-[100px]"
        />

        {/* Login Title */}
        <h2 className="text-center text-white text-[28px] sm:text-[32px] lg:text-[40px] font-[400] font-[BagelFatOne-Regular] mb-2">
          LOGIN
        </h2>

        {/* Google Login Button */}
        <button
          onClick={() => signIn("google")}
          className="mt-4 sm:mt-6 w-full max-w-[320px] h-[50px] sm:h-[55px] rounded-full bg-white text-black text-[14px] sm:text-[16px] font-[Risque-Regular] shadow-lg flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300 px-4"
        >
          <SiGoogle size={20} className="sm:w-[22px] sm:h-[22px]" />
          <span className="whitespace-nowrap">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
