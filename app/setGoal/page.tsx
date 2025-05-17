"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetGoalPage() {
  const [form, setForm] = useState({
    category: "Academic",
    type: "Single",
    title: "",
    weeks: 0,
    subGoalType: "Daily",
    dailyHours: "",
    weeklyHours: 1,
    weeksData: [{ weekNumber: 1, subGoalTitle: "", hoursPlanned: 1 }],
    coWorkers: [] as { email: string }[],
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const [coWorkerEmail, setCoWorkerEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "weeks") {
      const weeks = Number(value);
      setForm(prev => ({
        ...prev,
        [name]: weeks,
        weeksData: Array.from({ length: weeks }, (_, i) => ({
          weekNumber: i + 1,
          subGoalTitle: "",
          hoursPlanned: 1,
        })),
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleWeeksDataChange = (index: number, key: string, value: string | number) => {
    const updated = [...form.weeksData];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, weeksData: updated });
  };

  // Add coworker to list
  const handleAddCoWorker = () => {
    if (coWorkerEmail && !form.coWorkers.some(cw => cw.email === coWorkerEmail)) {
      setForm(prev => ({
        ...prev,
        coWorkers: [...prev.coWorkers, { email: coWorkerEmail }],
      }));
      setCoWorkerEmail("");
    }
  };

  // Remove coworker from list
  const handleRemoveCoWorker = (email: string) => {
    setForm(prev => ({
      ...prev,
      coWorkers: prev.coWorkers.filter(cw => cw.email !== email),
    }));
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate weeksData
    for (const week of form.weeksData) {
      if (!week.subGoalTitle || week.hoursPlanned <= 0) {
        alert("Please fill out all sub-goal titles and ensure hours planned are greater than 0.");
        return;
      }
    }

    // Ensure numeric values for hours
    const formattedForm = {
      ...form,
      dailyHours: form.dailyHours ? Number(form.dailyHours) : undefined,
      weeklyHours: form.weeklyHours ? Number(form.weeklyHours) : undefined,
      coWorkers: form.coWorkers,
    };

    setLoading(true); // Set loading state
    try {
      const response = await fetch("/api/set_goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedForm),
      });

      if (!response.ok) {
        throw new Error("Failed to create goal. Please try again.");
      }

      const result = await response.json();
      console.log("Goal created successfully:", result);

      // Automatically send invitations to coworkers (if any)
      if (form.coWorkers && form.coWorkers.length > 0 && result.goal && result.goal._id) {
        for (const coworker of form.coWorkers) {
          await fetch("/api/invite-coworker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: coworker.email,
              goal: {
                _id: result.goal._id,
                title: form.title,
                category: form.category,
                type: form.type,
                weeks: form.weeks,
                subGoalType: form.subGoalType,
                dailyHours: form.dailyHours,
                weeklyHours: form.weeklyHours,
                weeksData: form.weeksData,
              },
            }),
          });
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("An error occurred while creating the goal. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-200">Set Your New Goal</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 space-y-6">
        {/* Basic Fields */}
        <select name="category" value={form.category} onChange={handleChange} className="w-full border px-4 py-2 rounded-md text-black">
          <option value="Academic">Academic</option>
          <option value="Non-Academic">Non-Academic</option>
        </select>

        <select name="type" value={form.type} onChange={handleChange} className="w-full border px-4 py-2 rounded-md text-black">
          <option value="Single">Single</option>
          <option value="Group">Group Work</option>
        </select>

        <input type="text" name="title" placeholder="Goal Title" value={form.title} onChange={handleChange} required className="w-full border px-4 py-2 rounded-md text-black" />

        <input type="number" name="weeks" placeholder="weeks to complete" value={form.weeks} onChange={handleChange} required className="w-full border px-4 py-2 rounded-md text-black" />

        <select name="subGoalType" value={form.subGoalType} onChange={handleChange} className="w-full border px-4 py-2 rounded-md text-black">
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
        </select>

        {form.subGoalType === "Daily" ? (
          <input type="number" name="dailyHours" placeholder="daily hours on this task" value={form.dailyHours} onChange={handleChange} className="w-full border px-4 py-2 rounded-md text-black" />
        ) : (
          <input type="number" name="weeklyHours" placeholder="weekly hours on this task" value={form.weeklyHours} onChange={handleChange} className="w-full border px-4 py-2 rounded-md text-black" />
        )}

        {/* Weeks Data Subgoals */}
        {form.weeksData.map((week, index) => (
          <div key={index} className="p-4 border rounded-md bg-gray-50 text-black">
            <label className="block font-semibold mb-1">Week {index + 1}</label>
            <input
              type="text"
              placeholder="Sub-goal title"
              value={week.subGoalTitle}
              onChange={(e) => handleWeeksDataChange(index, "subGoalTitle", e.target.value)}
              className="w-full mb-2 border px-3 py-1 rounded-md text-black"
            />
            <input
              type="number"
              placeholder="Hours planned"
              value={week.hoursPlanned}
              min={1}
              onChange={(e) => handleWeeksDataChange(index, "hoursPlanned", Number(e.target.value))}
              className="w-full border px-3 py-1 rounded-md text-black"
            />
          </div>
        ))}

        {/* Coworker Invitation Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Add Coworker (email)</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={coWorkerEmail}
              onChange={e => setCoWorkerEmail(e.target.value)}
              className="border px-4 py-2 rounded-md text-black flex-1"
              placeholder="Enter coworker email"
            />
            <button
              type="button"
              onClick={handleAddCoWorker}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add
            </button>
          </div>
          <ul className="mt-2">
            {form.coWorkers.map((cw, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span>{cw.email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCoWorker(cw.email)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading} // Disable button when loading
        >
          {loading ? "Submitting..." : "Set Goal"}
        </button>
      </form>
    </div>
  );
}
