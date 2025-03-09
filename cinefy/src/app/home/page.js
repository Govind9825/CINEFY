"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Image from "next/image";
import "./home.css"; // Ensure this CSS is properly linked

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Create references for next, prev buttons, slider, and thumbnails
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);
  const sliderRef = useRef(null);
  const sliderListRef = useRef(null);
  const thumbnailRef = useRef(null);

  // Function to handle slider movement
  const moveSlider = (direction) => {
    const sliderItems = sliderListRef.current.querySelectorAll('.item');
    const thumbnailItems = thumbnailRef.current.querySelectorAll('.item');

    if (direction === 'next') {
      // Move the first item to the end of the list
      sliderListRef.current.appendChild(sliderItems[0]);
      thumbnailRef.current.appendChild(thumbnailItems[0]);
      sliderRef.current.classList.add('next');
    } else {
      // Move the last item to the beginning of the list
      sliderListRef.current.prepend(sliderItems[sliderItems.length - 1]);
      thumbnailRef.current.prepend(thumbnailItems[thumbnailItems.length - 1]);
      sliderRef.current.classList.add('prev');
    }

    // Remove the animation class after the animation ends
    sliderRef.current.addEventListener(
      'animationend',
      () => {
        sliderRef.current.classList.remove('next', 'prev');
      },
      { once: true }
    );
  };

  // UseEffect to set up event listeners when the component mounts
  useEffect(() => {
    const nextBtn = nextBtnRef.current;
    const prevBtn = prevBtnRef.current;

    if (nextBtn && prevBtn) {
      nextBtn.onclick = () => moveSlider('next');
      prevBtn.onclick = () => moveSlider('prev');
    }

    // Initial setup for thumbnail append
    const thumbnailItems = thumbnailRef.current?.querySelectorAll('.item');
    if (thumbnailItems && thumbnailItems.length > 0) {
      thumbnailRef.current.appendChild(thumbnailItems[0]);
    }
  }, []);

  return (
    <div className="bg-black h-screen w-full">
      <Navbar />
      
      {/* {session ? (
        <div className="text-white text-center mt-10">
          <div className="slider" ref={sliderRef}>
            <div className="list" ref={sliderListRef}>
              <div className="item">
                <Image src="/home/04.jpg" alt="Stranger Things" width={800} height={400} />
                <div className="content">
                  <div className="title">STRANGER THINGS</div>
                  <div className="type">FLOWER</div>
                  <div className="description">Lorem ipsum dolor sit amet consectetur.</div>
                  <div className="button">
                    <button>▶ PLAY</button>
                  </div>
                </div>
              </div>

              <div className="item">
                <Image src="/home/06.jpg" alt="Magic Slider" width={800} height={400} />
                <div className="content">
                  <div className="title">MAGIC SLIDER</div>
                  <div className="type">NATURE</div>
                  <div className="description">Lorem ipsum dolor sit amet consectetur.</div>
                  <div className="button">
                    <button>SEE MORE</button>
                  </div>
                </div>
              </div>

              <div className="item">
                <Image src="/home/01.jpg" alt="Magic Slider Plant" width={800} height={400} />
                <div className="content">
                  <div className="title">MAGIC SLIDER</div>
                  <div className="type">PLANT</div>
                  <div className="description">Lorem ipsum dolor sit amet consectetur.</div>
                  <div className="button">
                    <button>SEE MORE</button>
                  </div>
                </div>
              </div>

              <div className="item">
                <Image src="/home/05.jpg" alt="Magic Slider Nature" width={800} height={400} />
                <div className="content">
                  <div className="title">MAGIC SLIDER</div>
                  <div className="type">NATURE</div>
                  <div className="description">Lorem ipsum dolor sit amet consectetur.</div>
                  <div className="button">
                    <button>SEE MORE</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="thumbnail" ref={thumbnailRef}>
              <div className="item">
                <Image src="/home/04.jpg" alt="Thumbnail 1" width={100} height={60} />
              </div>
              <div className="item">
                <Image src="/home/06.jpg" alt="Thumbnail 2" width={100} height={60} />
              </div>
              <div className="item">
                <Image src="/home/01.jpg" alt="Thumbnail 3" width={100} height={60} />
              </div>
              <div className="item">
                <Image src="/home/05.jpg" alt="Thumbnail 4" width={100} height={60} />
              </div>
            </div>

            <div className="nextPrevArrows">
              <button className="prev" ref={prevBtnRef}>{"<"}</button>
              <button className="next" ref={nextBtnRef}>{">"}</button>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="text-white text-center mt-10">Please log in</h2>
      )} */}

      <Footer />
    </div>
  );
};

export default Home;