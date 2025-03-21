
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaUpload,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Upload = () => {
  const [content, setContent] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [genre, setGenre] = useState("");
  const [premium, setpremium] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [current, setCurrent] = useState("main");
  const [expandedElement, setExpandedElement] = useState(null);
  const [addSeasons, setAddSeasons] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("");
  const [episodeName, setEpisodeName] = useState("");
  const [episodeDesc, setEpisodeDesc] = useState("");
  const [episodeVideo, setEpisodeVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchContent = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching content");
      }

      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const addContent = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error adding content");
      }

      const result = await response.json();
      toast.success("Content added successfully!");

      setName("");
      setDesc("");
      setGenre("");
      setThumbnail(null);
      setCurrent("main");
      fetchContent();
    } catch (error) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const addData = async (episode, expandedElement, seasonNumber) => {
    try {
      const formData = new FormData();
      formData.append("_id", expandedElement);
      formData.append("seasonNumber", seasonNumber);
      formData.append("episodes[0][name]", episode.name);
      formData.append("episodes[0][desc]", episode.desc);
      if (episode.video) {
        formData.append("episodes[0][file]", episode.video);
      }

      const response = await fetch("http://localhost:3000/api/upload", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Could not add the episode");
      }

      toast.success("Episode added successfully!");
      fetchContent();
    } catch (error) {
      toast.error(
        "❌ Error: " + (error.message || "An unknown error occurred")
      );
    }
  };

  const handleDelete = async (_id) => {
    if (!_id) {
      toast.warning("Must Have an Id to delete content");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id }),
      });

      if (!response.ok) {
        throw new Error("Error Deleting Content");
      } else {
        toast.success("Deleted Successfully!");
        fetchContent();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveEpisode = async () => {
    if (!episodeName || !episodeDesc || !episodeVideo) {
      toast.warning("Please fill out all fields for the episode.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("_id", expandedElement);
    formData.append("seasonNumber", seasonNumber);
    formData.append("episodeName", episodeName);
    formData.append("episodeDesc", episodeDesc);
    formData.append("episodeVideo", episodeVideo);

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add episode");
      }

      toast.success("Episode added successfully!");
      fetchContent(); // Refresh the content list
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
      setEpisodeName("");
      setEpisodeDesc("");
      setEpisodeVideo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !desc || !genre || !thumbnail) {
      toast.warning("Please fill out all fields and select a thumbnail.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("desc", desc);
    formData.append("genre", genre);
    formData.append("thumbnail", thumbnail);
    formData.append("premium" , premium)

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    });

    xhr.open("POST", "http://localhost:3000/api/upload", true);
    xhr.send(formData);

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        toast.success("Content added successfully!");

        setName("");
        setDesc("");
        setGenre("");
        setThumbnail(null);
        setCurrent("main");
        fetchContent();
      } else {
        toast.error("Upload failed");
      }
      setIsSubmitting(false);
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      toast.error("Upload failed");
      setIsSubmitting(false);
      setUploadProgress(0);
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <ToastContainer />
      {current === "main" ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <button
            onClick={() => setCurrent("add")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
          >
            <FaUpload />
            <span>Add Content</span>
          </button>
          <button
            onClick={() => setCurrent("edit")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
          >
            <FaEdit />
            <span>Edit Content</span>
          </button>
        </div>
      ) : current === "edit" ? (
        <div className="w-full max-w-4xl mx-auto mt-8">
          {content.map((element, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
            >
              <div className="flex items-center space-x-6">
                <Image
                  src={element.thumbnail}
                  alt={element.name}
                  height={150}
                  width={150}
                  className="rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{element.name}</h2>
                  {/* <p className="text-gray-400">{element.desc}</p> */}
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() =>
                      setExpandedElement(
                        expandedElement === element._id ? null : element._id
                      )
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
                  >
                    {expandedElement === element._id ? <FaTimes /> : <FaEdit />}
                    <span>
                      {expandedElement === element._id ? "Close" : "Edit"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(element._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {expandedElement === element._id && (
                <div className="mt-6 space-y-6">
                  {element.seasons && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Seasons:</h3>
                      {element.seasons.map((season, sIndex) => (
                        <div key={sIndex} className="ml-4 mt-2">
                          <h4 className="text-md font-medium">
                            Season {season.seasonNumber}
                          </h4>
                          <ul className="ml-6 list-disc">
                            {season.episodes.map((episode, eIndex) => (
                              <li key={eIndex} className="text-gray-300">
                                {episode.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                      onClick={() => setAddSeasons(!addSeasons)}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center space-x-2"
                    >
                      {addSeasons ? <FaTimes /> : <FaPlus />}
                      <span>
                        {addSeasons ? "Cancel Add Episode" : "Add Episode"}
                      </span>
                    </button>
                  </div>

                  {addSeasons && (
                    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                      <h2 className="text-lg font-bold mb-4">
                        Add New Episode
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Season Number
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setSeasonNumber(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Episode Name
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={episodeName}
                            onChange={(e) => setEpisodeName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Episode Description
                          </label>
                          <textarea
                            className="w-full p-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={episodeDesc}
                            onChange={(e) => setEpisodeDesc(e.target.value)}
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Episode Video
                          </label>
                          <input
                            type="file"
                            accept="video/mp4, video/webm, video/ogg, video/x-matroska"
                            className="w-full p-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setEpisodeVideo(e.target.files[0])}
                          />
                        </div>
                        <button
                          className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2 ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={saveEpisode}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              <span>Save Episode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg space-y-6"
          >
            <h1 className="text-2xl font-bold text-center">Create Content</h1>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                placeholder="Enter content name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter content description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <input
                type="text"
                placeholder="Enter content genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Premium Content?
              </label>
              <input
                type="checkbox"
                checked={premium}
                onChange={(e) => setpremium(e.target.checked)}
                className="w-6 h-6 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Thumbnail
              </label>
              {thumbnail ? (
                <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                  <span className="text-white">{thumbnail.name}</span>
                  <button
                    type="button"
                    onClick={() => setThumbnail(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold transition duration-300 flex items-center justify-center ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Uploading... ({Math.round(uploadProgress)}%)
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Create Content
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Upload;
