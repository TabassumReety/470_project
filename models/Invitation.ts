import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvitation extends Document {
  inviterUserId: string; // The user who sends the invite
  inviteeUserId: string; // The user who is invited
  inviteeEmail: string;   // The email of the invited user
  goalId: string;         // The goal being shared
  status: "pending" | "accepted";
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    inviterUserId: { type: String, required: true },
    inviteeUserId: { type: String, required: true },
    inviteeEmail: { type: String, required: true },
    goalId: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "invitations" }
);

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;
