import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for Todo document
export interface ITodo extends Document {
  userId: string; // userId is stored as a string
  workName: string;
  time: Date;
  otherMemberName: string[];  // Array of strings for other members
  type: 'personal' | 'group' | 'academic'; // Type of todo
  other: string;  // Optional extra information
  createdAt: Date;  // Automatically generated timestamp for when the todo is created
  status: 'pending' | 'done'; // Status of the todo
}

// Schema for Todo model
const TodoSchema: Schema<ITodo> = new Schema(
  {
    userId: {
      type: String,  // Store userId as a string (no conversion needed to ObjectId)
      required: [true, "User ID is required"]
    },
    workName: {
      type: String,
      required: [true, "Work name is required"],
      trim: true
    },
    time: {
      type: Date,
      required: [true, "Time is required"]
    },
    otherMemberName: {
      type: [String],
      default: []  // Default to an empty array if no other members
    },
    type: {
      type: String,
      enum: ['personal', 'group', 'academic'],  // Enum to restrict type to one of these values
      required: [true, "Type is required"]
    },
    other: {
      type: String,
      default: ''  // Default to empty string if no additional info
    },
    createdAt: {
      type: Date,
      default: Date.now  // Automatically set the creation date
    },
    status: {
      type: String,
      enum: ["pending", "done"], // Status can be either "pending" or "done"
      default: "pending", // Default value is "pending"
    }
  },
  { collection: "todos" }  // Specify the collection name in MongoDB
);

// Create the Todo model and export it
const Todo: Model<ITodo> = mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);

export default Todo; // Ensure this is the default export
