"use client";
import React, { useState } from "react";
import { api } from "../service/fetcher";
import { mutate } from "swr";

export default function AddStudents() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "male",
    date_of_birth: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Basic validation
    if (!form.full_name || !form.email || !form.gender) {
      setError("Full name, email, and gender are required.");
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Invalid email address.");
      setLoading(false);
      return;
    }
    try {
      await api.post("/students", form);
      setOpen(false);
      setForm({
        full_name: "",
        email: "",
        phone: "",
        gender: "male",
        date_of_birth: "",
      });
      mutate("/students");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        onClick={() => setOpen(true)}
      >
        Add New Student
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px] relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 w-full"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Student"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
