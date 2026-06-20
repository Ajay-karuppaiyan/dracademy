import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, FileText, Calendar, BookOpen, MapPin, X, CheckSquare, Layers, Download, Upload, FileArchive } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import CustomDataTable from "../../components/DataTable";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from 'xlsx';

const ExamManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("exams"); // 'exams' or 'marks'

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [centers, setCenters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    course: "",
    semester: 1,
    center: "",
    subjects: []
  });

  const [markFormData, setMarkFormData] = useState({
    student: "",
    exam: "",
    course: "",
    subject: "",
    totalMark: 100,
    passMark: 35,
    theoryMark: 0,
    internalMark: 0,
    practicalMark: 0,
    marksheet: null
  });

  const fileInputRef = React.useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, coursesRes, centersRes, subjectsRes, marksRes, studentsRes] = await Promise.all([
        api.get("/exams"),
        api.get("/courses"),
        api.get("/centers"),
        api.get("/subjects"),
        api.get("/marks"),
        isAdmin ? api.get("/students") : Promise.resolve({ data: [] })
      ]);
      setExams(examsRes.data);
      setCourses(coursesRes.data);
      setCenters(centersRes.data);
      setSubjects(subjectsRes.data);
      setMarks(marksRes.data);
      if (isAdmin) setStudents(studentsRes.data.students || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ====== EXAM LOGIC ======
  const openModal = (exam = null) => {
    if (exam) {
      setFormData({
        name: exam.name,
        date: new Date(exam.date).toISOString().split('T')[0],
        course: exam.course?._id || "",
        semester: exam.semester,
        center: exam.center?._id || "",
        subjects: exam.subjects?.map(s => s._id) || []
      });
      setCurrentId(exam._id);
      setIsEditing(true);
    } else {
      setFormData({
        name: "",
        date: "",
        course: "",
        semester: 1,
        center: "",
        subjects: []
      });
      setCurrentId(null);
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, subjects: JSON.stringify(formData.subjects) };
      if (isEditing) {
        await api.put(`/exams/${currentId}`, payload);
        toast.success("Exam updated successfully");
      } else {
        await api.post("/exams", payload);
        toast.success("Exam created successfully");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save exam");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await api.delete(`/exams/${id}`);
        toast.success("Exam deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete exam");
      }
    }
  };

  // ====== MARKS LOGIC ======
  const openMarkModal = (mark = null) => {
    if (mark) {
      setMarkFormData({
        student: mark.student?._id || "",
        exam: mark.exam?._id || "",
        course: mark.course?._id || "",
        subject: mark.subject?._id || "",
        totalMark: mark.totalMark,
        passMark: mark.passMark,
        theoryMark: mark.theoryMark,
        internalMark: mark.internalMark,
        practicalMark: mark.practicalMark || 0,
        marksheet: null
      });
      setCurrentId(mark._id);
      setIsEditing(true);
    } else {
      setMarkFormData({
        student: "",
        exam: "",
        course: "",
        subject: "",
        totalMark: 100,
        passMark: 35,
        theoryMark: 0,
        internalMark: 0,
        practicalMark: 0,
        marksheet: null
      });
      setCurrentId(null);
      setIsEditing(false);
    }
    setShowMarkModal(true);
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(markFormData).forEach(key => {
        if (key === 'marksheet') {
          if (markFormData.marksheet) {
            data.append('marksheet', markFormData.marksheet);
          }
        } else {
          data.append(key, markFormData[key]);
        }
      });

      if (isEditing) {
        await api.put(`/marks/${currentId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Mark updated successfully");
      } else {
        await api.post("/marks", data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Mark added successfully");
      }
      setShowMarkModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save mark");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
           toast.error("Excel sheet is empty");
           return;
        }

        const res = await api.post('/marks/bulk', { marks: data });
        toast.success(`Bulk upload completed! Success: ${res.data.results.success}, Failed: ${res.data.results.failed}`);
        if (res.data.results.failed > 0) {
            console.error("Bulk Upload Errors:", res.data.results.errors);
            toast.error("Some records failed. Check console for details.");
        }
        fetchData();
      } catch (err) {
        toast.error("Failed to process Excel file");
      }
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student ID,Exam Name,Course Title,Subject Code,Total Mark,Pass Mark,Theory Mark,Internal Mark,Practical Mark\n"
      + "STU123,Midterm,Class 10,MAT01,100,35,40,20,10";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_marks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mark?")) {
      try {
        await api.delete(`/marks/${id}`);
        toast.success("Mark deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete mark");
      }
    }
  };

  const handleStudentChange = (studentId) => {
    const st = students.find(s => s._id === studentId);
    let courseId = "";
    if (st && st.enrolledCourses && st.enrolledCourses.length > 0) {
      courseId = st.enrolledCourses[0].course || "";
    }
    setMarkFormData({ ...markFormData, student: studentId, course: courseId });
  };

  // ====== COLUMNS ======
  const examColumns = [
    { name: "S.No", selector: (row, i) => i + 1, width: "70px", center: true },
    {
      name: "Exam Name",
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.name}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <Calendar size={12} /> {new Date(row.date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )
    },
    {
      name: "Course",
      selector: row => row.course?.title,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-semibold text-slate-700">{row.course?.title || "N/A"}</div>
          <div className="text-xs text-slate-500">Sem {row.semester}</div>
        </div>
      )
    },
    {
      name: "Center",
      selector: row => row.center?.name,
      sortable: true,
      cell: row => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
          <MapPin size={12} /> {row.center?.name || "N/A"}
        </span>
      )
    },
    {
      name: "Subjects",
      cell: row => (
        <div className="flex flex-wrap gap-1 py-2">
          {row.subjects?.map(sub => (
            <span key={sub._id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {sub.code}
            </span>
          ))}
          {(!row.subjects || row.subjects.length === 0) && (
            <span className="text-xs text-slate-400 italic">No Subjects</span>
          )}
        </div>
      ),
      width: "200px"
    }
  ];

  if (isAdmin) {
    examColumns.push({
      name: "Actions",
      center: true,
      width: "120px",
      cell: row => (
        <div className="flex justify-center gap-2">
          <button onClick={() => openModal(row)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <Edit size={18} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    });
  }

  const markColumns = [
    { name: "S.No", selector: (row, i) => i + 1, width: "70px", center: true },
    {
      name: "Student",
      selector: row => row.student?.studentNameEnglish,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-bold text-slate-900">{row.student?.studentNameEnglish || "N/A"}</div>
          <div className="text-xs text-slate-500">{row.student?.studentId}</div>
        </div>
      )
    },
    {
      name: "Exam & Course",
      selector: row => row.exam?.name,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-semibold text-slate-700">{row.exam?.name || "N/A"}</div>
          <div className="text-[10px] text-slate-500">{row.course?.title}</div>
        </div>
      )
    },
    {
      name: "Subject",
      selector: row => row.subject?.name,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-semibold text-slate-700">{row.subject?.name}</div>
          <div className="text-[10px] text-slate-500">{row.subject?.code}</div>
        </div>
      )
    },
    {
      name: "Scores",
      cell: row => (
        <div className="flex flex-col gap-1 py-1">
          <div className="text-xs font-bold text-slate-700">Total: {row.totalMark} | Pass: {row.passMark}</div>
          <div className="text-[10px] text-slate-500">Th: {row.theoryMark} | Int: {row.internalMark} | Pr: {row.practicalMark}</div>
        </div>
      ),
      width: "180px"
    },
    {
      name: "Status",
      cell: row => {
        const totalSecured = (row.theoryMark || 0) + (row.internalMark || 0) + (row.practicalMark || 0);
        const passed = totalSecured >= row.passMark;
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {passed ? 'PASS' : 'FAIL'} ({totalSecured})
          </span>
        );
      }
    },
    {
      name: "Marksheet",
      center: true,
      cell: row => row.marksheetUrl ? (
        <a href={row.marksheetUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 flex justify-center">
          <FileArchive size={18} />
        </a>
      ) : (
        <div className="text-xs text-slate-400 text-center">-</div>
      )
    }
  ];

  if (isAdmin) {
    markColumns.push({
      name: "Actions",
      center: true,
      width: "120px",
      cell: row => (
        <div className="flex justify-center gap-2">
          <button onClick={() => openMarkModal(row)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <Edit size={18} />
          </button>
          <button onClick={() => handleMarkDelete(row._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    });
  }

  const filteredExams = exams.filter(e => 
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMarks = marks.filter(m => 
    m.student?.studentNameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.student?.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.exam?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Examination Management</h1>
          <p className="text-sm text-slate-500">Manage academy examinations, schedules, and student marks</p>
        </div>
        {isAdmin && activeTab === "exams" && (
          <button onClick={() => openModal()} className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 font-bold">
            <Plus size={20} /> Add Exam
          </button>
        )}
        {isAdmin && activeTab === "marks" && (
          <div className="flex gap-2">
            <button onClick={downloadSampleExcel} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-all font-bold">
              <Download size={20} /> Sample CSV
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-bold">
              <Upload size={20} /> Bulk Excel
            </button>
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleBulkUpload} />
            <button onClick={() => openMarkModal()} className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 font-bold">
              <Plus size={20} /> Upload Result
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "exams" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("exams")}
        >
          <FileText size={18} /> Exams
        </button>
        <button
          className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "marks" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("marks")}
        >
          <CheckSquare size={18} /> Marks
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === "exams" ? (
          <CustomDataTable
            columns={examColumns}
            data={filteredExams}
            progressPending={loading}
            search={searchQuery}
            setSearch={setSearchQuery}
            searchPlaceholder="Search exams by name or course..."
          />
        ) : (
          <CustomDataTable
            columns={markColumns}
            data={filteredMarks}
            progressPending={loading}
            search={searchQuery}
            setSearch={setSearchQuery}
            searchPlaceholder="Search marks by student name, ID or exam..."
          />
        )}
      </div>

      {/* Exam Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{isEditing ? "Edit Exam" : "Create New Exam"}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Exam Name</label>
                  <input type="text" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Exam Date</label>
                  <input type="date" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Center</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.center} onChange={(e) => setFormData({ ...formData, center: e.target.value })}>
                    <option value="">Select Center</option>
                    {centers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Subjects</label>
                <div className="border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto bg-slate-50 space-y-2">
                  {subjects.map((sub) => {
                    const isChecked = formData.subjects.includes(sub._id);
                    return (
                      <label key={sub._id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" checked={isChecked} onChange={(e) => {
                          if (e.target.checked) setFormData({ ...formData, subjects: [...formData.subjects, sub._id] });
                          else setFormData({ ...formData, subjects: formData.subjects.filter(id => id !== sub._id) });
                        }} />
                        <span className="text-sm font-semibold text-slate-700">{sub.name} <span className="text-slate-400 font-normal">({sub.code})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
                  {isEditing ? "Update Exam" : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Modal */}
      {showMarkModal && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                  <CheckSquare size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{isEditing ? "Edit Mark" : "Upload Result"}</h2>
              </div>
              <button onClick={() => setShowMarkModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMarkSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Student</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.student} onChange={(e) => handleStudentChange(e.target.value)}>
                    <option value="">Choose Student</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.studentNameEnglish} ({s.studentId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm bg-slate-100 text-slate-500 border p-3 text-sm" value={markFormData.course} disabled>
                    <option value="">Auto-populated</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Exam</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.exam} onChange={(e) => setMarkFormData({ ...markFormData, exam: e.target.value })}>
                    <option value="">Select Exam</option>
                    {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                  <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.subject} onChange={(e) => setMarkFormData({ ...markFormData, subject: e.target.value })}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total Mark</label>
                  <input type="number" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.totalMark} onChange={(e) => setMarkFormData({ ...markFormData, totalMark: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Pass Mark</label>
                  <input type="number" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.passMark} onChange={(e) => setMarkFormData({ ...markFormData, passMark: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Theory Mark</label>
                  <input type="number" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.theoryMark} onChange={(e) => setMarkFormData({ ...markFormData, theoryMark: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Internal Mark</label>
                  <input type="number" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.internalMark} onChange={(e) => setMarkFormData({ ...markFormData, internalMark: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Practical Mark</label>
                  <input type="number" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={markFormData.practicalMark} onChange={(e) => setMarkFormData({ ...markFormData, practicalMark: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Marksheet File</label>
                  <input type="file" className="w-full rounded-xl border-slate-200 shadow-sm border p-2 text-sm bg-slate-50" onChange={(e) => setMarkFormData({ ...markFormData, marksheet: e.target.files[0] })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowMarkModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
                  {isEditing ? "Update Mark" : "Upload Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
