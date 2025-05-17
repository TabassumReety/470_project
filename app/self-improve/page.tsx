"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SelfImprovementPage() {
    const [goals, setGoals] = useState<any[]>([]);

    // Fetch the user's self-improvement goals
    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await fetch("/api/self_improve");
                const data = await res.json();
                setGoals(data.goals || []);
            } catch (err) {
                console.error("Failed to fetch goals", err);
            }
        };

        fetchGoals();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-4xl font-bold text-center text-purple-700">
                🌟 Self Improvement Goals 🌟
            </h1>

            {/* Add New Goal Button */}
            <div className="flex justify-center">
                <Link
                    href="/self-improve/add"
                    className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-full shadow-lg hover:opacity-90"
                >
                    + Add New Goal
                </Link>
            </div>

            {/* Goal Cards */}
            <div className="space-y-6">
                {goals.length > 0 ? (
                    goals.map((goal) => (
                        <div
                            key={goal._id}
                            className="p-6 border-2 border-purple-300 rounded-lg shadow-lg bg-gradient-to-r from-purple-100 to-pink-100 text-center"
                        >
                            <h3 className="text-2xl font-bold text-purple-800">{goal.skillName}</h3>
                            <p className="text-purple-600 mt-2">Sponsored by: {goal.sponsorBy}</p>
                            <p className="text-purple-500 mt-1">Duration: {goal.suggestiveTime} hours</p>
                            <button className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                                Enroll
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600">No goals found. Add one to get started!</p>
                )}
            </div>
        </div>
    );
}
