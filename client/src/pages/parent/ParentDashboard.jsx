import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Loader2, User, BookOpen, Clock, CreditCard, Award, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    // Fetch linked children on mount
    useEffect(() => {
        fetchChildren();
    }, []);

    // Fetch overview when a child is selected
    useEffect(() => {
        if (selectedChild) {
            fetchOverview(selectedChild._id);
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            const res = await api.get("/parent/children");
            setChildren(res.data);
            if (res.data.length > 0) {
                setSelectedChild(res.data[0]); 
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOverview = async (studentId) => {
        setLoading(true);
        try {
            const res = await api.get(`/parent/child/${studentId}/overview`);
            setOverview(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !children.length) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 h-screen flex flex-col justify-center items-center">
                <h2 className="text-xl font-bold text-gray-700 mb-2">No students linked to this parent account.</h2>
                <p className="text-gray-500 mb-6">Register your child to get started.</p>

                <a
                    href="/dashboard/parent/register-child"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition mb-4"
                >
                    <span className="text-xl font-bold">+</span> Register New Child
                </a>

                <button onClick={logout} className="text-red-500 underline text-sm">Logout</button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
                    <p className="text-gray-600 text-sm">Monitor your child's progress</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Child Selector */}
                    <div className="flex gap-2">
                        {children.map(child => (
                            <button
                                key={child._id}
                                onClick={() => setSelectedChild(child)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChild?._id === child._id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {child.firstName}
                            </button>
                        ))}
                        {/* Register New Child Button */}
                        <a
                            href="/dashboard/parent/register-child"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            <span className="text-xl font-bold">+</span> New
                        </a>
                    </div>
                    <button onClick={logout} className="text-red-500 hover:bg-red-50 p-2 rounded-full" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {overview ? (
                <div className="space-y-6">
                    {/* Student Profile Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{overview.student.name}</h2>
                            <p className="text-gray-500">ID: {overview.student.id} | Class: {overview.student.class}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Attendance Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 text-purple-600">
                                <Clock size={20} />
                                <h3 className="font-semibold">Attendance</h3>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">{overview.attendance.percentage}%</div>
                            <p className="text-sm text-gray-500">
                                Present: {overview.attendance.presentDays}/{overview.attendance.totalDays} days
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${overview.attendance.percentage}%` }}></div>
                            </div>
                        </div>

                        {/* Fees Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 text-green-600">
                                <CreditCard size={20} />
                                <h3 className="font-semibold">Fees Due</h3>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">₹ {overview.fees.pending.toLocaleString()}</div>
                            <p className="text-sm text-gray-500">
                                Status: <span className={`font-medium ${overview.fees.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>{overview.fees.status}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Next Due: {overview.fees.nextDueDate}</p>
                        </div>

                        {/* Grades Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border md:col-span-2 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                <BookOpen size={20} />
                                <h3 className="font-semibold">Recent Performance</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {overview.grades.map((g, idx) => (
                                    <div key={idx} className="bg-indigo-50 p-3 rounded-lg text-center">
                                        <div className="text-sm font-medium text-gray-500">{g.subject}</div>
                                        <div className="text-2xl font-bold text-indigo-700">{g.grade}</div>
                                        <div className="text-xs text-gray-500">{g.score}/100</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Certificates & Remarks */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4 text-yellow-600">
                            <Award size={20} />
                            <h3 className="font-semibold">Certificates & Achievements</h3>
                        </div>
                        {overview.certificates.length > 0 ? (
                            <ul className="space-y-2">
                                {overview.certificates.map((cert, idx) => (
                                    <li key={idx} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg text-sm border border-yellow-100">
                                        <span className="font-medium text-gray-800">{cert.name}</span>
                                        <span className="text-gray-500">{cert.date}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No recent certificates issued.</p>
                        )}
                    </div>

                </div>
            ) : (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
