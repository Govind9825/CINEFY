'use server';

import connectDB from "@/app/lib/db"; 
import User from "@/app/models/user"; 
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB(); 

        const { name, email, premium } = await req.json();

        if (!name  || !email) {
            return new NextResponse(JSON.stringify({ success: false, error: "All fields are required" }), { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ success: false, error: "User already exists" }), { status: 400 });
        }

        const newUser = new User({ name, email, premium });
        await newUser.save();

        return new NextResponse(JSON.stringify({ success: true, data: newUser }), { status: 201 });
    } catch (err) {
        return new NextResponse(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}

