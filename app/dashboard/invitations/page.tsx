"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Invitation {
  _id: string;
  inviterUserId: string;
  inviteeUserId: string;
  inviteeEmail: string;
  goalId: string;
  status: string;
  createdAt: string;
  goal?: any;
  inviter?: {
    name?: string;
    email?: string;
  };
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true);
      const res = await fetch("/api/invitations");
      const data = await res.json();
      setInvitations(data.invitations || []);
      setLoading(false);
    };
    fetchInvitations();
  }, []);

  const handleAccept = async (invitationId: string, goalId: string) => {
    const res = await fetch("/api/accept-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId, goalId }),
    });
    if (res.ok) {
      setInvitations((prev) =>
        prev.map((inv) =>
          inv._id === invitationId ? { ...inv, status: "accepted" } : inv
        )
      );
    }
  };

  const handleDeny = async (invitationId: string) => {
    const res = await fetch("/api/deny-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
    });
    if (res.ok) {
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Invitations</h1>
      {invitations.length === 0 ? (
        <p>No invitations found.</p>
      ) : (
        <ul className="space-y-4">
          {invitations.map((inv) => (
            <li
              key={inv._id}
              className={`
                group
                p-4
                border
                rounded-xl
                bg-white
                shadow
                flex
                flex-col
                gap-2
                transition
                duration-200
                hover:scale-[1.025]
                hover:shadow-lg
                relative
                overflow-hidden
                border-l-8
                ${
                  inv.status === "pending"
                    ? "border-l-yellow-400"
                    : inv.status === "accepted"
                    ? "border-l-green-500"
                    : "border-l-gray-400"
                }
              `}
            >
              <div className="flex justify-between items-center gap-2">
                <div>
                  <span className="font-semibold">From:</span>{" "}
                  {inv.inviter?.name ? (
                    <>
                      {inv.inviter.name} <span className="text-gray-500">({inv.inviter.email})</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Unknown User</span>
                  )}
                  <span className="ml-4 font-semibold">Status:</span>
                  <span
                    className={`
                      ml-2
                      px-2
                      py-0.5
                      rounded-full
                      text-xs
                      font-semibold
                      ${
                        inv.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : inv.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }
                    `}
                  >
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  {inv.status === "pending" && (
                    <>
                      <button
                        className="
                          bg-green-600
                          text-white
                          px-4
                          py-1
                          rounded
                          hover:bg-green-700
                          w-fit
                          shadow
                          transition
                          duration-150
                          transform
                          hover:-translate-y-0.5
                          hover:scale-105
                          focus:outline-none
                          focus:ring-2
                          focus:ring-green-400
                        "
                        onClick={() => handleAccept(inv._id, inv.goalId)}
                      >
                        Accept
                      </button>
                      <button
                        className="
                          bg-red-500
                          text-white
                          px-4
                          py-1
                          rounded
                          hover:bg-red-700
                          w-fit
                          shadow
                          transition
                          duration-150
                          transform
                          hover:-translate-y-0.5
                          hover:scale-105
                          focus:outline-none
                          focus:ring-2
                          focus:ring-red-400
                        "
                        onClick={() => handleDeny(inv._id)}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>
                  Invitation ID: <span className="font-mono">{inv._id.slice(-6)}</span>
                </span>
                <span>
                  Sent: {new Date(inv.createdAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
