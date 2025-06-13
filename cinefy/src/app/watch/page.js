"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, SkipForward, SkipBack, ChevronDown, Info, Clock, List, Maximize, Menu, X
} from "lucide-react";
import Navbar from "../components/navbar";

export default function AnimeWatchPage() {
  const [videoData, setVideoData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [playerSettings, setPlayerSettings] = useState({
    autoPlay: false,
    autoNext: true
  });
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Detect if content is a movie (single season with single episode)
  const isMovie = seasons.length === 1 && seasons[0]?.episodes?.length === 1;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchVideoData = async () => {
      const storedData = sessionStorage.getItem("selectedContent");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setVideoData(parsedData);
        setSeasons(parsedData.seasons || []); 
      }
    };
  
    fetchVideoData();

  })

  const selectedSeasonData = seasons.find((season) => season.seasonNumber === selectedSeason);
  const selectedEpisodeData = selectedSeasonData?.episodes[selectedEpisode - 1];

  const toggleSetting = (setting) => {
    setPlayerSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePreviousEpisode = () => {
    if (isMovie) return;
    
    if (selectedEpisode > 1) {
      setSelectedEpisode(prev => prev - 1);
    } else if (selectedSeason > 1) {
      const prevSeason = seasons.find(s => s.seasonNumber === selectedSeason - 1);
      if (prevSeason) {
        setSelectedSeason(selectedSeason - 1);
        setSelectedEpisode(prevSeason.episodes.length);
      }
    }
    setIsMobileSidebarOpen(false);
  };

  const handleNextEpisode = () => {
    if (isMovie) return;

    if (selectedEpisode < selectedSeasonData?.episodes.length) {
      setSelectedEpisode(prev => prev + 1);
    } else if (selectedSeason < seasons.length) {
      setSelectedSeason(selectedSeason + 1);
      setSelectedEpisode(1);
    }
    setIsMobileSidebarOpen(false);
  };

  // const toggleFullscreen = () => {
  //   if (!videoContainerRef.current) return;
    
  //   if (!document.fullscreenElement) {
  //     videoContainerRef.current.requestFullscreen().catch(err => {
  //       console.error(`Error attempting to enable fullscreen: ${err.message}`);
  //     });
  //   } else {
  //     document.exitFullscreen();
  //   }
  // };

  // Auto-play next episode if enabled
  useEffect(() => {
  const video = videoRef.current;
  if (!video || !playerSettings.autoNext || isMovie) return;

  const handleEnded = () => {
    setTimeout(() => {
      if (selectedEpisode < selectedSeasonData?.episodes.length) {
        setSelectedEpisode(prev => prev + 1);
      } else if (selectedSeason < seasons.length) {
        setSelectedSeason(prev => prev + 1);
        setSelectedEpisode(1);
      }
    }, 300); // small delay to prevent rapid chained updates
  };

  video.addEventListener('ended', handleEnded);

  return () => {
    video.removeEventListener('ended', handleEnded);
  };
}, [playerSettings.autoNext, isMovie, selectedEpisode, selectedSeason, seasons.length, selectedSeasonData?.episodes.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Mobile Episode List Toggle Button */}
          {!isMovie && isMobile && (
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
              >
                {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                <span className="text-sm">Episodes</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>S{selectedSeason} E{selectedEpisode}</span>
              </div>
            </div>
          )}

          {/* Season & Episode List - Responsive sidebar */}
          {!isMovie && (
            <>
              {/* Desktop Sidebar */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
              >
                <SidebarContent 
                  seasons={seasons}
                  selectedSeason={selectedSeason}
                  selectedEpisode={selectedEpisode}
                  selectedSeasonData={selectedSeasonData}
                  isSeasonDropdownOpen={isSeasonDropdownOpen}
                  setIsSeasonDropdownOpen={setIsSeasonDropdownOpen}
                  setSelectedSeason={setSelectedSeason}
                  setSelectedEpisode={setSelectedEpisode}
                />
              </motion.div>

              {/* Mobile Sidebar Overlay */}
              <AnimatePresence>
                {isMobileSidebarOpen && isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <motion.div
                      initial={{ x: -300 }}
                      animate={{ x: 0 }}
                      exit={{ x: -300 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="w-80 h-full bg-gradient-to-b from-gray-800 to-gray-900 p-6 shadow-2xl border-r border-gray-700 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Episodes</h2>
                        <button
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className="p-2 rounded-lg hover:bg-gray-700 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <SidebarContent 
                        seasons={seasons}
                        selectedSeason={selectedSeason}
                        selectedEpisode={selectedEpisode}
                        selectedSeasonData={selectedSeasonData}
                        isSeasonDropdownOpen={isSeasonDropdownOpen}
                        setIsSeasonDropdownOpen={setIsSeasonDropdownOpen}
                        setSelectedSeason={setSelectedSeason}
                        setSelectedEpisode={setSelectedEpisode}
                        onEpisodeSelect={() => setIsMobileSidebarOpen(false)}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Video Player & Controls */}
          <div className={`w-full ${isMovie || isMobile ? 'lg:w-full' : 'lg:w-3/4'} space-y-4 lg:space-y-6`}>
            {/* Video Player */}
            <motion.div
              ref={videoContainerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-[250px] sm:h-[350px] lg:h-[500px] bg-black rounded-xl shadow-2xl border-2 border-cyan-500 overflow-hidden"
            >
              {selectedEpisodeData?.link ? (
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  src={`${selectedEpisodeData.link}`}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  autoPlay={playerSettings.autoPlay}
                  allowFullScreen
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <p className="text-gray-400">No video URL provided.</p>
                </div>
              )}
              

            </motion.div>

            {/* Episode/Movie Title - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 lg:p-6 rounded-xl shadow-2xl border border-gray-700"
            >
              <div className="flex items-start gap-3">
                <Info size={20} className="text-cyan-400 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 truncate">
                    {isMovie ? videoData?.title : `${videoData?.title} - S${selectedSeason}E${selectedEpisode}`}
                  </h3>
                  <h4 className="text-sm lg:text-base text-cyan-300 mb-3 truncate">
                    {selectedEpisodeData?.name || "Episode"}
                  </h4>
                  <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                    {selectedEpisodeData?.desc || "No description available."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Player Controls - Responsive */}
            {!isMovie && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 lg:p-6 rounded-xl shadow-2xl border border-gray-700"
              >
                {/* Mobile Controls - Stacked Layout */}
                <div className="lg:hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <button
                        onClick={handlePreviousEpisode}
                        disabled={selectedEpisode === 1 && selectedSeason === 1}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          selectedEpisode === 1 && selectedSeason === 1
                            ? "text-gray-500 bg-gray-800 cursor-not-allowed"
                            : "text-cyan-400 bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        <SkipBack size={16} /> Prev
                      </button>
                      <button
                        onClick={handleNextEpisode}
                        disabled={
                          selectedEpisode === selectedSeasonData?.episodes.length && 
                          selectedSeason === seasons.length
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          selectedEpisode === selectedSeasonData?.episodes.length && 
                          selectedSeason === seasons.length
                            ? "text-gray-500 bg-gray-800 cursor-not-allowed"
                            : "text-cyan-400 bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        Next <SkipForward size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => toggleSetting('autoPlay')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                        playerSettings.autoPlay 
                          ? "text-cyan-400 bg-gray-700" 
                          : "text-gray-400 bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <Play size={16} /> Auto Play: {playerSettings.autoPlay ? "On" : "Off"}
                    </button>
                    <button 
                      onClick={() => toggleSetting('autoNext')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                        playerSettings.autoNext 
                          ? "text-cyan-400 bg-gray-700" 
                          : "text-gray-400 bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <SkipForward size={16} /> Auto Next: {playerSettings.autoNext ? "On" : "Off"}
                    </button>
                  </div>
                </div>

                {/* Desktop Controls - Original Layout */}
                <div className="hidden lg:flex justify-between items-center flex-wrap gap-4">
                  <div className="flex gap-4 flex-wrap">
                    <button 
                      onClick={() => toggleSetting('autoPlay')}
                      className={`flex items-center gap-2 text-sm transition ${
                        playerSettings.autoPlay 
                          ? "text-cyan-400 hover:text-cyan-300" 
                          : "text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <Play size={16} /> Auto Play: {playerSettings.autoPlay ? "On" : "Off"}
                    </button>
                    <button 
                      onClick={() => toggleSetting('autoNext')}
                      className={`flex items-center gap-2 text-sm transition ${
                        playerSettings.autoNext 
                          ? "text-cyan-400 hover:text-cyan-300" 
                          : "text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <SkipForward size={16} /> Auto Next: {playerSettings.autoNext ? "On" : "Off"}
                    </button>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <button
                      onClick={handlePreviousEpisode}
                      disabled={selectedEpisode === 1 && selectedSeason === 1}
                      className={`flex items-center gap-2 text-sm transition ${
                        selectedEpisode === 1 && selectedSeason === 1
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-cyan-400 hover:text-cyan-300"
                      }`}
                    >
                      <SkipBack size={16} /> Prev
                    </button>
                    <button
                      onClick={handleNextEpisode}
                      disabled={
                        selectedEpisode === selectedSeasonData?.episodes.length && 
                        selectedSeason === seasons.length
                      }
                      className={`flex items-center gap-2 text-sm transition ${
                        selectedEpisode === selectedSeasonData?.episodes.length && 
                        selectedSeason === seasons.length
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-cyan-400 hover:text-cyan-300"
                      }`}
                    >
                      Next <SkipForward size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Extracted Sidebar Component for reusability
function SidebarContent({ 
  seasons, 
  selectedSeason, 
  selectedEpisode, 
  selectedSeasonData, 
  isSeasonDropdownOpen, 
  setIsSeasonDropdownOpen, 
  setSelectedSeason, 
  setSelectedEpisode,
  onEpisodeSelect 
}) {
  return (
    <>
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
                    setSelectedEpisode(1);
                    setIsSeasonDropdownOpen(false);
                    onEpisodeSelect?.();
                  }}
                  className={`w-full p-3 text-left hover:bg-gray-700 transition rounded-lg flex items-center gap-2 ${
                    selectedSeason === season.seasonNumber ? 'bg-gray-700' : ''
                  }`}
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
      <div className="space-y-2 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2">
        {selectedSeasonData?.episodes.map((episode, i) => (
          <motion.button
            key={episode._id}
            onClick={() => {
              setSelectedEpisode(i + 1);
              onEpisodeSelect?.();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`w-full flex justify-between items-start p-3 rounded-lg text-left ${
              selectedEpisode === i + 1
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 transition"
            }`}
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">{i + 1}. {episode.name}</span>
            </div>
            <div className="flex gap-2 ml-2">
              {selectedEpisode === i + 1 && <Play className="text-white flex-shrink-0" size={16} />}
            </div>
          </motion.button>
        ))}
      </div>
    </>
  );
}