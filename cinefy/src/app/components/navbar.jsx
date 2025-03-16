"use client";

import React, { useState } from "react";
import "boxicons/css/boxicons.min.css";
import "../navbar.css";

const Navbar = () => {
  const leftLinks = [
    { icon: "bx-home-alt-2", color: "text-[#00f7ff]" },
    { icon: "bx-heart", color: "text-[#ff0000]" },
  ];

  const rightLinks = [
    { icon: "bx-user", color: "text-[#ee82ee]" },
    { icon: "bx-log-out", color: "text-[#ff0000]" }, // Sign-out icon
  ];

  const [activeLink, setActiveLink] = useState(0);
  const [lightPosition, setLightPosition] = useState(leftLinks[0]);

  const handleClick = (index, event, linkType) => {
    setActiveLink(index);
    const offsetLeft = event.target.offsetLeft;
    const offsetWidth = event.target.offsetWidth;
    setLightPosition(offsetLeft - offsetWidth / 4);
  };

  return (
    <div className="flex items-center justify-center w-[90vw] mx-auto">
      <nav className="bg-black w-[100vw] h-[6em] px-[1em] relative overflow-hidden shadow-lg rounded-md my-[1em]">
        <ul className="flex justify-between items-center h-full">
          {/* Left side links */}
          <div className="flex items-center gap-20"> {/* Add gap between left-side elements */}
            <li className="nav__link">
              <a href="#" className="text-white text-[2.5rem] opacity-50">
                <img src="../favicon.ico" alt="Logo" className="h-10" /> {/* Add your logo here */}
              </a>
            </li>
            {leftLinks.map((link, index) => (
              <li
                key={index}
                className={`nav__link ${activeLink === index ? "active" : ""}`}
                onClick={(e) => handleClick(index, e, "left")}
              >
                <a
                  href="#"
                  className={`text-white text-[2.5rem] opacity-50 ${
                    activeLink === index ? link.color : ""
                  }`}
                >
                  <i className={`bx ${link.icon}`}></i>
                </a>
              </li>
            ))}
          </div>

          {/* Right side links */}
          <div className="flex items-center gap-8"> {/* Add gap between right-side elements */}
            {rightLinks.map((link, index) => (
              <li
                key={index + leftLinks.length}
                className={`nav__link ${
                  activeLink === index + leftLinks.length ? "active" : ""
                }`}
                onClick={(e) => handleClick(index + leftLinks.length, e, "right")}
              >
                <a
                  href="#"
                  className={`text-white text-[2.5rem] opacity-50 ${
                    activeLink === index + leftLinks.length ? link.color : ""
                  }`}
                >
                  <i className={`bx ${link.icon}`}></i>
                </a>
              </li>
            ))}
          </div>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;