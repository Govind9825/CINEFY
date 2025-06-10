"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import { FaUserCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useSession } from "next-auth/react";

const Profile = () => {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const { data: session } = useSession();
  const [user, setUser] = useState({
    name: "",
    email: "",
    joinedDate: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/login?email=${session.user.email}`);
        if (!res.ok) throw new Error("Something went wrong");

        const data = await res.json();
        setUser({
          name: data.user.name || session.user.name,
          email: data.user.email || session.user.email,
          joinedDate: data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : "Recently",
        });
        setEditedUser({
          name: data.user.name || session.user.name,
          email: data.user.email || session.user.email,
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Fallback to session data
        setUser({
          name: session.user.name,
          email: session.user.email,
          joinedDate: "Recently",
        });
        setEditedUser({
          name: session.user.name,
          email: session.user.email,
        });
      } finally {
        setIsLoadingUser(false);
      }
    };

    if (session) fetchUserDetails();
  }, [session?.user?.email, session]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Here you would typically make an API call to update user data
    setUser({ ...user, ...editedUser });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-3xl p-10 w-full max-w-md border border-gray-700 backdrop-blur-sm"
        >
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              className="relative mb-4"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  <FaUserCircle className="w-20 h-20 text-gray-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  {user.name || "Not provided"}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                {user.email}
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Member Since</label>
              <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                {user.joinedDate}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;