import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Eye, Trash2, Edit2 } from "lucide-react";
import CustomDataTable from "../../components/DataTable";
import api from "../../services/api";
import Loading from "../../components/Loading";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data } = await api.get("/centers");
        setCenters(data || []);
      } catch (err) {
        console.error("Failed to fetch centers:", err);
      }
    };
    fetchCenters();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get("/students");
        setStudents(data.students || []);
        setFiltered(data.students || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const result = students.filter(
      (s) =>
        s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.toLowerCase().includes(search.toLowerCase()) ||
        s.whatsapp?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, students]);

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / studentsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete student.");
    }
  };

  const exportToExcel = () => {
    const data = students.map((s, i) => ({
      "S.No": i + 1,
      Name: s.user?.name,
      Email: s.user?.email,
      Phone: s.phone || "-",
      WhatsApp: s.whatsapp || "-",
      Department: s.department || "-",
      Year: s.year || "-",
      Status: s.status || "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Students.xlsx");
  };

const handleUpdate = async () => {
    try {
      const payload = { ...editStudent };
      
      // Ensure center is sent as an ID
      if (payload.center && typeof payload.center === "object") {
        payload.center = payload.center._id;
      }

      // Ensure enrolledCourses are sent as IDs if they are objects
      if (payload.enrolledCourses && Array.isArray(payload.enrolledCourses)) {
        payload.enrolledCourses = payload.enrolledCourses.map(c => 
          typeof c === "object" ? c._id : c
        );
      }

      const { data } = await api.put(`/students/${editStudent._id}`, payload);

      setStudents((prev) =>
        prev.map((s) => (s._id === editStudent._id ? data.student : s))
      );

      setFiltered((prev) =>
        prev.map((s) => (s._id === editStudent._id ? data.student : s))
      );

      setEditStudent(null);
      alert("Student updated successfully!");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to update student.");
    }
  };

  const updateField = (field, value) => {
    setEditStudent({ ...editStudent, [field]: value });
  };

  const updateAddress = (field, value) => {
    setEditStudent({
      ...editStudent,
      address: {
        ...editStudent.address,
        [field]: value,
      },
    });
  };

  const updateBank = (field, value) => {
    setEditStudent({
      ...editStudent,
      bankDetails: {
        ...editStudent.bankDetails,
        [field]: value,
      },
    });
  };

  const columns = [
    { name: "S.No", selector: (row, index) => index + 1, width: "80px", sortable: true },
    { name: "Name", selector: row => row.user?.name, sortable: true, cell: row => <span className="font-semibold text-slate-800">{row.user?.name}</span> },
    { name: "Email", selector: row => row.user?.email, sortable: true, cell: row => <span className="text-slate-600">{row.user?.email}</span> },
    { name: "Phone", selector: row => row.whatsapp || "-" },
    { name: "Center", selector: row => row.center?.name || "-", sortable: true },
    { name: "Status", selector: row => row.status, sortable: true, cell: row => (
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {row.status === "active" ? "Active" : "Inactive"}
      </span>
    )},
    { name: "Actions", cell: row => (
      <div className="flex gap-2">
        <button onClick={() => setSelectedStudent(row)} className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition shadow-sm" title="View">
          <Eye size={16} className="text-blue-600" />
        </button>
        <button onClick={() => {
          const studentClone = JSON.parse(JSON.stringify(row));
          setEditStudent({...studentClone, email: row.user?.email || ""});
        }} className="p-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition shadow-sm" title="Edit">
          <Edit2 size={16} className="text-yellow-600" />
        </button>
        <button onClick={() => handleDelete(row._id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition shadow-sm" title="Delete">
          <Trash2 size={16} className="text-red-600" />
        </button>
      </div>
    ), width: "160px"}
  ];


  return (
    <div className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden h-[calc(100vh-80px)]">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Student Directory</h1>
      <CustomDataTable 
        columns={columns}
        data={filtered}
        progressPending={loading}
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search by name, email, phone..."
        exportButton={
          <button onClick={exportToExcel} className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-md transition whitespace-nowrap">
            Export to Excel
          </button>
        }
      />

      {/* VIEW MODAL */}

{selectedStudent && (
<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">

<div
  className="bg-white pl-6 rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto relative"
  onClick={(e)=>e.stopPropagation()}
>
<div className="sticky top-0 bg-white z-20 border-b pb-6 pt-6 flex justify-between items-center">
  <h2 className="text-xl font-bold">Student Full Details</h2>

  <button
    onClick={() => setSelectedStudent(null)}
    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-lg"
  >
    ✕
  </button>
</div>


{/* PERSONAL DETAILS */}

<h3 className="font-semibold text-blue-600 border-b pb-2 mb-4">
1. Personal Details
</h3>

<div className="grid md:grid-cols-2 gap-4 text-sm">
<p><b>Name (English):</b> {selectedStudent.studentNameEnglish || "-"}</p>
<p><b>Name (Mother Tongue):</b> {selectedStudent.studentNameMotherTongue || "-"}</p>
<p><b>DOB:</b> {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : "-"}</p>
<p><b>Age:</b> {selectedStudent.age || "-"}</p>
<p><b>Father Name:</b> {selectedStudent.fatherName || "-"}</p>
<p><b>Gender:</b> {selectedStudent.gender || "-"}</p>
<p><b>Nationality:</b> {selectedStudent.nationality || "-"}</p>
<p><b>Aadhar No:</b> {selectedStudent.aadharNo || "-"}</p>
<p><b>KCET Reg No:</b> {selectedStudent.kcetRegNo || "-"}</p>
<p><b>NEET Reg No:</b> {selectedStudent.neetRegNo || "-"}</p>
<p><b>APAAR ID:</b> {selectedStudent.apaarId || "-"}</p>
<p><b>DEB ID:</b> {selectedStudent.debId || "-"}</p>
<p><b>ABC ID:</b> {selectedStudent.abcId || "-"}</p>
<p><b>Religion:</b> {selectedStudent.religion || "-"}</p>
<p><b>Community:</b> {selectedStudent.community || "-"}</p>
<p><b>Marital Status:</b> {selectedStudent.maritalStatus || "-"}</p>
<p><b>Email:</b> {selectedStudent.email || "-"}</p>
<p><b>WhatsApp:</b> {selectedStudent.whatsapp || "-"}</p>
<p><b>Center:</b> {selectedStudent.center?.name || "-"}</p>
<p><b>English Fluency:</b> {selectedStudent.englishFluency || "-"}</p>

<p>
<b>Languages Known:</b>{" "}
{selectedStudent.languagesKnown?.length
  ? selectedStudent.languagesKnown.join(", ")
  : "-"}
</p>
</div>

      {/* ADDRESS */}
      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      Address
      </h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
      <p><b>Village:</b> {selectedStudent.address?.village}</p>
      <p><b>Post:</b> {selectedStudent.address?.post}</p>
      <p><b>Taluk:</b> {selectedStudent.address?.taluk}</p>
      <p><b>District:</b> {selectedStudent.address?.district}</p>
      <p><b>PIN:</b> {selectedStudent.address?.pin}</p>
      </div>

      {/* BANK DETAILS */}
      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      Bank Details
      </h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
      <p><b>Account Holder:</b> {selectedStudent.bankDetails?.accountHolderName}</p>
      <p><b>Account Number:</b> {selectedStudent.bankDetails?.accountNumber}</p>
      <p><b>IFSC Code:</b> {selectedStudent.bankDetails?.ifscCode}</p>
      <p><b>Bank Name & Branch:</b> {selectedStudent.bankDetails?.bankNameBranch}</p>
      </div>

{/* EDUCATION BACKGROUND */}

<h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
2. Educational Background
</h3>

<table className="w-full border text-sm">
<thead className="bg-gray-100">
<tr>
<th className="border p-2">Exam</th>
<th className="border p-2">Institute</th>
<th className="border p-2">Group</th>
<th className="border p-2">Year</th>
<th className="border p-2">Percentage</th>
<th className="border p-2">Remarks</th>
</tr>
</thead>

<tbody>
{selectedStudent.educationBackground?.length > 0 ? (
selectedStudent.educationBackground.map((e,i)=>(
<tr key={i}>
<td className="border p-2">{e.examinationPassed}</td>
<td className="border p-2">{e.instituteName}</td>
<td className="border p-2">{e.group}</td>
<td className="border p-2">{e.yearOfPassing}</td>
<td className="border p-2">{e.marksPercentage}</td>
<td className="border p-2">{e.remarks}</td>
</tr>
))
):(
<tr>
<td colSpan="6" className="text-center p-2">No Data</td>
</tr>
)}
</tbody>
</table>

{/* SSLC */}
<h3 className="font-semibold mt-6 mb-2">SSLC Details</h3>
<div className="grid md:grid-cols-2 gap-4 text-sm">
<p><b>Register No:</b> {selectedStudent.sslcDetails?.registerNo || "-"}</p>
<p><b>Year Of Passing:</b> {selectedStudent.sslcDetails?.yearOfPassing || "-"}</p>
<p><b>School Name:</b> {selectedStudent.sslcDetails?.schoolName || "-"}</p>
<p><b>Place:</b> {selectedStudent.sslcDetails?.placeOfSchool || "-"}</p>
<p><b>Board:</b> {selectedStudent.sslcDetails?.boardOfExamination || "-"}</p>
</div>

{/* SSLC SUBJECTS */}

<table className="w-full border text-sm mt-3">
<thead className="bg-gray-100">
<tr>
<th className="border p-2">Subject</th>
<th className="border p-2">Total Marks</th>
<th className="border p-2">Secured Marks</th>
</tr>
</thead>

<tbody>
{selectedStudent.sslcSubjects?.map((s,i)=>(
<tr key={i}>
<td className="border p-2">{s.subject}</td>
<td className="border p-2">{s.totalMark}</td>
<td className="border p-2">{s.securedMark}</td>
</tr>
))}
</tbody>
</table>

{selectedStudent.sslcSubjects?.length > 0 && (() => {
const totalMarks = selectedStudent.sslcSubjects.reduce(
  (sum, s) => sum + Number(s.totalMark || 0),
  0
);
const securedMarks = selectedStudent.sslcSubjects.reduce(
  (sum, s) => sum + Number(s.securedMark || 0),
  0
);
const percentage = totalMarks ? ((securedMarks / totalMarks) * 100).toFixed(2) : 0;

return (
<div className="flex gap-6 mt-2 text-sm font-semibold">
<p>Total Marks: {totalMarks}</p>
<p>Secured Marks: {securedMarks}</p>
<p>Percentage: {percentage}%</p>

</div>
);
})()}

{/* HSC */}
<h3 className="font-semibold mt-6 mb-2">HSC / PU Details</h3>
<div className="grid md:grid-cols-2 gap-4 text-sm">
<p><b>Register No:</b> {selectedStudent.hscDetails?.registerNo || "-"}</p>
<p><b>Year Of Passing:</b> {selectedStudent.hscDetails?.yearOfPassing || "-"}</p>
<p><b>School Name:</b> {selectedStudent.hscDetails?.schoolName || "-"}</p>
<p><b>Place:</b> {selectedStudent.hscDetails?.placeOfSchool || "-"}</p>
<p><b>Board:</b> {selectedStudent.hscDetails?.boardOfExamination || "-"}</p>
</div>

{/* HSC SUBJECTS */}
<table className="w-full border text-sm mt-3">
<thead className="bg-gray-100">
<tr>
<th className="border p-2">Subject</th>
<th className="border p-2">Total Marks</th>
<th className="border p-2">Secured Marks</th>
</tr>
</thead>

<tbody>
{selectedStudent.hscSubjects?.map((s,i)=>(
<tr key={i}>
<td className="border p-2">{s.subject}</td>
<td className="border p-2">{s.totalMark}</td>
<td className="border p-2">{s.securedMark}</td>
</tr>
))}
</tbody>
</table>

{selectedStudent.hscSubjects?.length > 0 && (() => {
const totalMarks = selectedStudent.hscSubjects.reduce(
  (sum, s) => sum + Number(s.totalMark || 0),
  0
);
const securedMarks = selectedStudent.hscSubjects.reduce(
  (sum, s) => sum + Number(s.securedMark || 0),
  0
);
const percentage = totalMarks ? ((securedMarks / totalMarks) * 100).toFixed(2) : 0;

return (
<div className="flex gap-6 mt-2 text-sm font-semibold">
<p>Total Marks: {totalMarks}</p>
<p>Secured Marks: {securedMarks}</p>
<p>Percentage: {percentage}%</p>
</div>
);
})()}

{/* FAMILY */}

<h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
3. Family Background
</h3>

<table className="w-full border text-sm">
<thead className="bg-gray-100">
<tr>
<th className="border p-2">Relationship</th>
<th className="border p-2">Name</th>
<th className="border p-2">Occupation</th>
<th className="border p-2">Phone</th>
</tr>
</thead>
<tbody>

{selectedStudent.familyBackground?.map((f,i)=>(
<tr key={i}>
<td className="border p-2">{f.relationship}</td>
<td className="border p-2">{f.name}</td>
<td className="border p-2">{f.occupation}</td>
<td className="border p-2">{f.phone}</td>
</tr>
))}

</tbody>
</table>

{/* REFERENCES */}
<h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
4. References
</h3>
<table className="w-full border text-sm">
<thead className="bg-gray-100">
<tr>
<th className="border p-2">Name</th>
<th className="border p-2">Mobile</th>
</tr>
</thead>
<tbody>

{selectedStudent.references?.map((r,i)=>(
<tr key={i}>
<td className="border p-2">{r.name}</td>
<td className="border p-2">{r.mobile}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}

      {/* EDIT MODAL */}

{editStudent && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50"
    onClick={() => setEditStudent(null)}
  >
    <div
      className="bg-white rounded w-full max-w-5xl max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >

      {/* ✅ HEADER */}
      <div className="sticky top-0 bg-white z-20 border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Edit Student Full Details</h2>

        <button
          onClick={() => setEditStudent(null)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      {/* ✅ SCROLLABLE BODY */}
      <div className="overflow-y-auto p-4">

        {/* STEP 1 PERSONAL DETAILS */}
        <h3 className="font-semibold text-blue-600 border-b pb-2 mb-4">
          1. Personal Details
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-semibold">Name (English)</label>
            <input className="border p-2 w-full" value={editStudent.studentNameEnglish || ""} onChange={(e)=>setEditStudent({...editStudent,studentNameEnglish:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Name (Mother Tongue)</label>
            <input className="border p-2 w-full" value={editStudent.studentNameMotherTongue || ""} onChange={(e)=>setEditStudent({...editStudent,studentNameMotherTongue:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Father Name</label>
            <input className="border p-2 w-full" value={editStudent.fatherName || ""} onChange={(e)=>updateField("fatherName", e.target.value)}/>
          </div>

          <div>
            <label className="font-semibold">DOB</label>
            <input type="date" className="border p-2 w-full" value={editStudent.dob ? editStudent.dob.split("T")[0] : ""} onChange={(e)=>setEditStudent({...editStudent,dob:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Age</label>
            <input className="border p-2 w-full" value={editStudent.age || ""} onChange={(e)=>setEditStudent({...editStudent,age:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Gender</label>
            <input className="border p-2 w-full" value={editStudent.gender || ""} onChange={(e)=>setEditStudent({...editStudent,gender:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Nationality</label>
            <input className="border p-2 w-full" value={editStudent.nationality || ""} onChange={(e)=>setEditStudent({...editStudent,nationality:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Aadhar No</label>
            <input className="border p-2 w-full" value={editStudent.aadharNo || ""} onChange={(e)=>setEditStudent({...editStudent,aadharNo:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">KCET Reg No</label>
            <input className="border p-2 w-full" value={editStudent.kcetRegNo || ""} onChange={(e)=>setEditStudent({...editStudent,kcetRegNo:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">NEET Reg No</label>
            <input className="border p-2 w-full" value={editStudent.neetRegNo || ""} onChange={(e)=>setEditStudent({...editStudent,neetRegNo:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">APPAR Id</label>
            <input className="border p-2 w-full" value={editStudent.apaarId || ""} onChange={(e)=>setEditStudent({...editStudent,apaarId:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">DEB ID</label>
            <input className="border p-2 w-full" value={editStudent.debId || ""} onChange={(e)=>setEditStudent({...editStudent,debId:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">ABC ID</label>
            <input className="border p-2 w-full" value={editStudent.abcId || ""} onChange={(e)=>setEditStudent({...editStudent,abcId:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Religion</label>
            <input className="border p-2 w-full" value={editStudent.religion || ""} onChange={(e)=>setEditStudent({...editStudent,religion:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Community</label>
            <input className="border p-2 w-full" value={editStudent.community || ""} onChange={(e)=>setEditStudent({...editStudent,community:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Marrital Status</label>
            <input className="border p-2 w-full" value={editStudent.maritalStatus || ""} onChange={(e)=>setEditStudent({...editStudent,maritalStatus:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">WhatsApp</label>
            <input className="border p-2 w-full" value={editStudent.whatsapp || ""} onChange={(e)=>setEditStudent({...editStudent,whatsapp:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Email</label>
            <input className="border p-2 w-full" value={editStudent.email || ""} onChange={(e)=>setEditStudent({...editStudent,email:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">English Fluency</label>
            <input className="border p-2 w-full" value={editStudent.englishFluency || ""} onChange={(e)=>setEditStudent({...editStudent,englishFluency:e.target.value})}/>
          </div>

          <div>
            <label className="font-semibold">Languages Known</label>
            <input className="border p-2 w-full" value={editStudent.languagesKnown?.join(", ") || ""} onChange={(e)=>setEditStudent({...editStudent,languagesKnown:e.target.value.split(",").map(l=>l.trim())})}/>
          </div>

          <div>
            <label className="font-semibold text-blue-600">Select Center</label>
            <select
              className="border p-2 w-full bg-blue-50 focus:ring-2 focus:ring-blue-300"
              value={editStudent.center?._id || editStudent.center || ""}
              onChange={(e) => setEditStudent({...editStudent, center: e.target.value})}
            >
              <option value="">Select Center</option>
              {centers.map(c => (
                <option key={c._id} value={c._id}>{c.name} - {c.location}</option>
              ))}
            </select>
          </div>
        </div>

      {/* ADDRESS */}

      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      Address
      </h3>

      <div className="grid md:grid-cols-2 gap-3">

      <div>
      <label className="font-semibold">Village</label>
      <input className="border p-2 w-full" value={editStudent.address?.village || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      address:{...editStudent.address,village:e.target.value}
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Post</label>
      <input className="border p-2 w-full" value={editStudent.address?.post || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      address:{...editStudent.address,post:e.target.value}
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Taluk</label>
      <input className="border p-2 w-full" value={editStudent.address?.taluk || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      address:{...editStudent.address,taluk:e.target.value}
      })}
      />
      </div>

      <div>
      <label className="font-semibold">District</label>
      <input className="border p-2 w-full" value={editStudent.address?.district || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      address:{...editStudent.address,district:e.target.value}
      })}
      />
      </div>

      <div>
      <label className="font-semibold">PIN</label>
      <input className="border p-2 w-full" value={editStudent.address?.pin || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      address:{...editStudent.address,pin:e.target.value}
      })}
      />
      </div>

      </div>
      
      {/*Bank Details*/ }
      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      Bank Details
      </h3>

      <div className="grid md:grid-cols-2 gap-3">

      <div>
      <label className="font-semibold">Account Holder Name</label>
      <input className="border p-2 w-full" value={editStudent.bankDetails?.accountHolderName || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      bankDetails:{
      ...editStudent.bankDetails,
      accountHolderName:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Account Number</label>
      <input className="border p-2 w-full" value={editStudent.bankDetails?.accountNumber || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      bankDetails:{
      ...editStudent.bankDetails,
      accountNumber:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">IFSC Code</label>
      <input className="border p-2 w-full" value={editStudent.bankDetails?.ifscCode || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      bankDetails:{
      ...editStudent.bankDetails,
      ifscCode:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Bank Name & Branch</label>
      <input className="border p-2 w-full" value={editStudent.bankDetails?.bankNameBranch || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      bankDetails:{
      ...editStudent.bankDetails,
      bankNameBranch:e.target.value
      }
      })}
      />
      </div>
      </div>

      {/* STEP 2 EDUCATION */}

      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      2. Educational Background
      </h3>

      <table className="w-full border text-sm">

      <thead className="bg-gray-100">
      <tr>
      <th className="border p-2">Exam</th>
      <th className="border p-2">Institute</th>
      <th className="border p-2">Group</th>
      <th className="border p-2">Year</th>
      <th className="border p-2">Percentage</th>
      <th className="border p-2">Remarks</th>
      </tr>
      </thead>

      <tbody>

      {editStudent.educationBackground?.map((e,i)=>(
      <tr key={i}>

      <td className="border p-1">
      <input className="w-full p-1" value={e.examinationPassed} onChange={(ev)=>{
      const updated=[...editStudent.educationBackground];
      updated[i].examinationPassed=ev.target.value;
      setEditStudent({...editStudent,educationBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={e.instituteName}onChange={(ev)=>{
      const updated=[...editStudent.educationBackground];
      updated[i].instituteName=ev.target.value;
      setEditStudent({...editStudent,educationBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={e.group} onChange={(ev)=>{
      const updated=[...editStudent.educationBackground];
      updated[i].group=ev.target.value;
      setEditStudent({...editStudent,educationBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={e.yearOfPassing} onChange={(ev)=>{
      const updated=[...editStudent.educationBackground];
      updated[i].yearOfPassing=ev.target.value;
      setEditStudent({...editStudent,educationBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={e.marksPercentage} onChange={(ev)=>{
      const updated=[...editStudent.educationBackground];
      updated[i].marksPercentage=ev.target.value;
      setEditStudent({...editStudent,educationBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={e.remarks} onChange={(ev)=>{
      const updated=[...editStudent.educationBackground];
      updated[i].remarks=ev.target.value;
      setEditStudent({...editStudent,educationBackground:updated});
      }}
      />
      </td>
      </tr>
      ))}
      </tbody>
      </table>

      {/*SSLC Details*/}
      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      SSLC Details
      </h3>

      <div className="grid md:grid-cols-2 gap-3">
      <div>
      <label className="font-semibold">Register No</label>
      <input className="border p-2 w-full" value={editStudent.sslcDetails?.registerNo || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      sslcDetails:{
      ...editStudent.sslcDetails,
      registerNo:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Year Of Passing</label>
      <input className="border p-2 w-full" value={editStudent.sslcDetails?.yearOfPassing || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      sslcDetails:{
      ...editStudent.sslcDetails,
      yearOfPassing:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">School Name</label>
      <input className="border p-2 w-full" value={editStudent.sslcDetails?.schoolName || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      sslcDetails:{
      ...editStudent.sslcDetails,
      schoolName:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Place Of School</label>
      <input className="border p-2 w-full" value={editStudent.sslcDetails?.placeOfSchool || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      sslcDetails:{
      ...editStudent.sslcDetails,
      placeOfSchool:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Board Of Examination</label>
      <input className="border p-2 w-full" value={editStudent.sslcDetails?.boardOfExamination || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      sslcDetails:{
      ...editStudent.sslcDetails,
      boardOfExamination:e.target.value
      }
      })}
      />
      </div>

      {/*SSLC Subjects*/}
      </div>
      <h4 className="font-semibold mt-4">SSLC Subjects</h4>
      <table className="w-full border text-sm">
      <thead className="bg-gray-100">
      <tr>
      <th className="border p-2">Subject</th>
      <th className="border p-2">Total</th>
      <th className="border p-2">Secured</th>
      </tr>
      </thead>

      <tbody>

      {editStudent.sslcSubjects?.map((sub,i)=>(
      <tr key={i}>

      <td className="border p-1">
      <input className="w-full p-1" value={sub.subject} onChange={(e)=>{
      const updated=[...editStudent.sslcSubjects];
      updated[i].subject=e.target.value;
      setEditStudent({...editStudent,sslcSubjects:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={sub.totalMark} onChange={(e)=>{
      const updated=[...editStudent.sslcSubjects];
      updated[i].totalMark=e.target.value;
      setEditStudent({...editStudent,sslcSubjects:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={sub.securedMark} onChange={(e)=>{
      const updated=[...editStudent.sslcSubjects];
      updated[i].securedMark=e.target.value;
      setEditStudent({...editStudent,sslcSubjects:updated});
      }}
      />
      </td>
      </tr>
      ))}
      </tbody>
      </table>
      
      {/*HSC Details*/}
      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      HSC Details
      </h3>

      <div className="grid md:grid-cols-2 gap-3">

      <div>
      <label className="font-semibold">Register No</label>
      <input className="border p-2 w-full" value={editStudent.hscDetails?.registerNo || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      hscDetails:{
      ...editStudent.hscDetails,
      registerNo:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Year Of Passing</label>
      <input className="border p-2 w-full" value={editStudent.hscDetails?.yearOfPassing || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      hscDetails:{
      ...editStudent.hscDetails,
      yearOfPassing:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">School Name</label>
      <input className="border p-2 w-full" value={editStudent.hscDetails?.schoolName || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      hscDetails:{
      ...editStudent.hscDetails,
      schoolName:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Place</label>
      <input className="border p-2 w-full" value={editStudent.hscDetails?.placeOfSchool || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      hscDetails:{
      ...editStudent.hscDetails,
      placeOfSchool:e.target.value
      }
      })}
      />
      </div>

      <div>
      <label className="font-semibold">Board Of Examination</label>
      <input className="border p-2 w-full" value={editStudent.hscDetails?.boardOfExamination || ""} onChange={(e)=>setEditStudent({
      ...editStudent,
      hscDetails:{
      ...editStudent.hscDetails,
      boardOfExamination:e.target.value
      }
      })}
      />
      </div>

      </div>

      {/*HSC Subjects*/}
      <h4 className="font-semibold mt-4">HSC Subjects</h4>
      <table className="w-full border text-sm">
      <thead className="bg-gray-100">
      <tr>
      <th className="border p-2">Subject</th>
      <th className="border p-2">Total</th>
      <th className="border p-2">Secured</th>
      </tr>
      </thead>

      <tbody>

      {editStudent.hscSubjects?.map((sub,i)=>(
      <tr key={i}>

      <td className="border p-1">
      <input className="w-full p-1" value={sub.subject} onChange={(e)=>{
      const updated=[...editStudent.hscSubjects];
      updated[i].subject=e.target.value;
      setEditStudent({...editStudent,hscSubjects:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={sub.totalMark} onChange={(e)=>{
      const updated=[...editStudent.hscSubjects];
      updated[i].totalMark=e.target.value;
      setEditStudent({...editStudent,hscSubjects:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={sub.securedMark} onChange={(e)=>{
      const updated=[...editStudent.hscSubjects];
      updated[i].securedMark=e.target.value;
      setEditStudent({...editStudent,hscSubjects:updated});
      }}
      />
      </td>
      </tr>
      ))}
      </tbody>
      </table>
      {/* STEP 3 FAMILY */}

      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      3. Family Background
      </h3>
      <table className="w-full border text-sm">
      <thead className="bg-gray-100">
      <tr>
      <th className="border p-2">Relationship</th>
      <th className="border p-2">Name</th>
      <th className="border p-2">Occupation</th>
      <th className="border p-2">Phone</th>
      </tr>
      </thead>
      <tbody>
      {editStudent.familyBackground?.map((f,i)=>(
      <tr key={i}>

      <td className="border p-1">
      <input className="w-full p-1" value={f.relationship} onChange={(e)=>{
      const updated=[...editStudent.familyBackground];
      updated[i].relationship=e.target.value;
      setEditStudent({...editStudent,familyBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={f.name} onChange={(e)=>{
      const updated=[...editStudent.familyBackground];
      updated[i].name=e.target.value;
      setEditStudent({...editStudent,familyBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={f.occupation} onChange={(e)=>{
      const updated=[...editStudent.familyBackground];
      updated[i].occupation=e.target.value;
      setEditStudent({...editStudent,familyBackground:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={f.phone} onChange={(e)=>{
      const updated=[...editStudent.familyBackground];
      updated[i].phone=e.target.value;
      setEditStudent({...editStudent,familyBackground:updated});
      }}
      />
      </td>
      </tr>
      ))}
      </tbody>
      </table>

      {/* STEP 4 REFERENCES */}

      <h3 className="font-semibold text-blue-600 border-b pb-2 mt-6 mb-4">
      4. References
      </h3>

      <table className="w-full border text-sm">
      <thead className="bg-gray-100">
      <tr>
      <th className="border p-2">Name</th>
      <th className="border p-2">Mobile</th>
      </tr>
      </thead>
      <tbody>

      {editStudent.references?.map((r,i)=>(
      <tr key={i}>

      <td className="border p-1">
      <input className="w-full p-1" value={r.name} onChange={(e)=>{
      const updated=[...editStudent.references];
      updated[i].name=e.target.value;
      setEditStudent({...editStudent,references:updated});
      }}
      />
      </td>

      <td className="border p-1">
      <input className="w-full p-1" value={r.mobile} onChange={(e)=>{
      const updated=[...editStudent.references];
      updated[i].mobile=e.target.value;
      setEditStudent({...editStudent,references:updated});
      }}
      />
      </td>
      </tr>
      ))}
      </tbody>
      </table>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setEditStudent(null)}
          className="bg-gray-600 text-white px-12 py-2 rounded-md text-base"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          className="bg-green-600 text-white px-12 py-2 rounded-md text-base"
        >
          Update
        </button>
      </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Students;