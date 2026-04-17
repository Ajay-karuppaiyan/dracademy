import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, Briefcase, Mail, Phone, MapPin, Building, Globe } from "lucide-react";
import Loading from "../../components/Loading";

import CustomDataTable from "../../components/DataTable";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    contactPerson: "",
    mobile: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    website: "",
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/vendors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setVendors(res.data);
    } catch (error) {
      toast.error("Failed to fetch vendors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            mobile: formData.mobile,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
            },
            website: formData.website,
        };

      await axios.post("http://localhost:5000/api/vendors", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Vendor created successfully");
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        companyName: "",
        contactPerson: "",
        mobile: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        website: "",
      });
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating vendor");
      console.error(error);
    }
  };

  const filteredVendors = Array.isArray(vendors) ? vendors.filter(vendor => 
    vendor.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(search.toLowerCase()) ||
    vendor.contactPerson?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      sortable: true,
      width: '100px',
      cell: (row, index) => (
        <span className="font-semibold text-slate-800">{index + 1}</span>
      )    
    },
    {
      name: 'Company Name',
      selector: row => row.companyName,
      sortable: true,
      cell: row => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
            {row.companyName?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.companyName}</div>
            <div className="text-xs text-slate-500">{row.website}</div>
          </div>
        </div>
      ),
      width: '250px',
    },
    {
      name: 'Contact Person',
      selector: row => row.contactPerson,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-medium text-slate-700">{row.contactPerson}</div>
          <div className="text-xs text-slate-500">{row.mobile}</div>
        </div>
      ),
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Location',
      selector: row => row.address?.city,
      sortable: true,
      cell: row => (
        <div className="text-sm">
          {row.address?.city}, {row.address?.state}
        </div>
      ),
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          row.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {row.status}
        </span>
      ),
      width: '100px',
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Vendor Management
          </h1>
          <p className="text-slate-500 mt-1">Manage external vendors and internship partners</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/30"
        >
          <Plus size={20} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendors Table */}
      <CustomDataTable
        columns={columns}
        data={filteredVendors}
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search vendors by name, email, or contact person..."
      />

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold font-heading text-slate-800">
                Register New Vendor
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Account Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            User Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Login Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password (Optional)
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Default: Vendor@123"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Company Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            name="companyName"
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={formData.companyName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contact Person
                        </label>
                        <input
                            type="text"
                            name="contactPerson"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Mobile No.
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={formData.mobile}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="space-y-4 col-span-full">
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mt-2 mb-2">Address & Extra</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                            <input
                                type="text"
                                name="street"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={formData.street}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={formData.state}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                            <input
                                type="url"
                                name="website"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={formData.website}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-sm shadow-brand-500/30 transition-all"
                >
                  Create Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
