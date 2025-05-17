"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ToDoPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [editingTodo, setEditingTodo] = useState<any | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch("/api/todo");
        const data = await res.json();
        setTodos(data.todos || []);
      } catch (err) {
        console.error("Failed to fetch todos", err);
      }
    };

    fetchTodos();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/todo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });

      if (res.ok) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === id ? { ...todo, status: "done" } : todo
          )
        );
      } else {
        console.error("Failed to update todo status");
      }
    } catch (err) {
      console.error("Error updating todo status", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/todo/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
      } else {
        console.error("Failed to delete todo");
      }
    } catch (err) {
      console.error("Error deleting todo", err);
    }
  };

  const handleEdit = (todo: any) => {
    setEditingTodo(todo);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/todo/${editingTodo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTodo),
      });

      if (res.ok) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === editingTodo._id ? editingTodo : todo
          )
        );
        setEditingTodo(null);
      } else {
        console.error("Failed to update todo");
      }
    } catch (err) {
      console.error("Error updating todo", err);
    }
  };

  const filteredTodos = () => {
    if (filter === "completed") {
      return todos.filter((todo) => todo.status === "done");
    } else if (filter === "all") {
      return todos.filter((todo) => todo.status !== "done");
    } else if (filter === "day-wise") {
      return todos.reduce((acc: any, todo: any) => {
        const date = new Date(todo.time).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(todo);
        return acc;
      }, {});
    }
    return todos;
  };

  const renderTodos = () => {
    if (filter === "day-wise") {
      const groupedTodos = filteredTodos();
      return Object.keys(groupedTodos).map((date) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{date}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTodos[date].map((todo: any) => (
              <TodoCard key={todo._id} todo={todo} />
            ))}
          </div>
        </div>
      ));
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTodos().map((todo: any) => (
            <TodoCard key={todo._id} todo={todo} />
          ))}
        </div>
      );
    }
  };

  const TodoCard = ({ todo }: { todo: any }) => (
    <div
      className={`p-4 border rounded-lg shadow w-70 mb-8 ${
        todo.status === "done" ? "bg-green-100" : "bg-gray-50"
      }`}
    >
      <h3 className="text-xl font-bold text-gray-800">{todo.workName}</h3>
      <p className="text-gray-600 mt-2">Type: {todo.type}</p>
      <p className="text-gray-600 mt-1">
        Time: {new Date(todo.time).toLocaleString()}
      </p>
      <p className="text-gray-600 mt-1">
        Members: {todo.otherMemberName.join(", ") || "None"}
      </p>
      <p className="text-gray-600 mt-1">Other: {todo.other || "N/A"}</p>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => handleComplete(todo._id)}
          disabled={todo.status === "done"}
          className={`py-1 px-3 rounded-md text-sm ${
            todo.status === "done"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {todo.status === "done" ? "Completed" : "Complete"}
        </button>
        <button
          onClick={() => handleDelete(todo._id)}
          className="py-1 px-3 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
        <button
          onClick={() => handleEdit(todo)}
          className="py-1 px-3 rounded-md text-sm bg-yellow-500 text-white hover:bg-yellow-600"
        >
          Edit
        </button>
      </div>
    </div>
  );
    

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My ToDo List</h1>
        <Link
          href="/toDo/createList"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          ADD
        </Link>
      </div>

      <div className="flex justify-end mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border bg-amber-200 rounded-md px-4 py-2"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="day-wise">Day Wise</option>
        </select>
      </div>

      {editingTodo ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Work Name
            </label>
            <input
              type="text"
              value={editingTodo.workName}
              onChange={(e) =>
                setEditingTodo({ ...editingTodo, workName: e.target.value })
              }
              className="w-full border rounded-md px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              type="datetime-local"
              value={new Date(editingTodo.time)
                .toISOString()
                .slice(0, 16)}
              onChange={(e) =>
                setEditingTodo({ ...editingTodo, time: e.target.value })
              }
              className="w-full border rounded-md px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Members
            </label>
            <input
              type="text"
              value={editingTodo.otherMemberName.join(", ")}
              onChange={(e) =>
                setEditingTodo({
                  ...editingTodo,
                  otherMemberName: e.target.value.split(",").map((name) => name.trim()),
                })
              }
              className="w-full border rounded-md px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Other
            </label>
            <input
              type="text"
              value={editingTodo.other}
              onChange={(e) =>
                setEditingTodo({ ...editingTodo, other: e.target.value })
              }
              className="w-full border rounded-md px-4 py-2"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingTodo(null)}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        renderTodos()
      )}
    </div>
  );
}
