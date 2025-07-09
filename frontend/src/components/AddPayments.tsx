"use client";
import React, { useState, useEffect } from "react";
import { api } from "../service/fetcher";
import { mutate } from "swr";
import { Student } from "../types/Students";

export default function AddPayments() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    cheque_number: "",
    paid_date: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("/students").then((res) => setStudents(res.data.results || []));
    }
  }, [open]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.student_id || !form.amount) {
      setError("Student and amount are required.");
      setLoading(false);
      return;
    }
    try {
      await api.post("/payments", {
        ...form,
        student_id: Number(form.student_id),
        amount: Number(form.amount),
      });
      setOpen(false);
      setForm({ student_id: "", amount: "", cheque_number: "", paid_date: "" });
      mutate("/payments");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add payment");
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
        Add New Payment
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
            <h2 className="text-lg font-bold mb-4">Add New Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Student</label>
                <select
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Cheque Number</label>
                <input
                  type="text"
                  name="cheque_number"
                  value={form.cheque_number}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Paid Date</label>
                <input
                  type="date"
                  name="paid_date"
                  value={form.paid_date}
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
                {loading ? "Adding..." : "Add Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
