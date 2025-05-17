import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import User from "@/models/User";
import { currentUser } from "@clerk/nextjs/server";
import Invitation from "@/models/Invitation";
import { connectToDB } from "@/lib/mongoDB";

export const POST = async (req: Request) => {
    console.log("POST /api/invite-coworker");

  try {
    await connectToDB();
    const { email, goal } = await req.json();

    // Get the inviter's MongoDB user by Clerk email
    const inviterClerk = await currentUser();
    if (!inviterClerk || !inviterClerk.emailAddresses || inviterClerk.emailAddresses.length === 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const inviterEmail = inviterClerk.emailAddresses[0].emailAddress;
    const inviterUser = await User.findOne({ email: inviterEmail });
    if (!inviterUser || !inviterUser._id) {
      return NextResponse.json({ message: "Inviter not found in DB" }, { status: 404 });
    }

    console.log("Email to invite:", email);
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if the email exists in the User collection
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "This email is not registered in the system" }, { status: 404 });
    }
    console.log("All OKAY");
    console.log(goal);
    console.log(goal._id);


    // Save invitation record
    if (goal && goal._id) {
      await Invitation.create({
        inviterUserId: String(inviterUser._id),
        inviteeUserId: user._id ? String(user._id) : "",
        inviteeEmail: email,
        goalId: goal._id,
        status: "pending",
      });
    }

    // Configure nodemailer (use your SMTP credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Compose invitation email with goal details if provided
    let goalDetails = "";
    if (goal) {
      goalDetails = `
        <h3>Goal Details:</h3>
        <ul>
          <li><b>Title:</b> ${goal.title}</li>
          <li><b>Category:</b> ${goal.category}</li>
          <li><b>Type:</b> ${goal.type}</li>
          <li><b>Weeks:</b> ${goal.weeks}</li>
          <li><b>Sub-Goal Type:</b> ${goal.subGoalType}</li>
          ${goal.dailyHours ? `<li><b>Daily Hours:</b> ${goal.dailyHours}</li>` : ""}
          ${goal.weeklyHours ? `<li><b>Weekly Hours:</b> ${goal.weeklyHours}</li>` : ""}
        </ul>
        <h4>Sub-goals:</h4>
        <ul>
          ${(goal.weeksData || []).map((w: any, i: number) => `<li>Week ${i+1}: ${w.subGoalTitle} (${w.hoursPlanned} hours)</li>`).join("")}
        </ul>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Goal Invitation",
      html: `
        <p>You have been invited to collaborate on a goal in ReLife.</p>
        ${goalDetails}
        <p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/accept-invitation?email=${encodeURIComponent(email)}">
            Click here to accept the invitation
          </a>
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("invitation sent")
    return NextResponse.json({ message: "Invitation sent" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json({ message: "Failed to send invitation" }, { status: 500 });
  }
};
