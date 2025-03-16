"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, SkipForward, SkipBack, Expand, Bookmark, ChevronDown, Info, Clock, List
} from "lucide-react";
import Navbar from "../components/navbar";

export default function AnimeWatchPage() {
  const [videoData, setVideoData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [bookmarkedEpisodes, setBookmarkedEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  // console.log(sessionStorage.getItem("selectedVideo"));


  useEffect(() => {
    const fetchVideoData = async () => {
      const storedData = sessionStorage.getItem("selectedContent");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Fetched Video Data:", parsedData); // ✅ Debugging log
        setVideoData(parsedData);
        setSeasons(parsedData.seasons || []); 
      } else {
        console.log("No video data found in sessionStorage");
      }
    };
  
    fetchVideoData();
  }, []);

  const toggleBookmark = (episode) => {
    setBookmarkedEpisodes((prev) =>
      prev.includes(episode) ? prev.filter((ep) => ep !== episode) : [...prev, episode]
    );
  };

  const selectedSeasonData = seasons.find((season) => season.seasonNumber === selectedSeason);
  const selectedEpisodeData = selectedSeasonData?.episodes[selectedEpisode - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">

      <Navbar />

      {/* 🔹 MAIN CONTENT */}
      <div className="container mx-auto  flex flex-col lg:flex-row gap-6">

        {/* Season & Episode List */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
        >
          {/* Season Dropdown */}
          <div className="mb-6 relative">
            <button
              onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
              className="w-full flex justify-between items-center p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
            >
              <span className="flex items-center gap-2">
                <List size={18} />
                Season {selectedSeason}
              </span>
              <ChevronDown
                className={`transform transition-transform ${
                  isSeasonDropdownOpen ? "rotate-180" : ""
                }`}
                size={18}
              />
            </button>
            <AnimatePresence>
              {isSeasonDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
                >
                  {seasons.map((season) => (
                    <button
                      key={season.seasonNumber}
                      onClick={() => {
                        setSelectedSeason(season.seasonNumber);
                        setIsSeasonDropdownOpen(false);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-700 transition rounded-lg flex items-center gap-2"
                    >
                      <Play size={16} />
                      Season {season.seasonNumber}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Episode List */}
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} />
            Episodes
          </h3>
          <div className="space-y-2">
            {selectedSeasonData?.episodes.map((episode, i) => (
              <motion.button
                key={episode._id}
                onClick={() => setSelectedEpisode(i + 1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-full flex justify-between items-center p-3 rounded-lg ${
                  selectedEpisode === i + 1
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 transition"
                }`}
              >
                <span>{i + 1}. {episode.name}</span>
                <div className="flex gap-2">
                  {bookmarkedEpisodes.includes(i + 1) && <Bookmark size={16} />}
                  {selectedEpisode === i + 1 && <Play className="text-white" size={16} />}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Video Player & Controls */}
        <div className="w-full lg:w-3/4 space-y-6">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[400px] lg:h-[500px] bg-black rounded-xl shadow-2xl border-2 border-cyan-500 overflow-hidden relative"
          >
            {selectedEpisodeData?.link ? (
              <iframe
                className="w-full h-full"
                src={selectedEpisodeData.link}
                allowFullScreen
                allow="autoplay"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <p className="text-gray-400">No video URL provided.</p>
              </div>
            )}
          </motion.div>

          {/* Episode Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-cyan-400" />
              <h3 className="text-xl font-semibold">Episode Description</h3>
            </div>
            <p className="text-gray-300">
              {selectedEpisodeData?.desc || "No description available."}
            </p>
          </motion.div>

          {/* Player Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition">
                  <Play size={16} /> Auto Play: On
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition">
                  <SkipForward size={16} /> Auto Next: On
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition">
                  <Clock size={16} /> Auto Skip Intro: On
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedEpisode((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                >
                  <SkipBack size={16} /> Prev
                </button>
                <button
                  onClick={() =>
                    setSelectedEpisode((prev) =>
                      Math.min(prev + 1, selectedSeasonData?.episodes.length || 1)
                    )
                  }
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                >
                  Next <SkipForward size={16} />
                </button>
                <button
                  onClick={() => toggleBookmark(selectedEpisode)}
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                >
                  <Bookmark size={16} />{" "}
                  {bookmarkedEpisodes.includes(selectedEpisode) ? "Remove Bookmark" : "Bookmark"}
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition">
                  <Expand size={16} /> Expand
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}