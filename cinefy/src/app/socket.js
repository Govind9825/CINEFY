"use client";

import { io } from "socket.io-client";

// Use a valid URL format, including protocol (http or https) and port if needed
export const socket = io("http://localhost:3000");

