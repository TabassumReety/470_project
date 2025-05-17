import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Goal from "@/models/Goal";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// PUT function to update a goal by goalId
export async function PUT(req: Request, { params }: { params: { goalId: string } }) {

  try {
    const { goalId } = params;

    // Connect to MongoDB
    await connectToDB();

    // Fetch the current user (verify authentication)
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

    // Ensure that the goalId is valid
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goal ID format" }, { status: 400 });
    }

    // Parse the request body
    const body = await req.json();
    console.log("Received goal data:", body); // Debugging line

    // Find the existing goal from the database by goalId and MongoDB user _id
    const existingGoal = await Goal.findOne({ _id: goalId, userId: String(mongoUser._id) });
    if (!existingGoal) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    // Update the goal's fields based on the incoming data, excluding the phase field
    existingGoal.title = body.title || existingGoal.title;
    existingGoal.category = body.category || existingGoal.category;
    existingGoal.type = body.type || existingGoal.type;
    existingGoal.weeks = body.weeks || existingGoal.weeks;
    existingGoal.subGoalType = body.subGoalType || existingGoal.subGoalType;
    existingGoal.dailyHours = body.subGoalType === "Daily" ? body.dailyHours : undefined;
    existingGoal.weeklyHours = body.subGoalType === "Weekly" ? body.weeklyHours : undefined;

    // Update weeks data (sub-goals) if provided, excluding the status field
    if (body.weeksData && Array.isArray(body.weeksData)) {
      existingGoal.weeksData = body.weeksData.map((weekData: any, index: number) => {
      const existingWeek = (existingGoal.weeksData ?? []).find((w: any) => w.weekNumber === weekData.weekNumber);
      const updatedWeek = {
        weekNumber: weekData.weekNumber || index + 1,
        subGoalTitle: weekData.subGoalTitle || (existingWeek?.subGoalTitle || ""),
        hoursPlanned: weekData.hoursPlanned || (existingWeek?.hoursPlanned || 0),
        status: existingWeek?.status || "Not Started", // Preserve the existing status
        weekStartAt: weekData.weekStartAt || (existingWeek?.weekStartAt || null),
        weekEndAt: weekData.weekEndAt || (existingWeek?.weekEndAt || null),
      };

      // If the week number is 1, update the object explicitly
      if (updatedWeek.weekNumber === 1) {
        updatedWeek.subGoalTitle = weekData.subGoalTitle || updatedWeek.subGoalTitle;
        updatedWeek.hoursPlanned = weekData.hoursPlanned || updatedWeek.hoursPlanned;
        updatedWeek.weekStartAt = weekData.weekStartAt || updatedWeek.weekStartAt;
        updatedWeek.weekEndAt = weekData.weekEndAt || updatedWeek.weekEndAt;
      }

      return updatedWeek;
      });
    }

    // Save the updated goal to the database
    await existingGoal.save();
    console.log("Updated goal:", existingGoal); // Debugging line

    // Return success response
    return NextResponse.json({ message: "Goal updated successfully", goal: existingGoal });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      {
        message: "Error updating goal",
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
