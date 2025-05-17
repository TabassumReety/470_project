import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server"; // Import currentUser for user authentication
import { connectToDB } from "@/lib/mongoDB";
import SelfImprovementGoal from "../../../models/SelfImprovementGoal.tss";

export const POST = async (req: Request) => {
    try {
        const user = await currentUser(); // Get logged-in user's details
        const userId = user?.id; // Extract user ID

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const {
            skillName,
            subtopic,
            suggestiveTime,
            instructorName,
            sponsorBy,
        } = await req.json();

        if (
            !skillName ||
            !subtopic ||
            !suggestiveTime ||
            !instructorName ||
            !sponsorBy
        ) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDB(); // Connect to DB

        const newGoal = new SelfImprovementGoal({
            userId,
            skillName,
            subtopic,
            suggestiveTime,
            instructorName,
            sponsorBy,
        });

        await newGoal.save(); // Save the new goal in MongoDB

        return NextResponse.json({ message: "Self Improvement goal added" });
    } catch (error) {
        console.error("Error creating goal:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
};

export const GET = async () => {
    try {
        const user = await currentUser(); // Get logged-in user's details
        const userId = user?.id; // Extract user ID

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDB(); // Connect to DB

        // Fetch all goals for the logged-in user
        const goals = await SelfImprovementGoal.find({ userId }).sort({
            createdAt: -1,
        });

        return NextResponse.json({ goals });
    } catch (error) {
        console.error("Error fetching goals:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
};
