import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoDB";
import Goal from "@/models/Goal";
import mongoose from "mongoose";

// Example backend route for updating the goal
export async function PUT(req: Request, { params }: { params: { goalId: string } }) {
  try {
    const { goalId } = await params;
    const { weekIndex, status } = await req.json();
    // Validate the goalId
    if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goal ID" }, { status: 400 });
    }

    console.log(goalId);
    console.log("Week index:", weekIndex);
    console.log("Status:", status);

    // Connect to the database
    await connectToDB();

    const dbGoal = await Goal.findById(goalId);
    
    if (!dbGoal) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    // Update the status of the specific week in weeksData
    if (
      Array.isArray(dbGoal.weeksData) &&
      typeof weekIndex === "number" &&
      dbGoal.weeksData[weekIndex]
    ) {
      // Only allow marking as Completed if current status is 'pending'
      if (dbGoal.weeksData[weekIndex].status === "pending" && status === "Completed") {
        dbGoal.weeksData[weekIndex].status = "Completed";
        console.log("Week status updated to Completed");
        // Set the next week's status to 'pending' if it is 'Not Started'
        if (
          weekIndex + 1 < dbGoal.weeksData.length &&
          dbGoal.weeksData[weekIndex + 1].status === "Not Started"
        ) {
          dbGoal.weeksData[weekIndex + 1].status = "pending";
        }
      } else {
        // If not allowed, return error
        return NextResponse.json({ message: "Invalid status transition" }, { status: 400 });
      }

      // PHASE LOGIC: update phase if all weeks completed or at least one completed
      const allCompleted = dbGoal.weeksData.every((w) => w.status === "Completed");
      const anyCompleted = dbGoal.weeksData.some((w) => w.status === "Completed");
      if (allCompleted) {
        dbGoal.phase = "Completed";
      } else if (anyCompleted) {
        dbGoal.phase = "In Progress";
      } else {
        dbGoal.phase = "Not Started";
      }
    } else {
      return NextResponse.json({ message: "Invalid week index or weeksData" }, { status: 400 });
    }

    await dbGoal.save();

    // Return only the next week's data if available, else empty array
    let nextWeekData: typeof dbGoal.weeksData = [];
    if (
      Array.isArray(dbGoal.weeksData) &&
      typeof weekIndex === "number" &&
      weekIndex + 1 < dbGoal.weeksData.length
    ) {
      nextWeekData = [dbGoal.weeksData[weekIndex + 1]];
    }

    return NextResponse.json({ goal: dbGoal, nextWeekData });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ message: "Error updating goal" }, { status: 500 });
  }
}
