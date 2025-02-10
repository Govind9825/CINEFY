import React from "react";
import Image from "next/image";

const Login = () => {
  return (
    <>
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          className="object-cover"
          src="/login/login.png"
          layout="fill"
          alt="Login Background"
        />
      </div>

      {/* Login Form Container */}
      <div className="absolute left-[50%] top-[50%] w-[437px] h-[458px] -translate-x-1/2 -translate-y-1/2 rounded-[50px] border-2 border-white/40 bg-gradient-to-b from-white/40 to-transparent shadow-inner backdrop-blur-[21px] p-6">
        
        {/* Login Title */}
        <h2 className="text-center text-white text-[40px] font-[400] font-[BagelFatOne-Regular]">
          LOGIN
        </h2>

        {/* Form */}
        <form className="flex flex-col items-center mt-8">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter Email"
            className="w-[376px] h-[56px] px-4 rounded-[50px] bg-white opacity-75 shadow-md text-black text-[15px] font-[Risque-Regular] focus:outline-none"
            required
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Enter Password"
            className="w-[375px] h-[56px] px-4 mt-5 rounded-[50px] bg-white opacity-75 shadow-md text-black text-[15px] font-[Risque-Regular] focus:outline-none"
            required
          />

          {/* Forgot Password */}
          <p className="mt-2 text-white text-[13px] font-[Risque-Regular] cursor-pointer">
            Forgot Password?
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-6 w-[150px] h-[41px] rounded-full bg-gray-300 opacity-75 text-black text-[15px] font-[Risque-Regular] shadow-md hover:opacity-100 transition-all duration-300"
          >
            Submit
          </button>

          {/* Sign-up Link */}
          <p className="mt-4 text-white text-[13px] font-[Risque-Regular] cursor-pointer">
            Not registered yet? <span className="underline">Sign up</span>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
