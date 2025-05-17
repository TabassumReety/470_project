import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Invitation from "@/models/Invitation";

export const POST = async (req: Request) => {
  try {
    const { invitationId } = await req.json();
    if (!invitationId) {
      return NextResponse.json({ message: "Missing invitationId" }, { status: 400 });
    }
    await connectToDB();
    const deleted = await Invitation.findByIdAndDelete(invitationId);
    if (!deleted) {
      return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Invitation denied and deleted" });
  } catch (error) {
    console.error("Error denying invitation:", error);
    return NextResponse.json({ message: "Failed to deny invitation" }, { status: 500 });
  }
};
