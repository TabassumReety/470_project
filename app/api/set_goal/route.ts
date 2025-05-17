import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoDB";
import Goal from "@/models/Goal";
import type { ICoWorker } from "@/models/Goal";

// POST request for creating a goal
export const POST = async (req: Request) => {

  try {
    // Ensure database connection FIRST
    await connectToDB();

    // Get Clerk user
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

    const {
      category,
      type,
      title,
      weeks,
      subGoalType,
      dailyHours,
      weeklyHours,
      weeksData,
      coWorkers, // <-- add coWorkers
    } = await req.json();

    // Convert numeric fields from string to number (from form input)
    const parsedWeeks = Number(weeks);
    const parsedDailyHours = dailyHours ? Number(dailyHours) : undefined;
    const parsedWeeklyHours = weeklyHours ? Number(weeklyHours) : undefined;

    if (!category || !type || !title || isNaN(parsedWeeks) || parsedWeeks <= 0 || !subGoalType) {
      console.error("Missing required fields");
      return NextResponse.json({ message: "Missing or invalid required fields" }, { status: 400 });
    }

    if (
      (subGoalType === "Daily" && (parsedDailyHours === undefined || isNaN(parsedDailyHours) || parsedDailyHours <= 0)) ||
      (subGoalType === "Weekly" && (parsedWeeklyHours === undefined || isNaN(parsedWeeklyHours) || parsedWeeklyHours <= 0))
    ) {
      console.error("Missing or invalid planned hours");
      return NextResponse.json({ message: "Missing or invalid planned hours" }, { status: 400 });
    }

    // Validate weeksData
    if (!Array.isArray(weeksData) || weeksData.length !== parsedWeeks) {
      console.error("Invalid weeksData format");
      return NextResponse.json({ message: "Invalid or mismatched weeksData format" }, { status: 400 });
    }

    const parsedWeeksData = weeksData.map((week: any, index: number) => {
      console.log("Week data:", week);
      if (!week.subGoalTitle || typeof week.hoursPlanned !== "number" || week.hoursPlanned <= 0) {
        throw new Error(`Week ${index + 1} is missing subGoalTitle or has invalid hoursPlanned`);
      }
      return {
        weekNumber: week.weekNumber || index + 1,
        subGoalTitle: week.subGoalTitle,
        hoursPlanned: Number(week.hoursPlanned),
        status: "Not Started",
      };
    });
  
    // Validate coWorkers if present
    let parsedCoWorkers: ICoWorker[] = [];
    if (coWorkers) {
      if (!Array.isArray(coWorkers)) {
        return NextResponse.json({ message: "coWorkers must be an array" }, { status: 400 });
      }
      parsedCoWorkers = await Promise.all(
        coWorkers
          .filter((cw: any) => cw && typeof cw.email === "string" && cw.email.trim() !== "")
          .map(async (cw: any) => {
            const user = await (await import("@/models/User")).default.findOne({ email: cw.email });
            return {
              email: cw.email,
              userId: user && user._id ? String(user._id) : undefined,
              status: "pending",
            };
          })
      );
    }

    // Ensure database connection
    await connectToDB();
    console.log("Connected to database");

    const newGoal = await Goal.create({
      userId: String(mongoUser._id),
      category,
      type,
      title,
      weeks: parsedWeeks,
      subGoalType,
      dailyHours: subGoalType === "Daily" ? parsedDailyHours : undefined,
      weeklyHours: subGoalType === "Weekly" ? parsedWeeklyHours : undefined,
      weeksData: parsedWeeksData,
      coWorkers: parsedCoWorkers, // <-- save coWorkers
    });
    console.log("New goal created:", newGoal);

    // Return the created goal (including _id) to the frontend
    return NextResponse.json({ message: "Goal created successfully", goal: newGoal });
  } catch (error: any) {
    console.error("Goal creation error:", error.message || error);
    return NextResponse.json({ message: "Failed to create goal" }, { status: 500 });
  }
};

export const GET = async () => {

  try {
    // Ensure database connection FIRST
    await connectToDB();

    // Get Clerk user
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

    // Find goals created by the user (userId = mongoUser._id)
    const ownGoals = await Goal.find({ userId: String(mongoUser._id) }).sort({ createdAt: -1 });

    // Find goals where the user is an accepted invitee (Invitation table)
    const Invitation = (await import("@/models/Invitation")).default;
    const acceptedInvitations = await Invitation.find({ inviteeUserId: String(mongoUser._id), status: "accepted" });
    const invitedGoalIds = acceptedInvitations.map((inv: any) => inv.goalId);
    // Avoid duplicate goals if user is both owner and invitee
    const invitedGoals = invitedGoalIds.length > 0
      ? await Goal.find({ _id: { $in: invitedGoalIds }, userId: { $ne: String(mongoUser._id) } })
      : [];

    // Combine and remove duplicates (shouldn't be any, but just in case)
    const allGoals = [...ownGoals, ...invitedGoals];

    return NextResponse.json({ goals: allGoals });
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return NextResponse.json({ message: "Failed to fetch goals" }, { status: 500 });
  }
};