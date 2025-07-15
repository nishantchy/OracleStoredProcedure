"use client";
import React, { useState } from "react";
import { api } from "../service/fetcher";
import { mutate } from "swr";
import { Payment } from "../types/Payments";

interface UpdatePaymentProps {
  payment: Payment;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdatePayment({
  payment,
  onClose,
  onUpdated,
}: UpdatePaymentProps) {
  const [form, setForm] = useState({
    amount: payment.amount.toString(),
    cheque_number: payment.cheque_number || "",
    paid_date: payment.paid_date ? payment.paid_date.slice(0, 10) : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.amount) {
      setError("Amount is required.");
      setLoading(false);
      return;
    }
    try {
      await api.put(`/payments/${payment.id}`, {
        amount: Number(form.amount),
        cheque_number: form.cheque_number,
        paid_date: form.paid_date,
      });
      mutate("/payments");
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update payment");
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
        <h2 className="text-lg font-bold mb-4">Update Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
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
            {loading ? "Updating..." : "Update Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
