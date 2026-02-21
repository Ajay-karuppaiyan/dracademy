import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/students");
        const data = await res.json();
        setStudents(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const result = students.filter(
      (s) =>
        s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, students]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / studentsPerPage);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    await fetch(`http://localhost:5000/api/students/${id}`, {
      method: "DELETE",
    });

    setStudents((prev) => prev.filter((s) => s._id !== id));
  };

  // ================= EXPORT =================
  const exportToExcel = () => {
    const data = students.map((s, i) => ({
      "S.No": i + 1,
      Name: s.user?.name,
      Email: s.user?.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Students.xlsx");
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    await fetch(`http://localhost:5000/api/students/${editStudent._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editStudent),
    });

    setStudents((prev) =>
      prev.map((s) =>
        s._id === editStudent._id ? editStudent : s
      )
    );

    setEditStudent(null);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      {/* SEARCH + EXPORT */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-center border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((s, i) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="p-3 border">
                  {(currentPage - 1) * studentsPerPage + i + 1}
                </td>
                <td className="p-3 border">{s.user?.name}</td>
                <td className="p-3 border">{s.user?.email}</td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    View
                  </button>
                  
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* VIEW MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-3">Student Details</h2>
            <p><strong>Name:</strong> {selectedStudent.user?.name}</p>
            <p><strong>Email:</strong> {selectedStudent.user?.email}</p>

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-4 bg-gray-500 text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-3">Edit Student</h2>

            <input
              type="text"
              value={editStudent.user?.name}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  user: { ...editStudent.user, name: e.target.value },
                })
              }
              className="border p-2 w-full mb-3"
            />

            <input
              type="email"
              value={editStudent.user?.email}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  user: { ...editStudent.user, email: e.target.value },
                })
              }
              className="border p-2 w-full mb-3"
            />

            <div className="flex justify-between">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Update
              </button>

              <button
                onClick={() => setEditStudent(null)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;