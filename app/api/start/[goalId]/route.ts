import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Goal from "@/models/Goal";
import mongoose from "mongoose";

// PUT: /api/start/[goalId]
export async function PUT(req: Request, { params }: { params: { goalId: string } }) {
  try {
    const { goalId } = params;
    if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ message: "Invalid goal ID" }, { status: 400 });
    }

    await connectToDB();
    const dbGoal = await Goal.findById(goalId);
    if (!dbGoal) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    // Only update if not already in progress or completed
    if (dbGoal.phase === "Not Started" && Array.isArray(dbGoal.weeksData) && dbGoal.weeksData.length > 0) {
      // Check if all weeks are already completed
      const allCompleted = dbGoal.weeksData.every((w: any) => w.status === "Completed");
      if (allCompleted) {
        dbGoal.phase = "Completed";
      } else {
        dbGoal.phase = "In Progress";
        if (dbGoal.weeksData[0].status === "Not Started") {
          dbGoal.weeksData[0].status = "pending";
        }
      }
      await dbGoal.save();
      return NextResponse.json({ goal: dbGoal });
    } else {
      return NextResponse.json({ message: "Goal already started or no weeks data" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error starting goal:", error);
    return NextResponse.json({ message: "Error starting goal" }, { status: 500 });
  }
}
