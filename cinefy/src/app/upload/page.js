"use client";
import React, { useState, useRef } from "react";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [viewLink, setViewLink] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const [fileSize, setFileSize] = useState(null); // Track file size
    const [uploadSpeed, setUploadSpeed] = useState("0 KB/s"); // Track upload speed
    const [remainingTime, setRemainingTime] = useState("Calculating..."); // Track remaining time
    const [fileName, setFileName] = useState(""); // Track custom file name
    const startTimeRef = useRef(null); // Track start time of upload

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileSize((selectedFile.size / (1024 * 1024)).toFixed(2)); // Convert bytes to MB
            setFileName(selectedFile.name); // Set initial file name
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");

        setUploading(true);
        setUploadSpeed("0 KB/s"); // Reset upload speed
        setRemainingTime("Calculating..."); // Reset remaining time
        startTimeRef.current = new Date(); // Record start time

        // Create a new File object with the updated name
        const renamedFile = new File([file], fileName, { type: file.type });

        const formData = new FormData();
        formData.append("file", renamedFile); // Use the renamed file

        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:3000/api/upload", true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress); // Update progress

                    // Calculate upload speed
                    const currentTime = new Date();
                    const timeElapsed = (currentTime - startTimeRef.current) / 1000; // Convert to seconds
                    const speed = (event.loaded / timeElapsed / 1024).toFixed(2); // Convert to KB/s
                    setUploadSpeed(`${speed} KB/s`);

                    // Calculate remaining time
                    const remainingBytes = event.total - event.loaded;
                    const remainingTimeInSeconds = (remainingBytes / 1024) / speed; // Convert to seconds
                    if (remainingTimeInSeconds > 0) {
                        const minutes = Math.floor(remainingTimeInSeconds / 60);
                        const seconds = Math.floor(remainingTimeInSeconds % 60);
                        setRemainingTime(`${minutes}m ${seconds}s remaining`);
                    } else {
                        setRemainingTime("Almost done...");
                    }
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        setViewLink(data.viewLink);
                        setFileName("")
                    } else {
                        alert("Upload failed");
                    }
                } else {
                    alert("Upload failed");
                }
                setUploading(false);
                setUploadProgress(0); // Reset progress
                setUploadSpeed("0 KB/s"); // Reset upload speed
                setRemainingTime("Calculating..."); // Reset remaining time
            };

            xhr.onerror = () => {
                alert("Upload error");
                setUploading(false);
                setUploadProgress(0); // Reset progress
                setUploadSpeed("0 KB/s"); // Reset upload speed
                setRemainingTime("Calculating..."); // Reset remaining time
            };

            xhr.send(formData);
        } catch (error) {
            console.error("Upload error:", error);
            setUploading(false);
            setUploadProgress(0); // Reset progress
            setUploadSpeed("0 KB/s"); // Reset upload speed
            setRemainingTime("Calculating..."); // Reset remaining time
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mr-2 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                    Upload a File
                </h1>
                <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-400">
                            Drag & drop a file or{" "}
                            <span className="text-blue-500 hover:underline">browse</span>
                        </p>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    {file && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400">
                                Selected File: <span className="text-blue-500">{file.name}</span> ({fileSize} MB)
                            </p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="Enter a new file name"
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={() => setFileName(file.name)} // Reset to original name
                                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    {uploading && (
                        <div className="w-full space-y-2">
                            <div className="w-full bg-gray-700 rounded-full">
                                <div
                                    className="bg-blue-500 text-xs font-medium text-white text-center p-1 leading-none rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                >
                                    {uploadProgress}%
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <p>Speed: {uploadSpeed}</p>
                                <p>{remainingTime}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${
                            uploading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        } transition duration-200 flex items-center justify-center`}
                    >
                        {uploading ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                        )}
                        {uploading ? "Uploading..." : "Upload to Drive"}
                    </button>
                    {viewLink && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-400">File uploaded successfully!</p>
                            <a
                                href={viewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                View Uploaded File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Upload;