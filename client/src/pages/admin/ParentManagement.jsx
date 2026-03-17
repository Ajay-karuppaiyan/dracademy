import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { UserPlus, Check, Loader2, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: ""
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch all parents
  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      const res = await api.get("/parent/parents");
      setParents(res.data);
    } catch (err) {
      toast.error("Failed to fetch parents");
    } finally {
      setLoadingParents(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Handle parent creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register-parent", formData);
      toast.success("Parent account created successfully!");
      setFormData({ name: "", email: "", password: "", mobile: "" });
      setShowForm(false);
      fetchParents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create parent");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete parent
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parent?")) return;

    try {
      await api.delete(`/parent/parent/${id}`);
      toast.success("Parent deleted successfully");
      setParents((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete parent");
    }
  };

  // Fetch children by parent id
  const fetchChildren = async (parentId) => {
    try {
      const res = await api.get(`/parent/parent/${parentId}`);
      setSelectedChildren(res.data || []);
      setShowChildrenModal(true);
    } catch (err) {
      toast.error("Failed to fetch children");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parent Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <UserPlus size={20} /> Add Parent
        </button>
      </div>

      {/* Parent Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                Create Parent Account
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Parents Table */}
      {!showForm && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">S.no</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Mobile</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingParents ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">Loading...</td>
                </tr>
              ) : parents.length > 0 ? (
                parents.map((p, i) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="p-3 border">{i + 1}</td>
                    <td className="p-3 border">{p.name}</td>
                    <td className="p-3 border">{p.email}</td>
                    <td className="p-3 border">{p.mobile || "N/A"}</td>
                    <td className="p-3 border flex justify-center gap-2">

                      {/* View Children Icon */}
                      <button
                        onClick={() => fetchChildren(p._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        title="View Children" 
                      >
                        <Users size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center">No parents found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Children Modal */}
      {showChildrenModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setShowChildrenModal(false)}
        >
          <div
            className="bg-white rounded w-full max-w-4xl max-h-[80vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Children Details</h2>
              <button
                onClick={() => setShowChildrenModal(false)}
                className="text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {selectedChildren.length === 0 ? (
              <p>No children found for this parent.</p>
            ) : (
              <table className="min-w-full border text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">S.no</th>
                    <th className="p-2 border">Child Name</th>
                    <th className="p-2 border">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChildren.map((child, index) => (
                    <tr key={child._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{child.studentNameEnglish}</td>
                      <td className="p-2 border">{child.age || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentManagement;