import React from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Award,
  FileText,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth(); // Assuming useAuth provides a user object with a 'role' and 'name'

  if (user && user.role === "student") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Student Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {user.name || "Student"}. Here's your progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Enrolled
            </span>
            <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20">
              View Courses
            </button>
          </div>
        </div>

        {/* Student Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Course Progress",
              value: "75%",
              icon: Play,
              change: "+5%",
              trend: "up",
              color: "blue",
            },
            {
              label: "Attendance",
              value: "92%",
              icon: CheckCircle,
              change: "0%",
              trend: "neutral",
              color: "green",
            },
            {
              label: "Upcoming Lessons",
              value: "3",
              icon: Calendar,
              change: "0",
              trend: "neutral",
              color: "purple",
            },
            {
              label: "Certificates Earned",
              value: "1",
              icon: Award,
              change: "+1",
              trend: "up",
              color: "yellow",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors`}
                >
                  <stat.icon size={24} />
                </div>
                <span
                  className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === "up"
                      ? "bg-green-50 text-green-700"
                      : stat.trend === "down"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {stat.trend === "up" && (
                    <ArrowUpRight size={14} className="mr-1" />
                  )}
                  {stat.trend === "down" && (
                    <ArrowDownRight size={14} className="mr-1" />
                  )}
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Student Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Course Activity Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">
                  Recent Course Activity
                </h3>
                <button className="text-brand-600 text-sm font-bold hover:text-brand-700">
                  View All Activity
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        course: "UI/UX Design",
                        activity: "Completed Module 3",
                        date: "Oct 24, 2026",
                        status: "Completed",
                      },
                      {
                        course: "Full Stack Dev",
                        activity: "Submitted Assignment 2",
                        date: "Oct 23, 2026",
                        status: "Graded",
                      },
                      {
                        course: "Data Science",
                        activity: "Started Module 1",
                        date: "Oct 22, 2026",
                        status: "In Progress",
                      },
                      {
                        course: "Cyber Security",
                        activity: "Viewed Lecture 5",
                        date: "Oct 21, 2026",
                        status: "Viewed",
                      },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {row.course}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {row.activity}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{row.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.status === "Completed" ||
                              row.status === "Graded"
                                ? "bg-green-100 text-green-800"
                                : row.status === "In Progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Student Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-brand-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-brand-900/20">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">View Grades</h3>
                  <p className="text-brand-200 text-sm mb-6">
                    Check your performance across all courses.
                  </p>
                  <button className="bg-white text-brand-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-50 transition-colors">
                    My Grades
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    Explore Courses
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Discover new courses and learning paths.
                  </p>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                    Browse Courses
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -ml-10 -mb-10"></div>
              </div>
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Upcoming Schedule */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">
                  Upcoming Schedule
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {[
                  {
                    title: "Live Session: UI/UX Principles",
                    time: "Today, 10:00 AM",
                    course: "UI/UX Design",
                    icon: Play,
                    color: "blue",
                  },
                  {
                    title: "Assignment Due: Full Stack Project",
                    time: "Tomorrow, 05:00 PM",
                    course: "Full Stack Dev",
                    icon: FileText,
                    color: "green",
                  },
                  {
                    title: "Webinar: Data Science Trends",
                    time: "Nov 1, 02:00 PM",
                    course: "Data Science",
                    icon: Calendar,
                    color: "purple",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}
                    >
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">
                        {item.time} &bull; {item.course}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-6 border-t border-slate-100">
                <button className="w-full text-brand-600 text-sm font-bold hover:text-brand-700">
                  View Full Calendar
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">
                  Quick Links
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {[
                  { name: "My Profile", icon: Users },
                  { name: "Support Center", icon: AlertCircle },
                  { name: "Course Catalog", icon: BookOpen },
                ].map((link, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-600">
                        <link.icon size={20} />
                      </div>
                      <p className="font-medium text-slate-900">{link.name}</p>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-400" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default (Admin/Other) Dashboard content
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Executive Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            System Online
          </span>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Students",
            value: "2,543",
            icon: Users,
            change: "+12.5%",
            trend: "up",
            color: "blue",
          },
          {
            label: "Total Revenue",
            value: "$45,200",
            icon: DollarSign,
            change: "+8.2%",
            trend: "up",
            color: "green",
          },
          {
            label: "Active Courses",
            value: "34",
            icon: BookOpen,
            change: "0%",
            trend: "neutral",
            color: "purple",
          },
          {
            label: "Pending Issues",
            value: "12",
            icon: AlertCircle,
            change: "-2.4%",
            trend: "down",
            color: "red",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors`}
              >
                <stat.icon size={24} />
              </div>
              <span
                className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-green-50 text-green-700"
                    : stat.trend === "down"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-50 text-slate-600"
                }`}
              >
                {stat.trend === "up" && (
                  <ArrowUpRight size={14} className="mr-1" />
                )}
                {stat.trend === "down" && (
                  <ArrowDownRight size={14} className="mr-1" />
                )}
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Admissions Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                Recent Admissions via Portal
              </h3>
              <button className="text-brand-600 text-sm font-bold hover:text-brand-700">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      name: "Alice Johnson",
                      course: "UI/UX Design",
                      date: "Oct 24, 2026",
                      status: "Verified",
                    },
                    {
                      name: "Robert Smith",
                      course: "Full Stack Dev",
                      date: "Oct 23, 2026",
                      status: "Pending",
                    },
                    {
                      name: "Karen Wills",
                      course: "Data Science",
                      date: "Oct 22, 2026",
                      status: "Verified",
                    },
                    {
                      name: "Mike Jones",
                      course: "Cyber Security",
                      date: "Oct 21, 2026",
                      status: "Rejected",
                    },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{row.course}</td>
                      <td className="px-6 py-4 text-slate-500">{row.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === "Verified"
                              ? "bg-green-100 text-green-800"
                              : row.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick HR Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-brand-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-brand-900/20">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold mb-1">Employee Onboarding</h3>
                <p className="text-brand-200 text-sm mb-6">
                  Add new staff, assign roles, and setup payroll.
                </p>
                <button className="bg-white text-brand-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-50 transition-colors">
                  Add Employee
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Payroll Processing
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Review attendance and process monthly salaries.
                </p>
                <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Go to Finance <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          {/* Notifications / Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-6">
              Action Required
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Review Assessment #45",
                  time: "2 hours ago",
                  type: "academic",
                },
                {
                  title: "Approve Leave Request (Sarah)",
                  time: "5 hours ago",
                  type: "hr",
                },
                {
                  title: "Server Maintenance",
                  time: "Tomorrow, 12:00 AM",
                  type: "sys",
                },
                {
                  title: "New Inquiry: Corporate Training",
                  time: "1 day ago",
                  type: "sales",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start group cursor-pointer"
                >
                  <div
                    className={`mt-1 min-w-[36px] h-9 rounded-full flex items-center justify-center border-2 ${
                      item.type === "hr"
                        ? "border-orange-100 bg-orange-50 text-orange-600"
                        : item.type === "sys"
                          ? "border-red-100 bg-red-50 text-red-600"
                          : "border-blue-100 bg-blue-50 text-blue-600"
                    }`}
                  >
                    {item.type === "hr" ? (
                      <Clock size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Progress Mini-Chart Substitute */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Course Completion</h3>
              <TrendingUp size={20} className="text-green-400" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 text-slate-300">
                  <span>Web Development</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 text-slate-300">
                  <span>Data Science</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 text-slate-300">
                  <span>UI/UX Design</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <button className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors">
                View Detailed Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
