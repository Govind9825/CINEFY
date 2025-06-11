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
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const leftLinks = [
    { icon: "bx-home-alt-2", color: "text-[#6366F1]", route: "/home", label: "Home" },
    { icon: "bx-heart", color: "text-[#6366F1]", route: "/favourites", label: "Favourites" },
    { icon: "bx-video", color: "text-[#6366F1]", route: "/stream", label: "Stream" },
  ];

  const rightLinks = [
    { icon: "bx-user", color: "text-[#6366F1]", route: "/profile", label: "Profile" },
    { icon: "bx-log-out", color: "text-[#6366F1]", isLogout: true, label: "Logout" },
  ];

  if (session?.user?.email === "cinefyweb@gmail.com") {
    leftLinks.push({ icon: "bx-cog", color: "text-[#6366F1]", route: "/admin", label: "Admin" });
  }

  useEffect(() => {
    setActiveLink(pathname);
    setLoading(false); // Stop loader when pathname changes
  }, [pathname]);

  const handleClick = async (link) => {
    sessionStorage.removeItem("selectedContent"); // Clear it on any route change
    setIsMenuOpen(false); // Close mobile menu
    if (link.isLogout) {
      setLoading(true);
      await signOut();
      router.push("/");
    } else {
      setLoading(true);
      setActiveLink(link.route);
      router.push(link.route);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-[90vw] mx-auto">
      <nav className="bg-black w-[100vw] h-[6em] sm:h-[5em] md:h-[6em] px-[0.5em] sm:px-[1em] relative overflow-visible shadow-lg rounded-md my-[1em]">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex justify-between items-center h-full">
          {/* Left side links */}
          <div className="flex items-center gap-8 lg:gap-12 xl:gap-20">
            <li className="nav__link">
              <Link href="/">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-20 w-20 lg:h-24 lg:w-24 opacity-100 filter brightness-200" 
                />
              </Link>
            </li>
            {leftLinks.map((link, index) => (
              <li key={index} className={`nav__link ${activeLink === link.route ? "active" : ""}`}>
                <button onClick={() => handleClick(link)}>
                  <i
                    className={`bx ${link.icon} text-${link.color} text-[2.2rem] lg:text-[2.5rem] opacity-100 hover:opacity-50 ${
                      activeLink === link.route ? link.color : ""
                    }`}
                  ></i>
                </button>
              </li>
            ))}
          </div>

          {/* Right side links */}
          <div className="flex items-center gap-6 lg:gap-8">
            {rightLinks.map((link, index) => (
              <li key={index + leftLinks.length} className={`nav__link ${activeLink === link.route ? "active" : ""}`}>
                <button onClick={() => handleClick(link)}>
                  <i
                    className={`bx ${link.icon} text-${link.color} text-[2.2rem] lg:text-[2.5rem] opacity-100 hover:opacity-50 ${
                      activeLink === link.route ? link.color : ""
                    }`}
                  ></i>
                </button>
              </li>
            ))}
          </div>
        </ul>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 opacity-100 filter brightness-200" 
            />
          </Link>

          {/* Hamburger Menu Button */}
          <button 
            onClick={toggleMenu}
            className="text-[#6366F1] text-[2rem] hover:opacity-50 transition-opacity"
          >
            <i className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black rounded-md shadow-lg border-t border-gray-800 z-40">
            <div className="py-4 px-4">
              {/* Left Links */}
              <div className="space-y-4 mb-6">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Navigation</h3>
                {leftLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleClick(link)}
                    className={`w-full flex items-center space-x-3 py-2 px-3 rounded-md transition-all hover:bg-gray-900 ${
                      activeLink === link.route ? 'bg-gray-800' : ''
                    }`}
                  >
                    <i className={`bx ${link.icon} text-[#6366F1] text-[1.5rem]`}></i>
                    <span className="text-white font-medium">{link.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Links */}
              <div className="space-y-4 border-t border-gray-800 pt-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Account</h3>
                {rightLinks.map((link, index) => (
                  <button
                    key={index + leftLinks.length}
                    onClick={() => handleClick(link)}
                    className={`w-full flex items-center space-x-3 py-2 px-3 rounded-md transition-all hover:bg-gray-900 ${
                      activeLink === link.route ? 'bg-gray-800' : ''
                    }`}
                  >
                    <i className={`bx ${link.icon} text-[#6366F1] text-[1.5rem]`}></i>
                    <span className="text-white font-medium">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;