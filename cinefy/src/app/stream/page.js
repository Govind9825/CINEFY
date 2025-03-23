"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Expand,
  Bookmark,
  ChevronDown,
  Info,
  Clock,
  List,
} from "lucide-react";
import SendBirdCall from "sendbird-calls";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
} from "react-icons/fa";

import { signOut, useSession } from "next-auth/react";

import { socket } from "@/app/socket";

const Stream = () => {
  // Video Player State
  const [videoData, setVideoData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [bookmarkedEpisodes, setBookmarkedEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false); // Track seeking state
  const videoRef = useRef(null);

  // Call State
  const [user, setUser] = useState();
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState("");
  const [room, setRoom] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  useEffect(() => {
    const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
    if (APP_ID) {
      SendBirdCall.init(APP_ID);
    } else {
      console.error("SendBird APP_ID is missing");
    }
  }, []);

  // Fetch User Details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          `http://localhost:3000/api/login?email=${session.user.email}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
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

  // Call Functionality
  const authenticate = async (userId) => {
    if (!userId) {
      console.error("UserId is required for authentication");
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        SendBirdCall.authenticate({ userId }, (res, error) => {
          if (error) reject(error);
          else resolve(res);
          setUserId(user.name);
        });
      });
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  // Authenticate when user data is set
  useEffect(() => {
    if (user?.name) {
      authenticate(user.name);
    }
  }, [user?.name]);

  // Fetch Video Data
  useEffect(() => {
    const fetchVideoData = async () => {
      const storedData = sessionStorage.getItem("selectedContent");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setVideoData(parsedData);
        setSeasons(parsedData.seasons || []);
        socket.emit("VideoData : ", videoData);
        createRoom();
      } else {
        console.log("No video data found in sessionStorage");
      }
    };
    fetchVideoData();
  }, []);

  useEffect(() => {
    if (videoData) {
      socket.emit("videoData", videoData);
      console.log("Sent videoData to server:", videoData);
    }
  }, [videoData]);

  useEffect(() => {
    function onConnect() {
      console.log("Connected through socket");
      socket.emit("videoData from client");
    }

    function onDisconnect() {
      console.log("Disconnected from server");
    }

    function onServerMessage(data) {
      console.log("videoData from server:", data);
      setMessage(data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("server-message", onServerMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("server-message", onServerMessage);
    };
  }, []);

  const initiateSendbirdCalls = async () => {
    try {
      setLoading(true);
      if (!user?.name) {
        console.error("User not available for authentication");
        setLoading(false);
        return;
      }

      await authenticate(user.name);
      await SendBirdCall.connectWebSocket();
      setAuthenticated(true);
    } catch (error) {
      console.error("Error initializing SendBird calls:", error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      const createdRoom = await SendBirdCall.createRoom({
        roomType: "small_room_for_video",
      });
      setRoom(createdRoom);

      // Create a socket room and emit videoData
      socket.emit("createRoom", { roomId: createdRoom.roomId, videoData });

      await createdRoom.enter({
        audioEnabled: false,
        videoEnabled: false,
        localMediaView: document.getElementById("local_video_element_id"),
      });

      // Handle existing participants
      createdRoom.participants.forEach((participant) => {
        if (participant.user.userId == userId) {
          addRemoteVideo(participant);
        }
      });

      // Handle new participants
      createdRoom.on("remoteParticipantEntered", (participant) => {
        addRemoteVideo(participant);
      });

      // Handle participants leaving
      createdRoom.on("remoteParticipantExited", (participant) => {
        removeRemoteVideo(participant);
      });

      // Handle local participant exiting
      createdRoom.on("localParticipantExited", () => {
        setRoom(null); // Reset room state
      });
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const existingRoom = await SendBirdCall.fetchRoomById(roomId);
      await existingRoom.enter({
        audioEnabled: false,
        videoEnabled: false,
        localMediaView: document.getElementById("local_video_element_id"),
      });
      setRoom(existingRoom);

      // Join the socket room and request videoData
      socket.emit("joinRoom", { roomId });

      // Handle existing participants
      existingRoom.participants.forEach((participant) => {
        if (participant.userId !== userId) {
          addRemoteVideo(participant);
        }
      });

      // Handle new participants
      existingRoom.on("remoteParticipantEntered", (participant) => {
        addRemoteVideo(participant);
      });

      existingRoom.on("remoteParticipantExited", (participant) => {
        removeRemoteVideo(participant);
      });

      existingRoom.on("localParticipantExited", () => {
        setRoom(null); // Reset room state
      });
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  useEffect(() => {
    socket.on("requestVideoData", (callback) => {
      callback(videoData);
    });

    return () => {
      socket.off("requestVideoData");
    };
  }, [videoData]);

  useEffect(() => {
    socket.on("videoData", (data) => {
      setVideoData(data);
      setSeasons(data.seasons || []);
    });

    return () => {
      socket.off("videoData");
    };
  }, []);

  const removeRemoteVideo = (participant) => {
    const containerId = `remote_video_${participant.participantId}`;
    const videoContainer = document.getElementById(containerId);
    if (videoContainer) {
      videoContainer.remove();
    }
  };

  const addRemoteVideo = (participant) => {
    const videoContainer = document.createElement("div");
    videoContainer.className =
      "relative w-full h-[150px] rounded-md overflow-hidden mb-2";

    const videoElement = document.createElement("video");
    videoContainer.id = `remote_video_${participant.participantId}`;
    videoElement.autoplay = true;
    videoElement.className = "w-full h-full object-cover rounded-md";

    const userNameLabel = document.createElement("div");
    userNameLabel.className =
      "absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded";
    if (participant.user.userId === userId)
      userNameLabel.innerText =
        participant.user.userId + " (You)" || "Unknown User";
    else userNameLabel.innerText = participant.user.userId || "Unknown User";

    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(userNameLabel);
    document
      .getElementById("remote_video_container")
      .appendChild(videoContainer);

    participant.setMediaView(videoElement);
  };

  const toggleVideo = () => {
    try {
      if (room && room.localParticipant) {
        if (isVideoOn) {
          room.localParticipant.stopVideo();
        } else {
          room.localParticipant.startVideo();
        }
        setIsVideoOn(!isVideoOn);
      }
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleAudio = () => {
    try {
      if (isAudioOn) {
        room.localParticipant.muteMicrophone();
      } else {
        room.localParticipant.unmuteMicrophone();
      }
      setIsAudioOn(!isAudioOn);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const leaveRoom = async () => {
    if (room) {
      await room.exit();
      setRoom(null);
      // Clear remote video container
      const remoteVideoContainer = document.getElementById(
        "remote_video_container"
      );
      if (remoteVideoContainer) {
        remoteVideoContainer.innerHTML = "";
      }
    }
  };

  useEffect(() => {
    if (userId) initiateSendbirdCalls();
  }, [userId]);

  const selectedSeasonData = seasons.find(
    (season) => season.seasonNumber === selectedSeason
  );
  const selectedEpisodeData = selectedSeasonData?.episodes[selectedEpisode - 1];

  // Socket event listeners for synchronized controls
  useEffect(() => {
    // Play event
    socket.on("play", () => {
      if (videoRef.current) {
        videoRef.current.play(); // Play the video
        setIsPlaying(true); // Update state
      }
    });

    // Pause event
    socket.on("pause", () => {
      if (videoRef.current) {
        videoRef.current.pause(); // Pause the video
        setIsPlaying(false); // Update state
      }
    });

    // Seek event
    socket.on("seek", ({ currentTime }) => {
      if (typeof currentTime !== "number" || isNaN(currentTime) || !isFinite(currentTime)) {
        console.error("Invalid currentTime received from server:", currentTime);
        return;
      }

      if (videoRef.current && !isSeeking) {
        videoRef.current.currentTime = currentTime; // Set the video's currentTime
        setCurrentTime(currentTime); // Update state
      }
    });

    // Change episode event
    socket.on("changeEpisode", ({ season, episode }) => {
      setSelectedSeason(season); // Update season state
      setSelectedEpisode(episode); // Update episode state
    });

    // Cleanup
    return () => {
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("changeEpisode");
    };
  }, [isSeeking]); // Add isSeeking as a dependency

  const handlePlayPause = () => {
    if (!room?.roomId) {
      console.error("Room ID is missing");
      return;
    }

    if (isPlaying) {
      // Emit pause event with currentTime
      socket.emit("pause", {
        roomId: room.roomId,
        currentTime: videoRef.current?.currentTime || 0,
      });
    } else {
      // Emit play event with currentTime
      socket.emit("play", {
        roomId: room.roomId,
        currentTime: videoRef.current?.currentTime || 0,
      });
    }

    // Toggle local play/pause state
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    if (!room?.roomId) {
      console.error("Room ID is missing");
      return;
    }

    // Validate time
    if (typeof time !== "number" || isNaN(time) || !isFinite(time)) {
      console.error("Invalid currentTime:", time);
      return;
    }

    // Emit seek event with the new time
    socket.emit("seek", {
      roomId: room.roomId,
      currentTime: time,
    });

    // Update local currentTime state
    setCurrentTime(time);
  };

  const handleEpisodeChange = (episode, season = selectedSeason) => {
    if (!room?.roomId) {
      console.error("Room ID is missing");
      return;
    }

    // Emit the episode change event to the server
    socket.emit("changeEpisode", {
      roomId: room.roomId, // Include roomId
      season, // Include season
      episode, // Include episode
    });

    // Update local state
    setSelectedSeason(season);
    setSelectedEpisode(episode);
  };

  const handleSeasonChange = (season) => {
    socket.emit("changeSeason", season);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Main Flex Container */}
      <div className="flex h-screen">
        {/* Left Side (75% width) - Video Player and Controls */}
        <div className="w-3/4 p-6 overflow-y-auto">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[400px] lg:h-[500px] bg-black rounded-xl shadow-2xl border-2 border-cyan-500 overflow-hidden relative"
          >
            {selectedEpisodeData?.link ? (
              <video
                ref={videoRef}
                className="w-full h-full"
                src={selectedEpisodeData?.link || ""}
                controls
                onPlay={() => {
                  setIsPlaying(true);
                  handlePlayPause();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  handlePlayPause();
                }}
                onSeeking={() => setIsSeeking(true)} // User starts seeking
                onSeeked={() => {
                  setIsSeeking(false); // User stops seeking
                  handleSeek(videoRef.current?.currentTime || 0); // Call handleSeek
                }}
                onTimeUpdate={(e) => {
                  if (!isSeeking) {
                    setCurrentTime(e.target.currentTime); // Only update state if not seeking
                  }
                }}
              ></video>
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
            className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
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
            className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? "Pause" : "Play"}
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
                  onClick={() =>
                    handleEpisodeChange(Math.max(selectedEpisode - 1, 1))
                  }
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                >
                  <SkipBack size={16} /> Prev
                </button>
                <button
                  onClick={() =>
                    handleEpisodeChange(
                      Math.min(
                        selectedEpisode + 1,
                        selectedSeasonData?.episodes.length || 1
                      )
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
                  {bookmarkedEpisodes.includes(selectedEpisode)
                    ? "Remove Bookmark"
                    : "Bookmark"}
                </button>
                <button className="flex items-center gap-2 text-sm hover:text-cyan-400 transition">
                  <Expand size={16} /> Expand
                </button>
              </div>
            </div>
          </motion.div>

          {/* Season & Episode List */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700"
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
                          handleSeasonChange(season.seasonNumber);
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
                  onClick={() => handleEpisodeChange(i + 1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`w-full flex justify-between items-center p-3 rounded-lg ${
                    selectedEpisode === i + 1
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 transition"
                  }`}
                >
                  <span>
                    {i + 1}. {episode.name}
                  </span>
                  <div className="flex gap-2">
                    {bookmarkedEpisodes.includes(i + 1) && (
                      <Bookmark size={16} />
                    )}
                    {selectedEpisode === i + 1 && (
                      <Play className="text-white" size={16} />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side (25% width) - Call Feature */}
        <div className="m-[1.5%] rounded-lg w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 p-6 border-l border-gray-700 overflow-y-auto">
          {userId ? (
            <div className="flex flex-col space-y-4">
              <h1 className="font-bold text-lg">Authenticated as {userId}</h1>

              {authenticated && !room && (
                <div className="flex flex-col space-y-2">
                  {videoData ? (
                    <button
                      onClick={createRoom}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaVideo className="mr-2" /> Create Room
                    </button>
                  ) : (
                    <button
                      onClick={() => joinRoom(prompt("Enter Room ID"))}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaVideo className="mr-2" /> Join Room
                    </button>
                  )}
                </div>
              )}

              {room && (
                <div className="flex flex-col space-y-3">
                  <h2 className="text-sm">In Room: {room.roomId}</h2>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={toggleVideo}
                      className={`${
                        isVideoOn ? "bg-blue-500" : "bg-gray-500"
                      } text-white font-bold py-2 px-4 rounded flex items-center justify-center`}
                    >
                      {isVideoOn ? (
                        <FaVideo className="mr-2" />
                      ) : (
                        <FaVideoSlash className="mr-2" />
                      )}
                      {isVideoOn ? "Turn Off Video" : "Turn On Video"}
                    </button>
                    <button
                      onClick={toggleAudio}
                      className={`${
                        isAudioOn ? "bg-blue-500" : "bg-gray-500"
                      } text-white font-bold py-2 px-4 rounded flex items-center justify-center`}
                    >
                      {isAudioOn ? (
                        <FaMicrophone className="mr-2" />
                      ) : (
                        <FaMicrophoneSlash className="mr-2" />
                      )}
                      {isAudioOn ? "Mute" : "Unmute"}
                    </button>
                    <button
                      onClick={leaveRoom}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaPhoneSlash className="mr-2" /> Leave Room
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <div
                  id="remote_video_container"
                  className="flex flex-col space-y-2"
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">loading</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stream;