import mongoose, { Schema, Model } from "mongoose";

// Subdocument interface for a single week's sub-goal
export interface IWeekSubGoal {
  weekNumber?: number;
  subGoalTitle?: string;
  hoursPlanned?: number;
  status?: "Not Started" | "pending" | "Completed";
  weekStartAt?: Date; // Start date of the week
  weekEndAt?: Date;   // End date of the week
}

// Add coworker interface
export interface ICoWorker {
  email: string;
  userId?: string;
  status: "pending" | "accepted";
}

// Main Goal interface
export interface IGoal {
  userId: string;
  category: "Academic" | "Non-Academic";
  type: "Single" | "Group";
  title: string;
  weeks: number;
  subGoalType: "Daily" | "Weekly";
  dailyHours?: number;
  weeklyHours?: number;
  createdAt?: Date;
  phase: "Not Started" | "In Progress" | "Completed";
  weeksData?: IWeekSubGoal[];
  coWorkers?: ICoWorker[];
}

// Subschema for weeksData
const WeekSubGoalSchema = new Schema<IWeekSubGoal>(
  {
    weekNumber: { type: Number, required: false },
    subGoalTitle: { type: String, required: false },
    hoursPlanned: { type: Number, required: false },
    status: {
      type: String,
      enum: ["Not Started", "pending", "Completed"],
      default: "Not Started",
    },
    weekStartAt: { type: Date, required: false }, // Start date of the week
    weekEndAt: { type: Date, required: false },   // End date of the week
  },
  { _id: false }
);

// Main Goal schema
const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: String, required: true },
    category: { type: String, enum: ["Academic", "Non-Academic"], required: true },
    type: { type: String, enum: ["Single", "Group"], required: true },
    title: { type: String, required: true },
    weeks: { type: Number, required: true },
    subGoalType: { type: String, enum: ["Daily", "Weekly"], required: true },
    dailyHours: { type: Number, required: false },
    weeklyHours: { type: Number, required: false },
    phase: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    createdAt: { type: Date, default: Date.now },
    weeksData: { type: [WeekSubGoalSchema], required: false },
    coWorkers: [
      {
        email: { type: String, required: true },
        userId: { type: String },
        status: { type: String, enum: ["pending", "accepted"], default: "pending" },
      },
    ],
  },
  { collection: "goals" }
);

// Model export
const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
