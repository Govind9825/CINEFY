'use client';
import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black mx-auto left-0 w-[90vw]">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Cinefy Logo"
                width={80}
                height={80}
                className="me-3"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                Cinefy
              </span>
            </a>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2025{" "}
            <a href="/" className="hover:underline">
              Cinefy™
            </a>
            . All Rights Reserved.
          </span>

          <div className="mt-4 sm:mt-0">
            <a
              href="https://portfolio-govind9825s-projects.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
