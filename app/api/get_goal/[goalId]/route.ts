
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoDB";
import Goal from "@/models/Goal";
import mongoose from "mongoose";

// GET function to fetch a goal by goalId, filtering by MongoDB user _id
export async function GET(req: Request, { params }: { params: { goalId: string } }) {
  try {
    const { goalId } = params; // Extract goalId from the URL parameters

    // Fetch the current user
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the primary email from Clerk user
    const email = clerkUser.emailAddresses[0].emailAddress;

    // Find the MongoDB user by email
    const mongoUser = await (await import("@/models/User")).default.findOne({ email });
    if (!mongoUser || !mongoUser._id) {
      return NextResponse.json({ message: "User not found in DB" }, { status: 404 });
    }

    // Connect to the database
    await connectToDB();

    // Validate the goalId
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goal ID format" }, { status: 400 });
    }

    // Fetch the goal from the database by goalId and mongo user _id
    const goal = await Goal.findOne({ _id: new mongoose.Types.ObjectId(goalId), userId: String(mongoUser._id) });
    if (!goal) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    // Return the goal details
    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { message: "Error fetching goal", error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request, { params }: { params: { goalId: string } }) {
  try {
    const { goalId } = params;  // Extract goalId from the URL parameters

    // Ensure that goalId exists and is valid
    if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goal ID" }, { status: 400 });
    }

    // Fetch the current user
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the primary email from Clerk user
    const email = clerkUser.emailAddresses[0].emailAddress;

    // Find the MongoDB user by email
    const mongoUser = await (await import("@/models/User")).default.findOne({ email });
    if (!mongoUser || !mongoUser._id) {
      return NextResponse.json({ message: "User not found in DB" }, { status: 404 });
    }

    // Connect to the database
    await connectToDB();

    // Delete the goal by goalId and mongo user _id (to ensure users can only delete their own goals)
    const result = await Goal.deleteOne({ _id: new mongoose.Types.ObjectId(goalId), userId: String(mongoUser._id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Goal not found or you are not authorized to delete it" }, { status: 404 });
    }

    // Return success message
    return NextResponse.json({ message: "Goal deleted successfully" });

  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { message: "Error deleting goal", error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}