import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { UserPlus, Check, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(true);

  const [showForm, setShowForm] = useState(false); // toggle form visibility

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
    fetchParents(); // fetch parents on mount
  }, []);

  // Handle parent creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register-parent", formData);
      toast.success("Parent account created successfully!");
      setFormData({ name: "", email: "", password: "", mobile: "" });
      setShowForm(false); // hide form after submit
      fetchParents(); // refresh table
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
      await api.delete(`/auth/parents/${id}`);
      toast.success("Parent deleted successfully");
      setParents((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error("Failed to delete parent");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parent Management</h1>
        <button
          onClick={() => setShowForm(true)} // show form, hide table
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
                onClick={() => setShowForm(false)} // cancel button
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Parents Table: show only if form is not active */}
      {!showForm && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">#</th>
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
                    <td className="p-3 border">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
    </div>
  );
};

export default ParentManagement;
