import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Building2,
  UserCheck,
  Briefcase,
  MapPin,
  Key,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import CustomDataTable from "../../components/DataTable";

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
    location: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Login Management State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSavingLogin, setIsSavingLogin] = useState(false);

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
    centers: {
      title: "Centers",
      endpoint: "/centers",
      icon: <MapPin size={20} />,
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
      setFormData({
        name: item.name || "",
        location: item.location || "",
        description: item.description || "",
      });
      setIsEditing(true);
      setCurrentId(item._id);
    } else {
      setFormData({
        name: "",
        location: "",
        description: "",
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
  };

  const openLoginModal = async (center) => {
    setCurrentId(center._id);
    setLoginData({ name: center.name, email: "", password: "" });
    try {
      const { data } = await api.get(`/centers/${center._id}/login`);
      if (data) {
        setLoginData({
          name: data.name || center.name,
          email: data.email || "",
          password: "", // Don't show password
        });
      }
    } catch (error) {
      console.error("Error fetching login:", error);
    }
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSavingLogin(true);
    try {
      await api.post(`/centers/${currentId}/login`, loginData);
      toast.success("Center login saved successfully");
      setShowLoginModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving login");
    } finally {
      setIsSavingLogin(false);
    }
  };

const columns = [
  { name: "S.No", selector: (r, i) => i + 1, width: "70px", center: true },

  {
    name: `${config[activeTab].title.slice(0, -1)} Name`,
    selector: r => r.name,
    sortable: true,
    cell: r => (
      <div className="flex items-center">
        <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
          {config[activeTab].icon}
        </div>
        <div className="ml-3 font-medium text-gray-900">{r.name}</div>
      </div>
    )
  },
  ...(activeTab === "centers"
    ? [
        {
          name: "Location",
          selector: r => r.location,
          sortable: true,
          cell: r => (
            <span className="text-gray-500">
              {r.location || "N/A"}
            </span>
          ),
        },
      ]
    : []),

  {
    name: "Actions",
    center: true,
    width: "140px",
    cell: r => (
      <div className="flex justify-center gap-2">
        {activeTab === "centers" && (
          <button onClick={() => openLoginModal(r)} className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50">
            <Key size={18} />
          </button>
        )}
        <button onClick={() => openModal(r)} className="text-brand-600 hover:text-brand-900 p-2 rounded-lg hover:bg-brand-50">
          <Edit size={18} />
        </button>
        <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
          <Trash2 size={18} />
        </button>
      </div>
    )
  }
];

  const filteredData = data.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Administrative Configs
          </h1>
          <p className="text-sm text-gray-500">
            Manage departments, roles, designations, and centers
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
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === tab
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden pb-4">
        <CustomDataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          search={searchQuery}
          setSearch={setSearchQuery}
          searchPlaceholder={`Search ${config[activeTab].title.toLowerCase()}...`}
        />
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

              {activeTab === "centers" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-gray-200 p-3"
                      placeholder="Enter location..."
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-gray-200 p-3"
                      placeholder="Enter description..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl scale-in-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Key size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Manage Center Login</h2>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3"
                  value={loginData.name}
                  onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password {loginData.email && "(Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-gray-200 p-3"
                  placeholder="Enter new password..."
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLogin}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
                >
                  {isSavingLogin ? "Saving..." : "Save Login Details"}
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
