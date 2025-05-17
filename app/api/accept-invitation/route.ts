

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Goal from "@/models/Goal";
import User from "@/models/User";

export const POST = async (req: Request) => {
  try {
    const { invitationId, goalId } = await req.json();
    if (!invitationId || !goalId) {
      return NextResponse.json({ message: "Missing invitationId or goalId" }, { status: 400 });
    }

    await connectToDB();

    // Update invitation status to accepted
    const invitation = await (await import("@/models/Invitation")).default.findById(invitationId);
    if (!invitation) {
      return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
    }
    invitation.status = "accepted";
    await invitation.save();

    // Optionally, add user as coworker to the goal (if not already)
    // You can expand this logic as needed

    return NextResponse.json({ message: "Invitation accepted" });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json({ message: "Failed to accept invitation" }, { status: 500 });
  }
};
