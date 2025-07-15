"use client";
import React, { useState } from "react";
import { api } from "../service/fetcher";
import { mutate } from "swr";
import { Student } from "../types/Students";

interface DeleteStudentProps {
  student: Student;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteStudent({
  student,
  onClose,
  onDeleted,
}: DeleteStudentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/students/${student.id}`);
      mutate("/students");
      onDeleted();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
      <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Delete Student</h2>
        <p className="mb-4">
          Are you sure you want to delete <b>{student.full_name}</b>?
        </p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
