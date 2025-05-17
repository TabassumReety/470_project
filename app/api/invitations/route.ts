import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoDB";
import Invitation from "@/models/Invitation";
import Goal from "@/models/Goal";

export const GET = async () => {
  try {
    await connectToDB();
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
    // Find invitations where the current user is the invitee (by MongoDB user _id)
    const invitations = await Invitation.find({ inviteeUserId: String(mongoUser._id) }).lean();
    // Populate goal and inviter user details
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (inv) => {
        let goal = null;
        let inviter = null;
        try {
          goal = await Goal.findById(inv.goalId).lean();
        } catch (e) {
          goal = null;
        }
        try {
          inviter = await (await import("@/models/User")).default.findById(inv.inviterUserId).lean();
        } catch (e) {
          inviter = null;
        }
        return { ...inv, goal, inviter };
      })
    );
    return NextResponse.json({ invitations: invitationsWithDetails });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json({ message: "Failed to fetch invitations" }, { status: 500 });
  }
};
