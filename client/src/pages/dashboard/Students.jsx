import React, { useEffect, useState } from "react";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH STUDENTS
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/students");
        const data = await res.json();

        if (res.ok) {
          setStudents(data);
        } else {
          console.error("Failed to fetch students");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // ✅ DELETE FUNCTION
  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/students/${studentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Student deleted successfully");

        // ✅ Remove from UI
        setStudents((prev) =>
          prev.filter((s) => s._id !== studentId)
        );
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-6 text-lg">Loading students...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Students List</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-center">S.no</th>
              <th className="p-3 border text-center">Name</th>
              <th className="p-3 border text-center">Email</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.length > 0 ? (
              students.map((s, i) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">{i + 1}</td>

                  {/* ✅ Access name from populated user */}
                  <td className="p-3 border text-center">
                    {s.user?.name || "N/A"}
                  </td>

                  {/* ✅ Access email from populated user */}
                  <td className="p-3 border text-center">
                    {s.user?.email || "N/A"}
                  </td>

                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
