import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import User from "@/models/User";

export const POST = async (req: Request) => {
  try {
    const { email, password, name } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create user in Clerk (optional — remove this block if not using Clerk)
    const clerkResponse = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password,
        public_metadata: {}, // You can add role if needed later
      }),
    });

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.json();
      console.error("Clerk error:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Failed to create user with Clerk" },
        { status: clerkResponse.status }
      );
    }

    console.log("Clerk user created successfully");
    await connectToDB();
    console.log("Connected to MongoDB");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Save user to DB
    const newUser = new User({ email, name, password });
    await newUser.save();

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
};

