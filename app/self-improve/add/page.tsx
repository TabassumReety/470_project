"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddGoalPage() {
  const [form, setForm] = useState({
    skillName: "",
    subtopic: "",
    suggestiveTime: "",
    instructorName: "",
    sponsorBy: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/self_improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Goal added successfully!");
        router.push("/self-improvement"); // Redirect to the goals list
      } else {
        alert(data.message || "Failed to add goal");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Add Self Improvement Goal</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Skill Name</label>
          <input
            type="text"
            name="skillName"
            value={form.skillName}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subtopic</label>
          <input
            type="text"
            name="subtopic"
            value={form.subtopic}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Suggestive Time (hours)</label>
          <input
            type="number"
            name="suggestiveTime"
            value={form.suggestiveTime}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instructor Name</label>
          <input
            type="text"
            name="instructorName"
            value={form.instructorName}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sponsor By</label>
          <input
            type="text"
            name="sponsorBy"
            value={form.sponsorBy}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Add Goal
        </button>
      </form>
    </div>
  );
}
