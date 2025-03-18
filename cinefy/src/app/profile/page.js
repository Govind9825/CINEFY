"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const [showMembership, setShowMembership] = useState(false);
  const user = {
    name: "Govind Bhatter",
    email: "govindbhatter@gmail.com",
    isPremium: false,
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-10 bg-gray-900 shadow-2xl rounded-2xl p-8 w-96 flex flex-col items-center border border-gray-700"
      >
        <motion.div whileHover={{ scale: 1.1 }} className="text-gray-400">
          <FaUserCircle className="w-24 h-24 text-gray-400" />
        </motion.div>
        <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
        <p className="text-gray-400 text-sm">{user.email}</p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-5 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
          onClick={() => setShowMembership(!showMembership)}
        >
          Check Membership Status
        </motion.button>
        
        {showMembership && (
          <div className="mt-6 text-center text-sm">
            {user.isPremium ? (
              <p className="text-yellow-500 font-semibold">You are a Premium Member!</p>
            ) : (
              <div className="text-gray-300">
                <p className="mb-2">Do you want to upgrade to Premium?</p>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg shadow-md hover:bg-yellow-600 transition">
                    1 Month - ₹100
                  </button>
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg shadow-md hover:bg-yellow-600 transition">
                    6 Months - ₹400
                  </button>
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg shadow-md hover:bg-yellow-600 transition">
                    1 Year - ₹700
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;