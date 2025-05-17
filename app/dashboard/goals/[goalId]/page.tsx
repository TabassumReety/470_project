'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface IGoal {
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
  weeksData?: any[];
}

export default function GoalPage() {
  const [goal, setGoal] = useState<IGoal | null>(null);
  const router = useRouter();
  const params = useParams();
  const goalId = params?.goalId as string | undefined;

  useEffect(() => {
    const fetchGoal = async () => {
      if (!goalId) return;
      const response = await fetch(`/api/get_goal/${goalId}`);
      const data = await response.json();
      if (data.goal) {
        setGoal(data.goal);
      }
    };

    fetchGoal();
  }, [goalId]);

  const handleDelete = async () => {
    await fetch(`/api/get_goal/${goalId}`, {
      method: "DELETE",
    });

    router.push("/dashboard");
  };

  const handleStart = async () => {
    if (goal && goal.phase !== "In Progress") {
      const updatedWeeksData = goal.weeksData?.map((week, index) =>
        index === 0 ? { ...week, status: "Pending" } : week
      );

      const updatedGoal = {
        ...goal,
        phase: "In Progress" as "In Progress",
        createdAt: new Date(),
        weeksData: updatedWeeksData,
      };

      await fetch(`/api/start/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGoal),
      });

      setGoal(updatedGoal);
    }
  };

  const handleCompleteSubGoal = async (weekIndex: number) => {
    if (!goal || !goal.weeksData) return;

    const updatedWeeksData = [...goal.weeksData];
    updatedWeeksData[weekIndex].status = "Completed";

    if (weekIndex + 1 < updatedWeeksData.length) {
      updatedWeeksData[weekIndex + 1].status = "Pending";
    }

    const updatedGoal = { ...goal, weeksData: updatedWeeksData };

    await fetch(`/api/startgoal/${goalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedGoal),
    });

    setGoal(updatedGoal);
  };

  if (!goal) return <div>Loading...</div>;

  // Calculate progress
  const totalSubGoals = goal.weeksData?.length || 0;
  const completedSubGoals = goal.weeksData?.filter(w => w.status === "Completed").length || 0;
  const progressPercent = totalSubGoals > 0 ? Math.round((completedSubGoals / totalSubGoals) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow space-y-4 text-gray-800">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-700">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleStart}
          className={`inline-block px-6 py-2 rounded-md ${
            goal?.phase === "In Progress" ? "bg-maroon-600 text-white" : "bg-green-600 text-white hover:bg-green-700"
          }`}
          disabled={goal?.phase === "In Progress"}
        >
          {goal?.phase === "In Progress" ? "Started" : "Start Goal"}
        </button>
      </div>
      <h1 className="text-3xl font-bold">{goal.title}</h1>

      <div className="space-y-2 text-sm">
        <p><strong>Category:</strong> {goal.category}</p>
        <p><strong>Type:</strong> {goal.type}</p>
        <p><strong>Weeks to Complete:</strong> {goal.weeks}</p>
        <p><strong>Sub-Goal Type:</strong> {goal.subGoalType}</p>
        {goal.subGoalType === "Daily" && <p><strong>Daily Hours:</strong> {goal.dailyHours}</p>}
        {goal.subGoalType === "Weekly" && <p><strong>Weekly Hours:</strong> {goal.weeklyHours}</p>}
        <p><strong>Status:</strong> {goal.phase}</p>
        <p><strong>Created At:</strong> {goal.createdAt ? new Date(goal.createdAt).toLocaleString() : "Not Available"}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Sub-goals by Week</h2>
        {Array.isArray(goal.weeksData) && goal.weeksData.length > 0 ? (
          <ul className="space-y-4 mt-4">
            {goal.weeksData.map((week, index) => (
              <li
                key={index}
                className={`p-4 border border-gray-300 rounded-md bg-gray-50 shadow-sm flex justify-between items-center ${week.status === "Completed" ? "opacity-60" : ""}`}
              >
                <div>
                  <p className="font-medium text-lg">Week {week.weekNumber}</p>
                  <p><strong>Title:</strong> {week.subGoalTitle || "Not Provided"}</p>
                  <p><strong>Hours Planned:</strong> {week.hoursPlanned}</p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {week.weekStartAt ? new Date(week.weekStartAt).toLocaleDateString() : "Not Available"}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {week.weekEndAt ? new Date(week.weekEndAt).toLocaleDateString() : "Not Available"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">{week.status}</p>
                  {week.status === "Pending" && (
                    <button
                      onClick={() => handleCompleteSubGoal(index)}
                      className="mt-2 bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700"
                    >
                      Done
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No sub-goals added.</p>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={handleDelete} className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">Delete Goal</button>
        <button onClick={() => router.push(`/dashboard/goals/${goalId}/edit`)} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Edit Goal</button>
      </div>
    </div>
  );
}
