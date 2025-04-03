import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Ensure this loads the correct file

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
