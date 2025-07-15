"use client";
import React, { useState } from "react";
import { usePayments } from "../service/queries";
import { Payment } from "../types/Payments";

// Placeholder imports for future UpdatePayment and DeletePayment components
import UpdatePayment from "./UpdatePayment";
import DeletePayment from "./DeletePayment";

export default function PaymentsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

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
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr
                  key={
                    payment.id ||
                    `${payment.student_id}-${payment.amount}-${
                      payment.paid_date || ""
                    }-${idx}`
                  }
                  className="border-t"
                >
                  <td className="px-4 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-2">{payment.student_name}</td>
                  <td className="px-4 py-2">{payment.amount}</td>
                  <td className="px-4 py-2">{payment.cheque_number || "-"}</td>
                  <td className="px-4 py-2">{payment.paid_date || "-"}</td>
                  <td className="px-4 py-2 relative">
                    <button
                      className="px-2 py-1 rounded hover:bg-gray-100"
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === idx ? null : idx)
                      }
                      aria-label="Actions"
                    >
                      <span style={{ fontSize: 20 }}>⋯</span>
                    </button>
                    {dropdownOpen === idx && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowUpdate(true);
                            setDropdownOpen(null);
                          }}
                        >
                          Update
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDelete(true);
                            setDropdownOpen(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
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
      {/* Modals for update and delete */}
      {showUpdate && selectedPayment && (
        <UpdatePayment
          payment={selectedPayment}
          onClose={() => setShowUpdate(false)}
          onUpdated={() => setSelectedPayment(null)}
        />
      )}
      {showDelete && selectedPayment && (
        <DeletePayment
          payment={selectedPayment}
          onClose={() => setShowDelete(false)}
          onDeleted={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
