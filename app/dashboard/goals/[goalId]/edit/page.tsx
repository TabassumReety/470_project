"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditGoalPage() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    type: "",
    weeks: "",
    subGoalType: "",
    dailyHours: "",
    weeklyHours: "",
    weeksData: [] as any[], // Ensuring this is always an array for weeks data
  });

  const router = useRouter();
  const params = useParams();
  const goalId =
    params && typeof params["goalId"] === "string"
      ? params["goalId"]
      : Array.isArray(params?.["goalId"])
      ? params?.["goalId"][0]
      : "";

  // Fetching the goal data when the component mounts
  useEffect(() => {
    const fetchGoalData = async () => {
      if (goalId) {
        try {
          const res = await fetch(`/api/get_goal/${goalId}`);
          const data = await res.json();

          if (res.ok) {
            setForm({
              title: data.title || "",
              category: data.category || "",
              type: data.type || "",
              weeks: data.weeks || "",
              subGoalType: data.subGoalType || "",
              dailyHours: data.dailyHours || "",
              weeklyHours: data.weeklyHours || "",
              weeksData: data.weeksData || [], // Ensuring weeksData is initialized
            });
          } else {
            alert(data.message || "Failed to fetch goal data");
          }
        } catch (err) {
          console.error("Error fetching goal data", err);
          alert("Something went wrong!");
        }
      }
    };

    fetchGoalData();
  }, [goalId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle changes for weeks data (both subGoalTitle and hoursPlanned)
  const handleWeeksDataChange = (
    weekIndex: number,
    field: string,
    value: string | number
  ) => {
    const updatedWeeksData = [...form.weeksData];

    if (!updatedWeeksData[weekIndex]) {
      updatedWeeksData[weekIndex] = {};
    }

    updatedWeeksData[weekIndex][field] = value;

    setForm({ ...form, weeksData: updatedWeeksData });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/set_goal/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          weeksData: form.weeksData.map((week, index) => ({
            weekNumber: index + 1,
            subGoalTitle: week.subGoalTitle || "",
            hoursPlanned: Number(week.hoursPlanned) || 0,
            status: week.status || "Not Started",
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Goal updated successfully!");
        router.push(`/dashboard/goals/${goalId}`);
      } else {
        alert(data.message || "Failed to update goal");
      }
    } catch (err) {
      console.error("Error updating goal", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Edit Self Improvement Goal</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={form.category || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <input
            type="text"
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weeks to complete</label>
          <input
            type="number"
            name="weeks"
            value={form.weeks || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sub-Goal Type</label>
          <select
            name="subGoalType"
            value={form.subGoalType || ""}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>

        {form.subGoalType === "Daily" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Hours</label>
            <input
              type="number"
              name="dailyHours"
              value={form.dailyHours || ""}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2"
              required
            />
          </div>
        )}

        {form.subGoalType === "Weekly" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Weekly Hours</label>
            <input
              type="number"
              name="weeklyHours"
              value={form.weeklyHours || ""}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2"
              required
            />
          </div>
        )}

        {/* Week Data (sub-goals) */}
        <div className="space-y-4">
          {/* Generate dynamic input for each week */}
          {Array.from({ length: Number(form.weeks) }, (_, weekIndex) => (
            <div key={weekIndex}>
              <h3 className="text-lg font-medium text-gray-700">Week {weekIndex + 1}</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  name="subGoalTitle"
                  placeholder={`Sub-goal for Week ${weekIndex + 1}`}
                  value={form.weeksData[weekIndex]?.subGoalTitle || ""}
                  onChange={(e) =>
                    handleWeeksDataChange(weekIndex, "subGoalTitle", e.target.value)
                  }
                  className="w-full border rounded-md px-4 py-2"
                />
                <input
                  type="number"
                  name="hoursPlanned"
                  value={form.weeksData[weekIndex]?.hoursPlanned || ""}
                  onChange={(e) =>
                    handleWeeksDataChange(weekIndex, "hoursPlanned", Number(e.target.value))
                  }
                  className="w-full border rounded-md px-4 py-2"
                  placeholder="Hours planned"
                />
                <select
                  name="status"
                  value={form.weeksData[weekIndex]?.status || "Not Started"}
                  onChange={(e) =>
                    handleWeeksDataChange(weekIndex, "status", e.target.value)
                  }
                  className="w-full border rounded-md px-4 py-2"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Update Goal
        </button>
      </form>
    </div>
  );
}
