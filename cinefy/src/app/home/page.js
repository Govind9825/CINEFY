"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Navbar from '../components/navbar';  // Import Navbar
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Footer from '../components/footer';  // Import Footer
import "./home.css"; // Ensure this CSS is properly linked

// Slider data (can be fetched from an API or defined here)
const sliderData = [
  {
    id: 1,
    image: "/home/04.jpg",
    alt: "Stranger Things",
    title: "STRANGER THINGS",
    type: "FLOWER",
    description: "Lorem ipsum dolor sit amet consectetur.",
    buttonText: "▶ PLAY",
  },
  {
    id: 2,
    image: "/home/06.jpg",
    alt: "Magic Slider",
    title: "MAGIC SLIDER",
    type: "NATURE",
    description: "Lorem ipsum dolor sit amet consectetur.",
    buttonText: "SEE MORE",
  },
  {
    id: 3,
    image: "/home/01.jpg",
    alt: "Magic Slider Plant",
    title: "MAGIC SLIDER",
    type: "PLANT",
    description: "Lorem ipsum dolor sit amet consectetur.",
    buttonText: "SEE MORE",
  },
  {
    id: 4,
    image: "/home/05.jpg",
    alt: "Magic Slider Nature",
    title: "MAGIC SLIDER",
    type: "NATURE",
    description: "Lorem ipsum dolor sit amet consectetur.",
    buttonText: "SEE MORE",
  },
];

export default function Home() {
  // Create references for next, prev buttons, slider, and thumbnails
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);
  const sliderRef = useRef(null);
  const sliderListRef = useRef(null);
  const thumbnailRef = useRef(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  // Function to handle slider movement
  const moveSlider = (direction) => {
    let sliderItems = sliderListRef.current.querySelectorAll('.item');
    let thumbnailItems = thumbnailRef.current.querySelectorAll('.item');

    if (direction === 'next') {
      sliderListRef.current.appendChild(sliderItems[0]);
      thumbnailRef.current.appendChild(thumbnailItems[0]);
      sliderRef.current.classList.add('next');
    } else {
      sliderListRef.current.prepend(sliderItems[sliderItems.length - 1]);
      thumbnailRef.current.prepend(thumbnailItems[thumbnailItems.length - 1]);
      sliderRef.current.classList.add('prev');
    }

    sliderRef.current.addEventListener(
      'animationend',
      function () {
        if (direction === 'next') {
          sliderRef.current.classList.remove('next');
        } else {
          sliderRef.current.classList.remove('prev');
        }
      },
      { once: true }
    );
  };

  // UseEffect to set up event listeners when the component mounts
  useEffect(() => {
    if (session) {
      const nextBtn = nextBtnRef.current;
      const prevBtn = prevBtnRef.current;

      if (nextBtn && prevBtn) {
        nextBtn.onclick = function () {
          moveSlider('next');
        };

        prevBtn.onclick = function () {
          moveSlider('prev');
        };
      } else {
        console.error("Next or Prev button not found in the DOM.");
      }

      // Initial setup for thumbnail append
      let thumbnailItems = thumbnailRef.current?.querySelectorAll('.item');
      if (thumbnailItems && thumbnailItems.length > 0) {
        thumbnailRef.current.appendChild(thumbnailItems[0]);
      }
    }
  }, [session]);

  return (
    <>
      {session ? (
        <div className="h-auto">
          <Navbar />

          <div className="slider" ref={sliderRef}>
            <div className="list" ref={sliderListRef}>
              {sliderData.map((item) => (
                <div className="item" key={item.id}>
                  <Image src={item.image} alt={item.alt} width={800} height={400} />
                  <div className="content">
                    <div className="title">{item.title}</div>
                    <div className="type">{item.type}</div>
                    <div className="description">{item.description}</div>
                    <div className="button">
                      <button>{item.buttonText}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="thumbnail" ref={thumbnailRef}>
              {sliderData.map((item) => (
                <div className="item" key={item.id}>
                  <Image src={item.image} alt={`Thumbnail ${item.id}`} width={100} height={60} />
                </div>
              ))}
            </div>

            <div className="nextPrevArrows">
              <button className="prev" ref={prevBtnRef}>{"<"}</button>
              <button className="next" ref={nextBtnRef}>{">"}</button>
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