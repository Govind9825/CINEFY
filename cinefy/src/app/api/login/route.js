"use server";

import connectDB from "@/app/lib/db";
import User from "@/app/models/user";
import { NextResponse } from "next/server";

// GET user by email
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST new user (signup)
export async function POST(req) {
  try {
    await connectDB();

    const { name, email, premium } = await req.json();

    if (!name || !email) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "All fields are required" }),
        { status: 400 }
      );
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "User already exists" }),
        { status: 200 } // not a failure — just already present
      );
    }

    const newUser = new User({
      name,
      email,
      premium: premium || false, // default to false
    });

    await newUser.save();

    return new NextResponse(JSON.stringify({ success: true, data: newUser }), {
      status: 201,
    });
  } catch (err) {
    console.error("POST Error:", err.message);
    return new NextResponse(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
