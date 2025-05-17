import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Todo from "@/models/Todo";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    await connectToDB();

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTodo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo updated successfully", todo: updatedTodo });
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json({ message: "Error updating todo" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await connectToDB();

    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json({ message: "Error deleting todo" }, { status: 500 });
  }
}
