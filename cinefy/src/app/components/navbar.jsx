"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "boxicons/css/boxicons.min.css";
import { signOut, useSession } from "next-auth/react";
import "../navbar.css";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState(null);

  const leftLinks = [
    { icon: "bx-home-alt-2", color: "text-[#00f7ff]", route: "/home" },
    { icon: "bx-heart", color: "text-[#00f7f7]", route: "/favourites" },
  ];

  const rightLinks = [
    { icon: "bx-user", color: "text-[#00f7f7]", route: "/profile" },
    { icon: "bx-log-out", color: "text-[#00f7f7]", isLogout: true },
  ];

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  const handleClick = (link) => {
    if (link.isLogout) {
      handleLogout();
      router.push("/");
      return;
    }
    setActiveLink(link.route);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center justify-center w-[90vw] mx-auto">
      <nav className="bg-black w-[100vw] h-[6em] px-[1em] relative overflow-hidden shadow-lg rounded-md my-[1em]">
        <ul className="flex justify-between items-center h-full">
          {/* Left side links */}
          <div className="flex items-center gap-20">
            <li className="nav__link">
              <Link href="/">
                <img src="../favicon.ico" alt="Logo" className="h-10" />
              </Link>
            </li>
            {leftLinks.map((link, index) => (
              <li key={index} className={`nav__link ${activeLink === link.route ? "active" : ""}`}>
                <Link href={link.route} onClick={() => handleClick(link)}>
                  <i
                    className={`bx ${link.icon} text-white text-[2.5rem] opacity-50 ${
                      activeLink === link.route ? link.color : ""
                    }`}
                  ></i>
                </Link>
              </li>
            ))}
          </div>

          {/* Right side links */}
          <div className="flex items-center gap-8">
            {rightLinks.map((link, index) => (
              <li
                key={index + leftLinks.length}
                className={`nav__link ${activeLink === link.route ? "active" : ""}`}
              >
                {link.isLogout ? (
                  <button onClick={() => handleClick(link)}>
                    <i
                      className={`bx ${link.icon} text-white text-[2.5rem] opacity-50 ${
                        activeLink === link.route ? link.color : ""
                      }`}
                    ></i>
                  </button>
                ) : (
                  <Link href={link.route} onClick={() => handleClick(link)}>
                    <i
                      className={`bx ${link.icon} text-white text-[2.5rem] opacity-50 ${
                        activeLink === link.route ? link.color : ""
                      }`}
                    ></i>
                  </Link>
                )}
              </li>
            ))}
          </div>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
