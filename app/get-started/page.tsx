"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
	const router = useRouter();
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/sign-up", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(form),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.message || "Something went wrong");
				setLoading(false);
				return;
			}

			
			router.push("/dashboard");
		} catch (err) {
			console.error("Signup failed:", err);
			setError("Something went wrong. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-red-200 px-4">
			<div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
				<h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
					Create Your Account
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-600">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							required
							className="mt-1 w-full text-gray-900 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-600">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							required
							className="mt-1 text-gray-900 w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-600">
							Password
						</label>
						<input
							type="password"
							name="password"
							value={form.password}
							onChange={handleChange}
							required
							className="mt-1 text-gray-900 w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{error && (
						<p className="text-red-500 text-sm text-center">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
					>
						{loading ? "Creating account..." : "Sign Up"}
					</button>
				</form>

				<p className="text-sm text-gray-600 text-center mt-4">
					Already have an account?{" "}
					<button
						className="text-blue-600 hover:underline"
						onClick={() => router.push("/sign-in")}
					>
						Sign In
					</button>
				</p>
			</div>
		</main>
	);
}
