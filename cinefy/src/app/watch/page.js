"use client";
import { useEffect, useState } from "react";

export default function WatchVideo() {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await fetch("http://localhost:3000/api/video");
                const data = await res.json();
                if (data.success) {
                    setVideos(data.videos);
                } else {
                    console.error("Error fetching videos:", data.message);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, []);

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Watch Videos</h1>

            {/* Video Player */}
            {selectedVideo ? (
                <div className="w-full max-w-3xl mb-6">
                    <iframe
                        src={selectedVideo} // Google Drive embed link
                        className="w-full h-64 md:h-96 rounded-lg shadow-lg"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <p className="text-gray-600 mb-4">Select a video to watch</p>
            )}

            {/* Video List */}
            <div className="w-full max-w-3xl bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-2">Available Videos</h2>

                {loading ? (
                    <p className="text-gray-500">Loading videos...</p>
                ) : videos.length > 0 ? (
                    <ul>
                        {videos.map((video) => (
                            <li
                                key={video._id}
                                className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2"
                                onClick={() => setSelectedVideo(video.link)}
                            >
                                ▶ {video.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No videos available.</p>
                )}
            </div>
        </div>
    );
}
