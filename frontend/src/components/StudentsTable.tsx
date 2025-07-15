"use client";
import React, { useState } from "react";
import { useStudents } from "../service/queries";
import { mutate } from "swr";
import UpdateStudent from "./UpdateStudent";
import DeleteStudent from "./DeleteStudent";
import { Student } from "../types/Students";

export default function StudentsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const { data, error, isLoading } = useStudents({ search, page, pageSize });

  const total = data?.total || 0;
  const students = data?.results || [];
  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function handleRefresh() {
    mutate(
      `/students?search=${encodeURIComponent(
        search
      )}&page=${page}&page_size=${pageSize}`
    );
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
          placeholder="Search by name or email..."
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
        <button
          type="button"
          onClick={handleRefresh}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 border"
        >
          Refresh
        </button>
      </form>
      {isLoading ? (
        <div>Loading students...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load students.</div>
      ) : students.length === 0 ? (
        <div>No students found.</div>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">S.N</th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Gender</th>
                <th className="px-4 py-2 text-left">Date of Birth</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id} className="border-t">
                  <td className="px-4 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-2">{student.full_name}</td>
                  <td className="px-4 py-2">{student.email}</td>
                  <td className="px-4 py-2">{student.phone || "-"}</td>
                  <td className="px-4 py-2 capitalize">{student.gender}</td>
                  <td className="px-4 py-2">{student.date_of_birth || "-"}</td>
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
                            setSelectedStudent(student);
                            setShowUpdate(true);
                            setDropdownOpen(null);
                          }}
                        >
                          Update
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => {
                            setSelectedStudent(student);
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
              Showing page {page} of {totalPages} ({total} students)
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
      {showUpdate && selectedStudent && (
        <UpdateStudent
          student={selectedStudent}
          onClose={() => setShowUpdate(false)}
          onUpdated={() => setSelectedStudent(null)}
        />
      )}
      {showDelete && selectedStudent && (
        <DeleteStudent
          student={selectedStudent}
          onClose={() => setShowDelete(false)}
          onDeleted={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
