"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import React from "react";

// Hook for detecting outside clicks (in case you add modals/menus later)
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: Function
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-100 to-red-200 p-8">
      <div className="text-center max-w-xl">
        <h1 className="text-7xl font-bold text-purple-700 mb-4">RELIFE</h1>
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6">
          Organize Your Life, One Task at a Time
        </h2>
        <p className="text-lg text-gray-700 mb-10">
          Welcome to your all-in-one platform for managing academic and
          non-academic goals. Plan smart. Track better. Achieve more.
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push("/sign-in")}
            className="bg-white text-purple-700 font-semibold py-3 px-6 rounded-xl shadow hover:bg-gray-100 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/get-started")}
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-green-700 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}
