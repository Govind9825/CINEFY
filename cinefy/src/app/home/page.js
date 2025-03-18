"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import { redirect, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Footer from "../components/footer";
import "./home.css";

export default function Home() {
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);
  const sliderRef = useRef(null);
  const sliderListRef = useRef(null);
  const thumbnailRef = useRef(null);
  const [sliderData, setVideos] = useState([]);
  const [play, setplay] = useState(null);
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
          `http://localhost:3000/api/login?email=${session.user.email}`,
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
        const res = await fetch("http://localhost:3000/api/video");
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
    let thumbnailItems = thumbnailRef.current.querySelectorAll(".item");

    if (direction === "next") {
      sliderListRef.current.appendChild(sliderItems[0]);
      thumbnailRef.current.appendChild(thumbnailItems[0]);
      sliderRef.current.classList.add("next");
    } else {
      sliderListRef.current.prepend(sliderItems[sliderItems.length - 1]);
      thumbnailRef.current.prepend(thumbnailItems[thumbnailItems.length - 1]);
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

  useEffect(() => {
    if (session) {
      const nextBtn = nextBtnRef.current;
      const prevBtn = prevBtnRef.current;

      if (nextBtn && prevBtn) {
        nextBtn.onclick = function () {
          moveSlider("next");
        };

        prevBtn.onclick = function () {
          moveSlider("prev");
        };
      } else {
        console.error("Next or Prev button not found in the DOM.");
      }

      let thumbnailItems = thumbnailRef.current?.querySelectorAll(".item");
      if (thumbnailItems && thumbnailItems.length > 0) {
        thumbnailRef.current.appendChild(thumbnailItems[0]);
      }
    }
  }, [session]);

  const playVideo = (item) => {
    console.log("Item received in playVideo:", item);
    setplay(item);
    sessionStorage.setItem("selectedContent", JSON.stringify(item));
    router.push("/watch");
  };

  const toggleLike = async (id) => {
    if (!user) return;

    const isLiked = user.fav.some((fav) => fav.Content_id === id);
    console.log(isLiked);
    console.log(id);
    console.log(user.email);

    try {
      const response = await fetch(`http://localhost:3000/api/favourite`, {
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
        <div className="h-auto overflow-auto scrollbar-width:none w-[100vw]">
          <Navbar />

          <div className="slider" ref={sliderRef}>
            <div className="list" ref={sliderListRef}>
              {sliderData.map((item) => (
                <div className="item" key={item._id}>
                  <div
                    style={{
                      width: "1600px",
                      height: "800px",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="content">
                    <span className="button">
                      <button onClick={() => playVideo(item)}>Play</button>
                      <button>Stream</button>
                    </span>
                    <div
                      onClick={() => toggleLike(item._id)}
                      className="cursor-pointer"
                    >
                      {user?.fav.some((fav) => fav.Content_id === item._id)
                        ? "❤️ Liked"
                        : "🤍 Like"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="thumbnail" ref={thumbnailRef}>
              {sliderData.map((item) => (
                <div className="item" key={item._id}>
                  <Image
                    src={item.thumbnail}
                    alt={`Thumbnail ${item._id}`}
                    width={100}
                    height={60}
                  />
                </div>
              ))}
            </div>

            <div className="nextPrevArrows">
              <button className="prev" ref={prevBtnRef}>
                {"<"}
              </button>
              <button className="next" ref={nextBtnRef}>
                {">"}
              </button>
            </div>
          </div>

          <Footer />
        </div>
      ) : (
        <h2 className="text-white text-center mt-10">Please log in</h2>
      )}
    </>
  );
}