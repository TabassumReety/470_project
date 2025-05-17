"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateToDoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    workName: "",
    time: "",
    otherMemberName: "",
    type: "personal",
    other: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          otherMemberName: form.otherMemberName.split(",").map((name) => name.trim()),
        }),
      });

      if (!res.ok) throw new Error("Failed to create ToDo");

      router.push("/toDo");
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Create ToDo Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Work Name</label>
          <input
            type="text"
            name="workName"
            value={form.workName}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="datetime-local"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other Member Names (comma-separated)</label>
          <input
            type="text"
            name="otherMemberName"
            value={form.otherMemberName}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          >
            <option value="personal">Personal</option>
            <option value="group">Group</option>
            <option value="academic">Academic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other</label>
          <input
            type="text"
            name="other"
            value={form.other}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Create ToDo
        </button>
      </form>
    </div>
  );
}
