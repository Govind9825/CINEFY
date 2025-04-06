import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ message: "Missing payment details" }), {
        status: 400,
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("RAZORPAY_KEY_SECRET is not defined in .env.local");
    }

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      return new Response(JSON.stringify({ status: "ok", message: "Payment verified" }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ status: "verification_failed", message: "Invalid signature" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ message: "Error verifying payment" }), {
      status: 500,
    });
  }
}
