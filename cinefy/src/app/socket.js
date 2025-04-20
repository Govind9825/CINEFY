"use client";

import { io } from "socket.io-client";

// Use a valid URL format, including protocol (http or https) and port if needed
export const socket = io("http://10.0.5.51"); // Replace 3000 with your actual server port
