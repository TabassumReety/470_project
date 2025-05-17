"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { label: "Self Improvement", href: "/self-improve" },
  { label: "setGoals", href: "/setGoal" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "ToDo", href: "/toDo" }, // Added ToDo button
  { label: "Invitation", href: "/dashboard/invitations" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          ReLife
        </Link>
        <div className="space-x-4 flex items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 ${
                pathname === item.href ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {isSignedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/signup"
              className={`text-sm font-medium hover:text-blue-600 ${
                pathname === "/signup" ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
