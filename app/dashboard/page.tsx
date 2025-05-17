"use client";

// Define the IWeekSubGoal interface
interface IWeekSubGoal {
  subGoalTitle?: string;
  weekNumber: number;
  hoursPlanned?: number;
  weekStartAt?: string;
  weekEndAt?: string;
  status: string;
}

import { useEffect, useState } from "react";
import Link from "next/link";

// Utility function for count-up animation
const useCountUp = (end: number, duration = 1000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); // approx 60 FPS
    const step = () => {
      start += increment;
      if (start < end) {
        setValue(Math.floor(start));
        requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };
    step();
  }, [end, duration]);

  return value;
};

export default function DashboardPage() {
  const [fetchedGoals, setFetchedGoals] = useState<any[]>([]);

  useEffect(() => {
    const getGoals = async () => {
      try {
        const res = await fetch("/api/set_goal");
        const data = await res.json();
        setFetchedGoals(data.goals || []);
      } catch (err) {
        console.error("Failed to fetch user goals", err);
      }
    };

    getGoals();
  }, []);

  // Handler to start a goal (set first week's status to 'pending' and phase to 'In Progress')
  const handleStartGoal = async (goalId: string) => {
    setFetchedGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal._id !== goalId) return goal;
        const updatedWeeksData = [...goal.weeksData];
        if (updatedWeeksData[0]?.status === "Not Started") {
          updatedWeeksData[0].status = "pending";
        }
        return { ...goal, weeksData: updatedWeeksData, phase: "In Progress" };
      })
    );

    // Use the new backend endpoint for starting a goal
    await fetch(`/api/start/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  };

  const handleCompleteSubGoal = async (goalId: string, weekIndex: number) => {
    // Optimistically update UI
    setFetchedGoals((prevGoals) => {
      return prevGoals.map((goal) => {
        if (goal._id !== goalId) return goal;
        const updatedWeeksData = [...goal.weeksData];
        updatedWeeksData[weekIndex].status = "Completed";
        // If there's a next subgoal, set its status to "pending" if it was "Not Started"
        if (
          weekIndex + 1 < updatedWeeksData.length &&
          updatedWeeksData[weekIndex + 1].status === "Not Started"
        ) {
          updatedWeeksData[weekIndex + 1].status = "pending";
        }
        // Check if all weeks are now completed
        const allCompleted = updatedWeeksData.every((w: IWeekSubGoal) => w.status === "Completed");
        let newPhase = goal.phase;
        if (allCompleted) {
          newPhase = "Completed";
        } else if (updatedWeeksData.some((w: IWeekSubGoal) => w.status === "Completed")) {
          newPhase = "In Progress";
        }
        return { ...goal, weeksData: updatedWeeksData, phase: newPhase };
      });
    });

    // Update the backend
    await fetch(`/api/startgoal/${goalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ weekIndex, status: "Completed" }),
    });
  };

  const totalGoals = fetchedGoals.length;
  const inProgressGoals = fetchedGoals.filter(goal => goal.phase === "In Progress").length;
  const completedGoals = fetchedGoals.filter(goal => goal.phase === "Completed").length;

  const academicGoals = fetchedGoals.filter(goal => goal.category === "Academic");
  const nonAcademicGoals = fetchedGoals.filter(goal => goal.category === "Non-Academic");
  console.log(fetchedGoals);

  // Delete goal handler
  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/get_goal/${goalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFetchedGoals((prevGoals) => prevGoals.filter((g) => g._id !== goalId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete goal");
      }
    } catch (err) {
      console.error("Failed to delete goal", err);
      alert("An error occurred while deleting the goal.");
    }
  };

  const pendingWeeks = fetchedGoals.flatMap((goal) =>
    (goal.weeksData || [])
      .map((week: IWeekSubGoal, idx: number) => ({
        week,
        weekIndex: idx,
        goalId: goal._id,
        goalTitle: goal.title,
        category: goal.category,
      }))
      .filter(({ week }: { week: IWeekSubGoal }) => week.status && week.status.toLowerCase() === "pending")
      .map(
        ({
          week,
          weekIndex,
          goalId,
          goalTitle,
          category,
        }: {
          week: IWeekSubGoal;
          weekIndex: number;
          goalId: string;
          goalTitle: string;
          category: string;
        }) => ({
          goalId,
          goalTitle,
          subGoalTitle: week.subGoalTitle || "No Subgoal",
          weekNumber: week.weekNumber,
          hoursPlanned: week.hoursPlanned || "N/A",
          startDate: week.weekStartAt
            ? new Date(week.weekStartAt).toLocaleDateString()
            : "Not Available",
          endDate: week.weekEndAt
            ? new Date(week.weekEndAt).toLocaleDateString()
            : "Not Available",
          category,
          status: week.status,
          weekIndex,
        })
      )
  );
  console.log("Pending weeks data:", pendingWeeks); // Debugging line

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Section 1: Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Goals</h3>
          <p className="text-3xl font-bold text-blue-600">{totalGoals}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">In Progress Goals</h3>
          <p className="text-3xl font-bold text-green-600">{inProgressGoals}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Completed Goals</h3>
          <p className="text-3xl font-bold text-yellow-600">{completedGoals}</p>
        </div>
      </section>
      {/* Section 2: This Week's Goals */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          This Week's Goals
        </h2>
        <ul className="space-y-3">
          {pendingWeeks.map((week, i) => (
            <li
              key={i}
              className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-700">{week.goalTitle}</h4>
                <p className="text-sm text-gray-500">
                  Subgoal: {week.subGoalTitle}
                </p>
                <p className="text-sm text-gray-500">
                  Category: {week.category || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Hours Planned: {week.hoursPlanned}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                  {week.status}
                </span>
                {week.status.toLowerCase() === "pending" && (
                  <button
                    onClick={() =>
                      handleCompleteSubGoal(week.goalId, week.weekIndex)
                    }
                    className="mt-2 bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700"
                  >
                    Done
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3: All Goals - Display Goals in Two Columns (Academic and Non-Academic) */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          All Goals
        </h2>

        {/* Goals grouped by Academic and Non-Academic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Academic Goals */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Academic Goals</h3>
            {academicGoals.map((goal, i) => {
              // Calculate completion percentage
              const total = Array.isArray(goal.weeksData) ? goal.weeksData.length : 0;
              const completed = Array.isArray(goal.weeksData)
                ? goal.weeksData.filter((w: IWeekSubGoal) => w.status === "Completed").length
                : 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={i} className="p-4 border rounded-lg hover:shadow transition bg-gray-50 block relative group">
                  <Link
                    href={`/dashboard/goals/${goal._id}`}
                    className="block"
                  >
                    <h4 className="font-semibold text-lg text-gray-800 mb-1">{goal.title}</h4>
                    <p className="text-sm text-gray-600">{goal.category}</p>
                    {/* Progress Bar */}
                    <div className="mt-2 mb-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-semibold text-blue-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                    <span
                      className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
                        goal.status === "Done"
                          ? "bg-green-100 text-green-700"
                          : goal.status === "Wishlist"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {goal.status || "Pending"}
                    </span>
                  </Link>
                  {goal.phase === "Not Started" && (
                    <button
                      onClick={() => handleStartGoal(goal._id)}
                      className="mt-2 bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700"
                    >
                      Start Goal
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 hover:bg-red-700 transition"
                    title="Delete Goal"
                  >
                    &#10005;
                  </button>
                </div>
              );
            })}
          </div>

          {/* Non-Academic Goals */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Non-Academic Goals</h3>
            {nonAcademicGoals.map((goal, i) => {
              const total = Array.isArray(goal.weeksData) ? goal.weeksData.length : 0;
              const completed = Array.isArray(goal.weeksData)
                ? goal.weeksData.filter((w: IWeekSubGoal) => w.status === "Completed").length
                : 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={i} className="p-4 border rounded-lg hover:shadow transition bg-gray-50 block relative group">
                  <Link
                    href={`/dashboard/goals/${goal._id}`}
                    className="block"
                  >
                    <h4 className="font-semibold text-lg text-gray-800 mb-1">{goal.title}</h4>
                    <p className="text-sm text-gray-600">{goal.category}</p>
                    {/* Progress Bar */}
                    <div className="mt-2 mb-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-semibold text-blue-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                    <span
                      className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
                        goal.status === "Done"
                          ? "bg-green-100 text-green-700"
                          : goal.status === "Wishlist"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {goal.status || "Pending"}
                    </span>
                  </Link>
                  {goal.phase === "Not Started" && (
                    <button
                      onClick={() => handleStartGoal(goal._id)}
                      className="mt-2 bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700"
                    >
                      Start Goal
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 hover:bg-red-700 transition"
                    title="Delete Goal"
                  >
                    &#10005;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
