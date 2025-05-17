import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Todo from "@/models/Todo";
import { currentUser } from "@clerk/nextjs/server";

// POST request for creating a todo
export const POST = async (req: Request) => {
  try {
    const user = await currentUser(); // Get logged-in user's details
    const userId = user?.id; // Extract user ID

    console.log("User ID from Clerk:", userId); // Debugging log for user ID

    // Check if the user is authenticated
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: Missing user ID" }, { status: 401 });
    }

    // Validate userId format - user.id is expected to be a string from Clerk
    // If you want to store userId as a string, no need for ObjectId conversion
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json({ message: "Invalid userId format" }, { status: 400 });
    }

    // Parse the incoming request body
    const { workName, time, otherMemberName, type, other } = await req.json();

    // Ensure required fields are provided
    if (!workName || !time || !type) {
      return NextResponse.json(
        { message: "Missing required fields: workName, time, and type are mandatory." },
        { status: 400 }
      );
    }

    // Validate otherMemberName
    if (otherMemberName && !Array.isArray(otherMemberName)) {
      return NextResponse.json(
        { message: "Invalid input: otherMemberName should be an array of strings." },
        { status: 400 }
      );
    }

    // Ensure database connection
    await connectToDB();

    // Create a new Todo item
    const newTodo = new Todo({
      userId: userId, // Store user.id as a valid string
      workName,
      time,
      otherMemberName: otherMemberName || [],
      type,
      other: other || '',
    });

    console.log("New Todo:", newTodo); // Log the new todo for debugging

    // Save the todo to the database
    await newTodo.save();
    return NextResponse.json(
      { message: "ToDo created successfully", todo: newTodo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create todo:", error.message || error);
    return NextResponse.json(
      { message: "Failed to create todo", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
};

// GET request to fetch todos for the current user
export const GET = async () => {
  try {
    const user = await currentUser(); // Get the current user

    // Check if the user is authenticated
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized: Missing user ID" }, { status: 401 });
    }

    // Ensure database connection
    await connectToDB();
    
    // Fetch todos for the current user, sorted by createdAt in descending order
    const todos = await Todo.find({ userId: user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return NextResponse.json({ message: "Failed to fetch todos", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
};
