import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Upload, CheckCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const TakeAttendanceModal = ({ isOpen, onClose }) => {
  const [type, setType] = useState("employee"); // employee | student | intern
  const [employees, setEmployees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [photo, setPhoto] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setType("employee");
      setSelectedUser("");
      setPhoto(null);
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [empRes, stuRes] = await Promise.all([
        api.get("/employees").catch(() => ({ data: [] })),
        api.get("/students").catch(() => ({ data: { students: [] } }))
      ]);
      setEmployees(empRes.data || []);
      setStudents(stuRes.data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return toast.error("Please select a name");
    if (!photo) return toast.error("Please provide a photo");

    setLoading(true);
    try {
      let userData = null;
      let role = type;
      
      if (type === "employee") {
        const emp = employees.find(e => e._id === selectedUser);
        if (emp) userData = emp.user;
      } else {
        const stu = students.find(s => s._id === selectedUser);
        if (stu) userData = stu.user;
      }

      if (!userData) {
        toast.error("Selected user not found");
        setLoading(false);
        return;
      }

      const loginTime = new Date().toTimeString().slice(0, 8);
      
      await api.post("/public-attendance/mark", {
        userId: userData._id,
        name: userData.name,
        role: role,
        loginTime,
        photo
      });

      toast.success("Attendance marked successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter students vs interns
  const filteredStudents = type === "intern" 
    ? students.filter(s => s.internships && s.internships.length > 0)
    : students.filter(s => !s.internships || s.internships.length === 0);

  const getOptions = () => {
    if (type === "employee") {
      return employees.map(emp => (
        <option key={emp._id} value={emp._id}>
          {emp.firstName} {emp.lastName} ({emp.employeeId})
        </option>
      ));
    } else {
      return filteredStudents.map(stu => (
        <option key={stu._id} value={stu._id}>
          {stu.user?.name} ({stu.studentId})
        </option>
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-sm text-gray-500 mt-1">Select type and user to mark attendance</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Select Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="employee" checked={type === "employee"} onChange={() => { setType("employee"); setSelectedUser(""); }} className="text-brand-600 focus:ring-brand-500" />
                <span className="text-sm font-medium">Employee</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="student" checked={type === "student"} onChange={() => { setType("student"); setSelectedUser(""); }} className="text-brand-600 focus:ring-brand-500" />
                <span className="text-sm font-medium">Student</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="intern" checked={type === "intern"} onChange={() => { setType("intern"); setSelectedUser(""); }} className="text-brand-600 focus:ring-brand-500" />
                <span className="text-sm font-medium">Intern</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Select Name</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border-gray-200 rounded-xl focus:border-brand-500 focus:ring-brand-500 bg-gray-50/50 px-4 py-2.5 text-sm"
              required
            >
              <option value="">Select User</option>
              {getOptions()}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Photo</label>
            <div className="flex items-center justify-center w-full">
              {photo ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <img src={photo} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setPhoto(null)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      <X size={16} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} capture="environment" />
                </label>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : (
                <>
                  <CheckCircle size={18} />
                  Submit Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TakeAttendanceModal;