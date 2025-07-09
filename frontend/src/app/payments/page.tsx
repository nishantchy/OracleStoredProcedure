import React from "react";
import AddPayments from "@/components/AddPayments";
import PaymentsTable from "@/components/PaymentsTable";

export default function PaymentsPage() {
  return (
    <div className="py-10 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <AddPayments />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <PaymentsTable />
      </div>
    </div>
  );
}
