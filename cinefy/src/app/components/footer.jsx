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

          {/* === COMMENTED: Currently not using multiple footer link sections === */}
          {/* 
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Resources
              </h2>
              <ul className="text-gray-500 font-medium flex flex-col">
                <li className="mb-4">
                  <a href="https://flowbite.com/" className="hover:underline">
                    Flowbite
                  </a>
                </li>
                <li>
                  <a href="https://tailwindcss.com/" className="hover:underline">
                    Tailwind CSS
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Follow us
              </h2>
              <ul className="text-gray-500 font-medium flex flex-col">
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    Github
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Legal
              </h2>
              <ul className="text-gray-500 font-medium flex flex-col">
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          */}
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

          {/* === COMMENTED: Social media icons not needed right now === */}
          {/*
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-900">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 8 19">
                <path
                  d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                />
              </svg>
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 ms-5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 21 16">
                <path d="..." />
              </svg>
              <span className="sr-only">Discord</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 ms-5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 17">
                <path d="..." />
              </svg>
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 ms-5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="..." />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 ms-5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="..." />
              </svg>
              <span className="sr-only">Dribbble</span>
            </a>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
