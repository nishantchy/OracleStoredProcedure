import AddStudents from "@/components/AddStudents";
import StudentsTable from "@/components/StudentsTable";

export default function StudentsPage() {
  return (
    <div className="py-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Students</h1>
        <AddStudents />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <StudentsTable />
      </div>
    </div>
  );
}
