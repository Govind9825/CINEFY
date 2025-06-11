"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import { redirect, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Footer from "../components/footer";
import "./home.css";
import Call from "../components/Call";

export default function Home() {
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);
  const sliderRef = useRef(null);
  const sliderListRef = useRef(null);
  const [sliderData, setVideos] = useState([]);
  const [play, setplay] = useState(null);
  const [stream, setStream] = useState(null);
  const [user, setUser] = useState();

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          `/api/login?email=${session.user.email}`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          throw new Error("Something went wrong");
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user details:", error.message);
      }
    };

    if (session) fetchUserDetails();
  }, [session?.user?.email, session]);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/video");
        const data = await res.json();

        if (data.success) {
          if (user?.premium) {
            setVideos(data.videos);
          } else {
            setVideos(data.videos.filter((e) => e.premium === false));
          }
        } else {
          console.error("Error fetching videos:", data.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    if (user !== undefined) {
      fetchVideos();
    }
  }, [user]);

  const moveSlider = (direction) => {
    let sliderItems = sliderListRef.current.querySelectorAll(".item");

    if (direction === "next") {
      sliderListRef.current.appendChild(sliderItems[0]);
      sliderRef.current.classList.add("next");
    } else {
      sliderListRef.current.prepend(sliderItems[sliderItems.length - 1]);
      sliderRef.current.classList.add("prev");
    }

    sliderRef.current.addEventListener(
      "animationend",
      function () {
        if (direction === "next") {
          sliderRef.current.classList.remove("next");
        } else {
          sliderRef.current.classList.remove("prev");
        }
      },
      { once: true }
    );
  };

  const playVideo = (item) => {
    setplay(item);
    sessionStorage.setItem("selectedContent", JSON.stringify(item));
    router.push("/watch");
  };

  const streamVideo = (item) => {
    setStream(item);
    sessionStorage.setItem("selectedContent", JSON.stringify(item));
    router.push("/stream");
  };

  const toggleLike = async (id) => {
    if (!user) return;

    const isLiked = user.fav.some((fav) => fav.Content_id === id);

    try {
      const response = await fetch(`/api/favourite`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorites");
      }

      const updatedUser = await response.json();
      setUser(updatedUser.user);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <>
      {session ? (
        <div className="min-h-screen bg-black text-gray-100">
          <Navbar />

          <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            {/* Featured Content Slider - Hidden on small screens */}
            <div className="relative mb-6 sm:mb-8 hidden md:block">
              <div
                className="slider rounded-xl overflow-hidden shadow-2xl"
                ref={sliderRef}
              >
                <div className="list" ref={sliderListRef}>
                  {sliderData.map((item) => (
                    <div className="item relative group" key={item._id}>
                      {/* Responsive image height */}
                      <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] relative">
                        <Image
                          src={item.thumbnail}
                          alt={item.name}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90" />
                      </div>

                      {/* Content container */}
                      <div className="absolute bottom-0 left-0 w-full">
                        <div className="p-4 sm:p-6 md:p-8">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-white">
                            {item.name}
                          </h3>
                          <p className="text-gray-300 mb-4 sm:mb-6 line-clamp-2 text-sm sm:text-base">
                            {item.description}
                          </p>
                        </div>

                        {/* Action buttons - centered */}
                        <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => playVideo(item)}
                              className="relative p-3 sm:p-4 bg-black border-2 border-white text-white font-medium rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
                            >
                              <span className="relative z-10 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 sm:w-6 sm:h-6"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </span>
                              <span className="absolute inset-0 bg-white/10 transform origin-center scale-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:scale-100 rounded-full"></span>
                            </button>

                            <button
                              onClick={() => streamVideo(item)}
                              className="relative p-3 sm:p-4 bg-black border-2 border-blue-400 text-blue-400 font-medium rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20"
                            >
                              <span className="relative z-10 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 sm:w-6 sm:h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </span>
                              <span className="absolute inset-0 bg-blue-400/10 transform origin-center scale-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:scale-100 rounded-full"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation buttons - responsive positioning */}
                <div className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 z-20">
                  <button
                    className="bg-black bg-opacity-60 hover:bg-opacity-90 p-2 sm:p-3 rounded-full border border-gray-600 transition-all duration-300"
                    onClick={() => moveSlider("prev")}
                  >
                    <svg
                      className="h-4 w-4 sm:h-6 sm:w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                </div>

                <div className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 z-20">
                  <button
                    className="bg-black bg-opacity-60 hover:bg-opacity-90 p-2 sm:p-3 rounded-full border border-gray-600 transition-all duration-300"
                    onClick={() => moveSlider("next")}
                  >
                    <svg
                      className="h-4 w-4 sm:h-6 sm:w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Categories - Responsive Grid */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white px-2 sm:px-0">
                {/* Show "All Videos" on small screens, "Recommended For You" on larger screens */}
                <span className="md:hidden">All Videos</span>
                <span className="hidden md:inline">Recommended For You</span>
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {/* Show more videos on small screens since there's no slider */}
                {sliderData.slice(0, 12).map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group border border-gray-800 hover:border-blue-500"
                  >
                    <div className="relative h-32 sm:h-40 md:h-48">
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                      <button
                        onClick={() => toggleLike(item._id)}
                        className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10 p-1 sm:p-2 bg-gray-900 bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all text-xs sm:text-base"
                      >
                        {user?.fav.some(
                          (fav) => fav.Content_id === item._id
                        ) ? (
                          <span className="text-red-500">❤️</span>
                        ) : (
                          <span>🤍</span>
                        )}
                      </button>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 text-white line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => playVideo(item)}
                          className="relative p-2 sm:p-2.5 bg-black border border-white text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-white/20 group"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </span>
                          <span className="absolute inset-0 bg-white/10 transform origin-center scale-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-100 rounded-full"></span>
                        </button>
                        <button
                          onClick={() => streamVideo(item)}
                          className="relative p-2 sm:p-2.5 bg-black border border-blue-400 text-blue-400 rounded-full overflow-hidden transition-all duration-300 hover:shadow-blue-400/20 group"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                          <span className="absolute inset-0 bg-blue-400/10 transform origin-center scale-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-100 rounded-full"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      ) : (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <h2 className="text-white text-xl sm:text-2xl text-center">Please log in to continue</h2>
        </div>
      )}
    </>
  );
}