import mongoose, { Schema, Document, Model } from "mongoose";

// SelfImprovementGoal Interface
export interface ISelfImprovementGoal extends Document {
  userId: string;
  skillName: string;
  subtopic: string;
  suggestiveTime: number; // time in hours
  instructorName: string;
  sponsorBy: string;
  createdAt: Date;
}

// Mongoose Schema
const SelfImprovementGoalSchema = new Schema<ISelfImprovementGoal>(
  {
    userId: { type: String, required: true },
    skillName: { type: String, required: true },
    subtopic: { type: String, required: true },
    suggestiveTime: { type: Number, required: true },
    instructorName: { type: String, required: true },
    sponsorBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "self_improvement_goals" }
);

// Create Model
const SelfImprovementGoal: Model<ISelfImprovementGoal> =
  mongoose.models.SelfImprovementGoal ||
  mongoose.model<ISelfImprovementGoal>("SelfImprovementGoal", SelfImprovementGoalSchema);

export default SelfImprovementGoal;
