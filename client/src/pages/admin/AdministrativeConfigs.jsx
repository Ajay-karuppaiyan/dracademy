import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Building2,
  UserCheck,
  Briefcase,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AdministrativeConfigs = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
  });

  const config = {
    departments: {
      title: "Departments",
      endpoint: "/departments",
      icon: <Building2 size={20} />,
    },
    roles: {
      title: "Roles",
      endpoint: "/roles",
      icon: <UserCheck size={20} />,
    },
    designations: {
      title: "Designations",
      endpoint: "/designations",
      icon: <Briefcase size={20} />,
    },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(config[activeTab].endpoint);
      setData(data);
    } catch {
      toast.error(`Error fetching ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`,
      )
    ) {
      try {
        await api.delete(`${config[activeTab].endpoint}/${id}`);
        setData(data.filter((item) => item._id !== id));
        toast.success(`${config[activeTab].title.slice(0, -1)} deleted`);
      } catch {
        toast.error(`Error deleting ${activeTab}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      name: toTitleCase(formData.name.trim()),
    };

    try {
      if (isEditing) {
        const { data: updatedItem } = await api.put(
          `${config[activeTab].endpoint}/${currentId}`,
          formattedData,
        );
        setData(
          data.map((item) => (item._id === currentId ? updatedItem : item)),
        );
        toast.success(`${config[activeTab].title.slice(0, -1)} updated`);
      } else {
        const { data: newItem } = await api.post(
          config[activeTab].endpoint,
          formattedData,
        );
        setData([...data, newItem]);
        toast.success(`${config[activeTab].title.slice(0, -1)} created`);
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || `Error saving ${activeTab}`);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({ name: item.name });
      setIsEditing(true);
      setCurrentId(item._id);
    } else {
      setFormData({ name: "" });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Administrative Configs
          </h1>
          <p className="text-sm text-gray-500">
            Manage departments, roles, and designations
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Add {config[activeTab].title.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8">
        {Object.keys(config).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-brand-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {config[tab].icon}
              {config[tab].title}
            </div>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  SL No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {config[activeTab].title.slice(0, -1)} Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
                          {config[activeTab].icon}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(item)}
                        className="text-brand-600 hover:text-brand-900 mr-4 p-1 rounded-md hover:bg-brand-50 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No {activeTab} found. Click the button above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl scale-in-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                {config[activeTab].icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing
                  ? `Edit ${config[activeTab].title.slice(0, -1)}`
                  : `Create ${config[activeTab].title.slice(0, -1)}`}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {config[activeTab].title.slice(0, -1)} Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3"
                  placeholder={`Enter ${activeTab.slice(0, -1)} name...`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 shadow-md shadow-brand-200 transition-all hover:scale-[1.02]"
                >
                  {isEditing
                    ? "Save Changes"
                    : `Add ${config[activeTab].title.slice(0, -1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrativeConfigs;
