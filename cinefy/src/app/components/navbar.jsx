"use client";

import React, { useState } from "react";
import "boxicons/css/boxicons.min.css";
import "../navbar.css";

const Navbar = () => {
  const links = [
    { icon: "bx-home-alt-2", color: "text-[#00f7ff]" },
    { icon: "bx-heart", color: "text-[#ff0000]" },
    // { icon: "bx-plus-circle", color: "text-[#adff2f]" },
    { icon: "bx-search", color: "text-[#adff2f]" },
    { icon: "bx-bell", color: "text-[#ffff00]" },
    { icon: "bx-user", color: "text-[#ee82ee]" },
  ];

  const [activeLink, setActiveLink] = useState(0);
  const [lightPosition, setLightPosition] = useState(links[0]);

  const handleClick = (index, event) => {
    setActiveLink(index);
    const offsetLeft = event.target.offsetLeft;
    const offsetWidth = event.target.offsetWidth;
    setLightPosition(offsetLeft - offsetWidth / 4);
  };

  return (
    <div className="flex items-center justify-center w-[80vw] mx-auto">
      <nav className="bg-black w-[100vw] h-[6em] px-[2em] relative overflow-hidden shadow-lg">
        <ul className="flex justify-between items-center h-full">
          {links.map((link, index) => (
            <li
              key={index}
              className={`nav__link ${activeLink === index ? "active" : ""}`}
              onClick={(e) => handleClick(index, e)}
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
          {/* <div
            className="nav__light absolute top-0 h-[0.4em] w-[4em] bg-white rounded-[2px] transition-all duration-300"
            style={{ left: `${lightPosition}px` }}
          ></div> */}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
