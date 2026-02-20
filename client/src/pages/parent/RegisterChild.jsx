import React, { useState } from "react";
import api from "../../services/api";
import { UserPlus, Loader2, Calendar, BookOpen, Mail, Phone, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const RegisterChild = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "",
        dob: "",
        gender: "Male",
        course: "Science",
        year: "1st Year"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/parent/register-child", formData);
            toast.success("Child registered successfully!");
            navigate("/dashboard/parent-dashboard");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to register child");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Register New Child</h1>

            <div className="bg-white p-8 rounded-xl shadow-sm border request-form">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Personal Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Student Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="dob"
                                        required
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Login & Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Login & Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Academic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course/Stream</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <select
                                        name="course"
                                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.course}
                                        onChange={handleChange}
                                    >
                                        <option value="Science">Science (PCM/PCB)</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts/Humanities</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year/Grade</label>
                                <select
                                    name="year"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.year}
                                    onChange={handleChange}
                                >
                                    <option value="1st Year">1st Year / 11th</option>
                                    <option value="2nd Year">2nd Year / 12th</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/parent-dashboard")}
                            className="px-6 py-2 rounded-lg border hover:bg-gray-50 text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                            Register Child
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterChild;
