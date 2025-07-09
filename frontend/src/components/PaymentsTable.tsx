"use client";
import React, { useState } from "react";
import { usePayments } from "../service/queries";

export default function PaymentsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, error, isLoading } = usePayments({ search, page, pageSize });

  const total = data?.total || 0;
  const payments = data?.results || [];
  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  return (
    <div className="overflow-x-auto">
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 mb-4"
        autoComplete="off"
      >
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <button
          type="submit"
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        >
          Search
        </button>
      </form>
      {isLoading ? (
        <div>Loading payments...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load payments.</div>
      ) : payments.length === 0 ? (
        <div>No payments found.</div>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">S.N</th>
                <th className="px-4 py-2 text-left">Student Name</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Cheque Number</th>
                <th className="px-4 py-2 text-left">Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr
                  key={`${payment.student_id}-${payment.amount}-${
                    payment.paid_date || ""
                  }-${idx}`}
                  className="border-t"
                >
                  <td className="px-4 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-2">{payment.student_name}</td>
                  <td className="px-4 py-2">{payment.amount}</td>
                  <td className="px-4 py-2">{payment.cheque_number || "-"}</td>
                  <td className="px-4 py-2">{payment.paid_date || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages} ({total} payments)
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
