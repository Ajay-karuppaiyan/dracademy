import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { 
  User, Phone, Mail, Edit2, Check, X, Shield, Users, MapPin, 
  Briefcase, GraduationCap, CreditCard, Languages, Info, 
  BookOpen, Heart, Globe, Plus, Trash2, Calendar, History
} from "lucide-react";

const Profile = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // User Level State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  // Role Specific Profiles
  const [studentProfile, setStudentProfile] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  // Parent's Children State
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childData, setChildData] = useState({});
  const [childEditorTab, setChildEditorTab] = useState("personal");

  useEffect(() => {
    fetchProfile();
    if (authUser?.role === "parent") {
      fetchChildren();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      const userData = res.data;
      
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || ""
      });

      if (userData.role === "student") {
        const sRes = await api.get(`/students/user/${userData._id}`);
        setStudentProfile(sRes.data.studentProfile);
        // Sync phone if needed
        if (!userData.mobile && sRes.data.studentProfile?.phone) {
          setProfileData(prev => ({ ...prev, mobile: sRes.data.studentProfile.phone }));
        }
      } else if (["employee", "coach", "hr", "finance", "admin", "pms_admin"].includes(userData.role)) {
        try {
            const eRes = await api.get(`/employees/user/${userData._id}`);
            setEmployeeProfile(eRes.data);
            // Sync phone if needed
            if (!userData.mobile && eRes.data.phone) {
              setProfileData(prev => ({ ...prev, mobile: eRes.data.phone }));
            }
        } catch (error) {
            console.log("No employee profile found");
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const res = await api.get("/parent/children");
      setChildren(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load children data");
    }
  };

  // ----- SHARED HANDLERS -----
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    if (studentProfile) {
        if (name === "name") setStudentProfile({ ...studentProfile, studentNameEnglish: value });
        if (name === "email") setStudentProfile({ ...studentProfile, email: value });
        if (name === "mobile") setStudentProfile({ ...studentProfile, phone: value });
    }
    if (employeeProfile) {
        if (name === "mobile") setEmployeeProfile({ ...employeeProfile, phone: value });
    }
  };

  const updateStudentField = (field, value) => {
      setStudentProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateStudentAddress = (field, value) => {
      setStudentProfile(prev => ({
          ...prev,
          address: { ...prev.address, [field]: value }
      }));
  };

  const updateStudentBank = (field, value) => {
      setStudentProfile(prev => ({
          ...prev,
          bankDetails: { ...prev.bankDetails, [field]: value }
      }));
  };

  const updateEmployeeField = (field, value) => {
      setEmployeeProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateStudentArray = (parentField, index, field, value) => {
    const updatedArray = [...studentProfile[parentField]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setStudentProfile(prev => ({ ...prev, [parentField]: updatedArray }));
  };

  const addStudentArrayItem = (parentField, template) => {
    setStudentProfile(prev => ({
      ...prev,
      [parentField]: [...(prev[parentField] || []), template]
    }));
  };

  const removeStudentArrayItem = (parentField, index) => {
    const updatedArray = studentProfile[parentField].filter((_, i) => i !== index);
    setStudentProfile(prev => ({ ...prev, [parentField]: updatedArray }));
  };

  const savePersonalProfile = async () => {
    try {
      let res;
      if (authUser?.role === "student" && studentProfile) {
          res = await api.put(`/students/${studentProfile._id}`, studentProfile);
      } else if (employeeProfile) {
          res = await api.put(`/employees/${employeeProfile._id}`, employeeProfile);
      } else {
          res = await api.put("/auth/profile", profileData);
      }

      const updatedUser = {
        ...authUser,
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.mobile
      };

      if (setAuthUser) setAuthUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditingPersonal(false);
      await fetchProfile();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  // ----- CHILD EDITOR HANDLERS -----
  const openChildEditor = (child) => {
    setSelectedChildId(child._id);
    // Deep clone to avoid direct mutations
    setChildData(JSON.parse(JSON.stringify(child)));
  };

  const updateChildField = (field, value) => {
    setChildData(prev => ({ ...prev, [field]: value }));
  };

  const updateChildAddress = (field, value) => {
    setChildData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const updateChildBank = (field, value) => {
    setChildData(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value }
    }));
  };

  const updateChildArray = (parentField, index, field, value) => {
    const updatedArray = [...childData[parentField]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setChildData(prev => ({ ...prev, [parentField]: updatedArray }));
  };

  const addChildArrayItem = (parentField, template) => {
    setChildData(prev => ({
      ...prev,
      [parentField]: [...(prev[parentField] || []), template]
    }));
  };

  const removeChildArrayItem = (parentField, index) => {
    const updatedArray = childData[parentField].filter((_, i) => i !== index);
    setChildData(prev => ({ ...prev, [parentField]: updatedArray }));
  };

  const saveChildProfile = async () => {
    try {
      await api.put(`/students/${selectedChildId}`, childData);
      toast.success("Child profile updated!");
      fetchChildren();
      setSelectedChildId(null);
    } catch (err) {
      toast.error("Failed to update child profile");
    }
  };

  if (loading) return <div className="p-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- STUNNING HEADER --- */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-600/5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            {profileData.name.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">{profileData.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
                    <Shield size={14} /> {authUser?.role}
                </span>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm hover:translate-y-[-2px] transition-transform">
                    <Mail size={14} className="text-blue-500" /> {profileData.email}
                </span>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm hover:translate-y-[-2px] transition-transform">
                    <Phone size={14} className="text-green-500" /> {profileData.mobile || employeeProfile?.phone || studentProfile?.phone || "No Phone recorded"}
                </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {!isEditingPersonal ? (
              <button 
                onClick={() => setIsEditingPersonal(true)}
                className="group flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 shadow-xl transition-all duration-300 active:scale-95"
              >
                <Edit2 size={20} className="group-hover:rotate-12 transition-transform" /> Edit My Details
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={savePersonalProfile} className="flex items-center gap-3 px-8 py-3.5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all">
                  <Check size={20} /> Save
                </button>
                <button onClick={() => setIsEditingPersonal(false)} className="px-8 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- NAVIGATION --- */}
        <div className="flex gap-4 p-2 bg-white rounded-3xl shadow-lg border border-slate-100 w-fit">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === "personal" ? "bg-blue-600 text-white shadow-lg rotate-1" : "text-slate-500 hover:bg-slate-50"}`}
          >
            My Profile
          </button>
          {authUser?.role === "parent" && (
            <button
              onClick={() => setActiveTab("children")}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === "children" ? "bg-blue-600 text-white shadow-lg -rotate-1" : "text-slate-500 hover:bg-slate-50"}`}
            >
              My Children
            </button>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[600px]">
          {activeTab === "personal" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              
              {/* Account Level */}
              <div className="grid md:grid-cols-3 gap-6">
                <InputCard label="Full Name" name="name" value={profileData.name} onChange={handlePersonalChange} isEditing={isEditingPersonal} />
                <InputCard label="Email Address" name="email" value={profileData.email} onChange={handlePersonalChange} isEditing={isEditingPersonal} type="email" />
                <InputCard label="Mobile Number" name="mobile" value={profileData.mobile} onChange={handlePersonalChange} isEditing={isEditingPersonal} />
              </div>

              {/* Role Specific Content */}
              {studentProfile && (
                <div className="space-y-12">
                  <div className="flex px-4 py-2 bg-white rounded-3xl shadow-xl gap-4 overflow-x-auto border border-slate-100 w-fit mx-auto sticky top-20 z-10 backdrop-blur-xl bg-white/80">
                    {["personal", "academic", "family", "references"].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setChildEditorTab(tab)}
                          className={`px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${childEditorTab === tab ? "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105" : "text-slate-400 hover:text-slate-900 bg-slate-50/50"}`}
                        >
                            {tab}
                        </button>
                    ))}
                  </div>

                  <div className="animate-in fade-in duration-700">
                    {childEditorTab === "personal" && (
                      <div className="space-y-10">
                        <SectionCard title="Identity & Personal" icon={<User size={24} />}>
                          <div className="grid md:grid-cols-4 gap-6">
                            <InputCard label="Mother Tongue Name" value={studentProfile.studentNameMotherTongue} onChange={(e)=>updateStudentField("studentNameMotherTongue", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Father's Name" value={studentProfile.fatherName} onChange={(e)=>updateStudentField("fatherName", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Date of Birth" value={studentProfile.dob?.substring(0,10)} onChange={(e)=>updateStudentField("dob", e.target.value)} isEditing={isEditingPersonal} type="date" />
                            <InputCard label="Age" value={studentProfile.age} onChange={(e)=>updateStudentField("age", e.target.value)} isEditing={isEditingPersonal} type="number" />
                            <InputCard label="Gender" value={studentProfile.gender} onChange={(e)=>updateStudentField("gender", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Nationality" value={studentProfile.nationality} onChange={(e)=>updateStudentField("nationality", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Aadhar No" value={studentProfile.aadharNo} onChange={(e)=>updateStudentField("aadharNo", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="WhatsApp" value={studentProfile.whatsapp} onChange={(e)=>updateStudentField("whatsapp", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="KCET Reg No" value={studentProfile.kcetRegNo} onChange={(e)=>updateStudentField("kcetRegNo", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="NEET Reg No" value={studentProfile.neetRegNo} onChange={(e)=>updateStudentField("neetRegNo", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="APAAR ID" value={studentProfile.apaarId} onChange={(e)=>updateStudentField("apaarId", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Religion" value={studentProfile.religion} onChange={(e)=>updateStudentField("religion", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Community" value={studentProfile.community} onChange={(e)=>updateStudentField("community", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Marital Status" value={studentProfile.maritalStatus} onChange={(e)=>updateStudentField("maritalStatus", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="English Fluency" value={studentProfile.englishFluency} onChange={(e)=>updateStudentField("englishFluency", e.target.value)} isEditing={isEditingPersonal} />
                          </div>
                        </SectionCard>

                        <SectionCard title="Contact & Address" icon={<MapPin size={24} />}>
                          <div className="grid md:grid-cols-5 gap-6">
                            <InputCard label="Village" value={studentProfile.address?.village} onChange={(e)=>updateStudentAddress("village", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Post" value={studentProfile.address?.post} onChange={(e)=>updateStudentAddress("post", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Taluk" value={studentProfile.address?.taluk} onChange={(e)=>updateStudentAddress("taluk", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="District" value={studentProfile.address?.district} onChange={(e)=>updateStudentAddress("district", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="PIN" value={studentProfile.address?.pin} onChange={(e)=>updateStudentAddress("pin", e.target.value)} isEditing={isEditingPersonal} />
                          </div>
                        </SectionCard>

                        <SectionCard title="Banking Information" icon={<CreditCard size={24} />}>
                          <div className="grid md:grid-cols-4 gap-6">
                            <InputCard label="Account Holder" value={studentProfile.bankDetails?.accountHolderName} onChange={(e)=>updateStudentBank("accountHolderName", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Account No" value={studentProfile.bankDetails?.accountNumber} onChange={(e)=>updateStudentBank("accountNumber", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="IFSC Code" value={studentProfile.bankDetails?.ifscCode} onChange={(e)=>updateStudentBank("ifscCode", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Bank & Branch" value={studentProfile.bankDetails?.bankNameBranch} onChange={(e)=>updateStudentBank("bankNameBranch", e.target.value)} isEditing={isEditingPersonal} />
                          </div>
                        </SectionCard>
                      </div>
                    )}

                    {childEditorTab === "academic" && (
                      <div className="space-y-12">
                        <SectionCard title="SSLC Records" icon={<GraduationCap size={24} />}>
                          <div className="grid md:grid-cols-3 gap-6 mb-10">
                            <InputCard label="Register No" value={studentProfile.sslcDetails?.registerNo} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, registerNo: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Year Of Passing" value={studentProfile.sslcDetails?.yearOfPassing} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, yearOfPassing: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="School Name" value={studentProfile.sslcDetails?.schoolName} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, schoolName: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Place" value={studentProfile.sslcDetails?.placeOfSchool} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, placeOfSchool: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Board" value={studentProfile.sslcDetails?.boardOfExamination} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, boardOfExamination: e.target.value})} isEditing={isEditingPersonal} />
                          </div>
                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Mark Registry</h4>
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("sslcSubjects", {subject: "", totalMark: "", securedMark: ""})} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl">Add Entry</button>}
                            </div>
                            <table className="w-full text-sm">
                              <thead><tr className="text-slate-400 border-b border-slate-200">
                                <th className="pb-3 text-left">Subject</th><th className="pb-3 text-left">Total</th><th className="pb-3 text-left">Secured</th>{isEditingPersonal && <th></th>}
                              </tr></thead>
                              <tbody>{studentProfile.sslcSubjects?.map((s, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0">
                                  <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={s.subject} onChange={(e)=>updateStudentArray("sslcSubjects", i, "subject", e.target.value)} /></td>
                                  <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={s.totalMark} onChange={(e)=>updateStudentArray("sslcSubjects", i, "totalMark", e.target.value)} /></td>
                                  <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={s.securedMark} onChange={(e)=>updateStudentArray("sslcSubjects", i, "securedMark", e.target.value)} /></td>
                                  {isEditingPersonal && <td className="text-right"><button onClick={()=>removeStudentArrayItem("sslcSubjects", i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>}
                                </tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </SectionCard>

                        <SectionCard title="HSC / PU Records" icon={<BookOpen size={24} />}>
                          <div className="grid md:grid-cols-3 gap-6 mb-10">
                            <InputCard label="Register No" value={studentProfile.hscDetails?.registerNo} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, registerNo: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Year Of Passing" value={studentProfile.hscDetails?.yearOfPassing} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, yearOfPassing: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="School Name" value={studentProfile.hscDetails?.schoolName} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, schoolName: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Place" value={studentProfile.hscDetails?.placeOfSchool} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, placeOfSchool: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Board" value={studentProfile.hscDetails?.boardOfExamination} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, boardOfExamination: e.target.value})} isEditing={isEditingPersonal} />
                          </div>
                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <div className="flex justify-between items-center mb-6">
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Mark Registry</h4>
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("hscSubjects", {subject: "", totalMark: "", securedMark: ""})} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl">Add Entry</button>}
                            </div>
                            <table className="w-full text-sm">
                              <thead><tr className="text-slate-400 border-b border-slate-200">
                                <th className="pb-3 text-left">Subject</th><th className="pb-3 text-left">Total</th><th className="pb-3 text-left">Secured</th>{isEditingPersonal && <th></th>}
                              </tr></thead>
                              <tbody>{studentProfile.hscSubjects?.map((s, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0">
                                  <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={s.subject} onChange={(e)=>updateStudentArray("hscSubjects", i, "subject", e.target.value)} /></td>
                                  <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={s.totalMark} onChange={(e)=>updateStudentArray("hscSubjects", i, "totalMark", e.target.value)} /></td>
                                  <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={s.securedMark} onChange={(e)=>updateStudentArray("hscSubjects", i, "securedMark", e.target.value)} /></td>
                                  {isEditingPersonal && <td className="text-right"><button onClick={()=>removeStudentArrayItem("hscSubjects", i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>}
                                </tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </SectionCard>

                        <SectionCard title="Educational History" icon={<History size={24} />}>
                           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <div className="flex justify-between items-center mb-6">
                               <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Academic Timeline</h4>
                               {isEditingPersonal && <button onClick={()=>addStudentArrayItem("educationBackground", {examinationPassed: "", instituteName: "", yearOfPassing: "", marksPercentage: ""})} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl">Add Entry</button>}
                             </div>
                             <div className="overflow-x-auto">
                               <table className="w-full text-sm">
                                 <thead><tr className="text-slate-400 border-b border-slate-200">
                                   <th className="pb-3 text-left">Exam</th><th className="pb-3 text-left">Institute</th><th className="pb-3 text-left">Year</th><th className="pb-3 text-left">%</th>{isEditingPersonal && <th></th>}
                                 </tr></thead>
                                 <tbody>{studentProfile.educationBackground?.map((e, i) => (
                                   <tr key={i} className="border-b border-slate-50 last:border-0">
                                     <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={e.examinationPassed} onChange={(ev)=>updateStudentArray("educationBackground", i, "examinationPassed", ev.target.value)} /></td>
                                     <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-full outline-none" value={e.instituteName} onChange={(ev)=>updateStudentArray("educationBackground", i, "instituteName", ev.target.value)} /></td>
                                     <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-20 outline-none" value={e.yearOfPassing} onChange={(ev)=>updateStudentArray("educationBackground", i, "yearOfPassing", ev.target.value)} /></td>
                                     <td className="py-3"><input disabled={!isEditingPersonal} className="bg-transparent font-bold w-20 outline-none" value={e.marksPercentage} onChange={(ev)=>updateStudentArray("educationBackground", i, "marksPercentage", ev.target.value)} /></td>
                                     {isEditingPersonal && <td className="text-right"><button onClick={()=>removeStudentArrayItem("educationBackground", i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>}
                                   </tr>
                                 ))}</tbody>
                               </table>
                             </div>
                           </div>
                        </SectionCard>
                      </div>
                    )}

                    {childEditorTab === "family" && (
                      <div className="space-y-8">
                        <SectionCard title="Family Connections" icon={<Users size={24} />}>
                           <div className="grid md:grid-cols-2 gap-8 mt-6">
                              {studentProfile.familyBackground?.map((f, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative group/card">
                                  {isEditingPersonal && <button onClick={()=>removeStudentArrayItem("familyBackground", i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"><Trash2 size={16} /></button>}
                                  <div className="grid grid-cols-2 gap-6">
                                    <InputCard label="Relation" value={f.relationship} onChange={(e)=>updateStudentArray("familyBackground", i, "relationship", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Name" value={f.name} onChange={(e)=>updateStudentArray("familyBackground", i, "name", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Occupation" value={f.occupation} onChange={(e)=>updateStudentArray("familyBackground", i, "occupation", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Phone" value={f.phone} onChange={(e)=>updateStudentArray("familyBackground", i, "phone", e.target.value)} isEditing={isEditingPersonal} />
                                  </div>
                                </div>
                              ))}
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("familyBackground", {relationship: "", name: "", occupation: "", phone: ""})} className="border-2 border-dashed border-slate-300 rounded-[2rem] p-8 text-slate-400 font-black hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-4">
                                <Plus size={24} /> Add Member
                              </button>}
                           </div>
                        </SectionCard>
                      </div>
                    )}

                    {childEditorTab === "references" && (
                      <div className="space-y-8">
                        <SectionCard title="Personal References" icon={<Shield size={24} />}>
                           <div className="grid md:grid-cols-2 gap-8 mt-6">
                              {studentProfile.references?.map((r, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative group/card">
                                  {isEditingPersonal && <button onClick={()=>removeStudentArrayItem("references", i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"><Trash2 size={16} /></button>}
                                  <div className="grid grid-cols-2 gap-6">
                                    <InputCard label="Reference Name" value={r.name} onChange={(e)=>updateStudentArray("references", i, "name", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Contact Mobile" value={r.mobile} onChange={(e)=>updateStudentArray("references", i, "mobile", e.target.value)} isEditing={isEditingPersonal} />
                                  </div>
                                </div>
                              ))}
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("references", {name: "", mobile: ""})} className="border-2 border-dashed border-slate-300 rounded-[2rem] p-8 text-slate-400 font-black hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-4">
                                <Plus size={24} /> Add Reference
                              </button>}
                           </div>
                        </SectionCard>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Employee View */}
              {employeeProfile && (
                <div className="space-y-12">
                  <SectionCard title="Professional Overview" icon={<Briefcase size={24} />}>
                    <div className="grid md:grid-cols-4 gap-8">
                      <InputCard label="First Name" value={employeeProfile.firstName} onChange={(e)=>updateEmployeeField("firstName", e.target.value)} isEditing={isEditingPersonal} />
                      <InputCard label="Last Name" value={employeeProfile.lastName} onChange={(e)=>updateEmployeeField("lastName", e.target.value)} isEditing={isEditingPersonal} />
                      <InputCard label="Mobile (Professional)" value={employeeProfile.phone} onChange={(e)=>updateEmployeeField("phone", e.target.value)} isEditing={isEditingPersonal} />
                      <InputCard label="User ID" value={employeeProfile.employeeId} isEditing={false} />
                      <InputCard label="Core Department" value={employeeProfile.department} isEditing={false} />
                      <InputCard label="Role Title" value={employeeProfile.designation} isEditing={false} />
                      <InputCard label="Joined On" value={employeeProfile.joiningDate?.substring(0,10)} isEditing={false} />
                      <InputCard label="Assigned Gender" value={employeeProfile.gender} onChange={(e)=>updateEmployeeField("gender", e.target.value)} isEditing={isEditingPersonal} />
                    </div>
                  </SectionCard>
                </div>
              )}
            </div>
          )}

          {activeTab === "children" && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
               {!selectedChildId ? (
                 <div className="grid md:grid-cols-3 gap-8">
                   {children.map(child => (
                     <div key={child._id} className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform"></div>
                       <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                         {child.studentNameEnglish?.charAt(0)}
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 mb-2">{child.studentNameEnglish}</h3>
                       <p className="text-slate-500 text-sm font-bold flex items-center gap-2 mb-6">
                         <BookOpen size={16} /> {child.course || "No Course Linked"}
                       </p>
                       <div className="grid grid-cols-2 gap-4 text-xs font-black uppercase tracking-tighter text-slate-400 mb-8">
                          <div><span className="block mb-1">WhatsApp</span><span className="text-slate-800">{child.whatsapp || "N/A"}</span></div>
                          <div><span className="block mb-1">Status</span><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg">{child.status}</span></div>
                       </div>
                       <button 
                         onClick={() => openChildEditor(child)}
                         className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 shadow-xl transition-all"
                       >
                         Manage Record
                       </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center font-black text-3xl rotate-3">
                                {childData.studentNameEnglish?.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter">{childData.studentNameEnglish}</h2>
                                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Comprehensive Student Record Editor</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedChildId(null)} className="p-4 bg-slate-800 hover:bg-red-500 text-white rounded-2xl transition-all">
                            <X size={28} />
                        </button>
                    </div>

                    {/* Modal Internal Nav */}
                    <div className="flex px-8 py-4 bg-slate-50 gap-4 overflow-x-auto">
                        {["personal", "academic", "family", "references"].map(tab => (
                            <button 
                              key={tab}
                              onClick={() => setChildEditorTab(tab)}
                              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${childEditorTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-10 max-h-[70vh] overflow-y-auto">
                        {childEditorTab === "personal" && (
                            <div className="grid md:grid-cols-3 gap-8">
                                <InputCard label="Name (English)" value={childData.studentNameEnglish} onChange={(e)=>updateChildField("studentNameEnglish", e.target.value)} isEditing={true} />
                                <InputCard label="Name (Mother Tongue)" value={childData.studentNameMotherTongue} onChange={(e)=>updateChildField("studentNameMotherTongue", e.target.value)} isEditing={true} />
                                <InputCard label="Father's Name" value={childData.fatherName} onChange={(e)=>updateChildField("fatherName", e.target.value)} isEditing={true} />
                                <InputCard label="DOB" value={childData.dob} onChange={(e)=>updateChildField("dob", e.target.value)} isEditing={true} type="date" />
                                <InputCard label="Age" value={childData.age} onChange={(e)=>updateChildField("age", e.target.value)} isEditing={true} type="number" />
                                <InputCard label="Gender" value={childData.gender} onChange={(e)=>updateChildField("gender", e.target.value)} isEditing={true} />
                                <InputCard label="Nationality" value={childData.nationality} onChange={(e)=>updateChildField("nationality", e.target.value)} isEditing={true} />
                                <InputCard label="Aadhar No" value={childData.aadharNo} onChange={(e)=>updateChildField("aadharNo", e.target.value)} isEditing={true} />
                                <InputCard label="Religion" value={childData.religion} onChange={(e)=>updateChildField("religion", e.target.value)} isEditing={true} />
                                <InputCard label="Community" value={childData.community} onChange={(e)=>updateChildField("community", e.target.value)} isEditing={true} />
                                <InputCard label="Marital Status" value={childData.maritalStatus} onChange={(e)=>updateChildField("maritalStatus", e.target.value)} isEditing={true} />
                                <InputCard label="KCET Reg No" value={childData.kcetRegNo} onChange={(e)=>updateChildField("kcetRegNo", e.target.value)} isEditing={true} />
                                <InputCard label="NEET Reg No" value={childData.neetRegNo} onChange={(e)=>updateChildField("neetRegNo", e.target.value)} isEditing={true} />
                                <InputCard label="APAAR ID" value={childData.apaarId} onChange={(e)=>updateChildField("apaarId", e.target.value)} isEditing={true} />
                                <InputCard label="DEB ID" value={childData.debId} onChange={(e)=>updateChildField("debId", e.target.value)} isEditing={true} />
                                <InputCard label="ABC ID" value={childData.abcId} onChange={(e)=>updateChildField("abcId", e.target.value)} isEditing={true} />
                                <InputCard label="WhatsApp" value={childData.whatsapp} onChange={(e)=>updateChildField("whatsapp", e.target.value)} isEditing={true} />
                                <InputCard label="Email" value={childData.email} onChange={(e)=>updateChildField("email", e.target.value)} isEditing={true} />
                                <InputCard label="English Fluency" value={childData.englishFluency} onChange={(e)=>updateChildField("englishFluency", e.target.value)} isEditing={true} />
                                <InputCard label="Languages (Comma Separated)" value={childData.languagesKnown?.join(", ")} onChange={(e)=>updateChildField("languagesKnown", e.target.value.split(",").map(l=>l.trim()))} isEditing={true} />
                                <div className="col-span-full border-t pt-8 mt-4 grid md:grid-cols-5 gap-4">
                                    <h4 className="col-span-full font-black text-slate-400 uppercase tracking-widest text-[10px] mb-2">Permanent Address</h4>
                                    <InputCard label="Village" value={childData.address?.village} onChange={(e)=>updateChildAddress("village", e.target.value)} isEditing={true} />
                                    <InputCard label="Post" value={childData.address?.post} onChange={(e)=>updateChildAddress("post", e.target.value)} isEditing={true} />
                                    <InputCard label="Taluk" value={childData.address?.taluk} onChange={(e)=>updateChildAddress("taluk", e.target.value)} isEditing={true} />
                                    <InputCard label="District" value={childData.address?.district} onChange={(e)=>updateChildAddress("district", e.target.value)} isEditing={true} />
                                    <InputCard label="PIN" value={childData.address?.pin} onChange={(e)=>updateChildAddress("pin", e.target.value)} isEditing={true} />
                                </div>
                                <div className="col-span-full border-t pt-8 mt-4 grid md:grid-cols-4 gap-4">
                                    <h4 className="col-span-full font-black text-slate-400 uppercase tracking-widest text-[10px] mb-2">Bank Details</h4>
                                    <InputCard label="Holder Name" value={childData.bankDetails?.accountHolderName} onChange={(e)=>updateChildBank("accountHolderName", e.target.value)} isEditing={true} />
                                    <InputCard label="Account No" value={childData.bankDetails?.accountNumber} onChange={(e)=>updateChildBank("accountNumber", e.target.value)} isEditing={true} />
                                    <InputCard label="IFSC" value={childData.bankDetails?.ifscCode} onChange={(e)=>updateChildBank("ifscCode", e.target.value)} isEditing={true} />
                                    <InputCard label="Bank & Branch" value={childData.bankDetails?.bankNameBranch} onChange={(e)=>updateChildBank("bankNameBranch", e.target.value)} isEditing={true} />
                                </div>
                            </div>
                        )}

                        {childEditorTab === "academic" && (
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-xl font-black mb-6">SSLC Details</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <InputCard label="Reg No" value={childData.sslcDetails?.registerNo} onChange={(e)=>updateChildField("sslcDetails", {...childData.sslcDetails, registerNo: e.target.value})} isEditing={true} />
                                        <InputCard label="Year" value={childData.sslcDetails?.yearOfPassing} onChange={(e)=>updateChildField("sslcDetails", {...childData.sslcDetails, yearOfPassing: e.target.value})} isEditing={true} />
                                        <InputCard label="School" value={childData.sslcDetails?.schoolName} onChange={(e)=>updateChildField("sslcDetails", {...childData.sslcDetails, schoolName: e.target.value})} isEditing={true} />
                                        <InputCard label="Place" value={childData.sslcDetails?.placeOfSchool} onChange={(e)=>updateChildField("sslcDetails", {...childData.sslcDetails, placeOfSchool: e.target.value})} isEditing={true} />
                                        <InputCard label="Board" value={childData.sslcDetails?.boardOfExamination} onChange={(e)=>updateChildField("sslcDetails", {...childData.sslcDetails, boardOfExamination: e.target.value})} isEditing={true} />
                                    </div>
                                    <div className="mt-8 border bg-slate-50 rounded-3xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">SSLC Subjects</h4>
                                            <button onClick={()=>addChildArrayItem("sslcSubjects", {subject: "", totalMark: "", securedMark: ""})} className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg">Add Subject</button>
                                        </div>
                                        <table className="w-full">
                                            <thead><tr className="text-xs text-slate-400 text-left border-b border-slate-200">
                                              <th className="pb-3 px-2">Subject</th><th className="pb-3 px-2">Total</th><th className="pb-3 px-2">Secured</th><th className="pb-3 px-2"></th>
                                            </tr></thead>
                                            <tbody>{childData.sslcSubjects?.map((s, i) => (
                                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                                  <td className="py-2 px-2"><input className="bg-transparent font-bold w-full outline-none" value={s.subject} onChange={(e)=>updateChildArray("sslcSubjects", i, "subject", e.target.value)} /></td>
                                                  <td className="py-2 px-2"><input className="bg-transparent font-bold w-20 outline-none" value={s.totalMark} onChange={(e)=>updateChildArray("sslcSubjects", i, "totalMark", e.target.value)} /></td>
                                                  <td className="py-2 px-2"><input className="bg-transparent font-bold w-20 outline-none" value={s.securedMark} onChange={(e)=>updateChildArray("sslcSubjects", i, "securedMark", e.target.value)} /></td>
                                                  <td className="py-2 px-2 text-right"><button onClick={()=>removeChildArrayItem("sslcSubjects", i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black mb-6">HSC / PU Details</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <InputCard label="Reg No" value={childData.hscDetails?.registerNo} onChange={(e)=>updateChildField("hscDetails", {...childData.hscDetails, registerNo: e.target.value})} isEditing={true} />
                                        <InputCard label="Year" value={childData.hscDetails?.yearOfPassing} onChange={(e)=>updateChildField("hscDetails", {...childData.hscDetails, yearOfPassing: e.target.value})} isEditing={true} />
                                        <InputCard label="School" value={childData.hscDetails?.schoolName} onChange={(e)=>updateChildField("hscDetails", {...childData.hscDetails, schoolName: e.target.value})} isEditing={true} />
                                        <InputCard label="Place" value={childData.hscDetails?.placeOfSchool} onChange={(e)=>updateChildField("hscDetails", {...childData.hscDetails, placeOfSchool: e.target.value})} isEditing={true} />
                                        <InputCard label="Board" value={childData.hscDetails?.boardOfExamination} onChange={(e)=>updateChildField("hscDetails", {...childData.hscDetails, boardOfExamination: e.target.value})} isEditing={true} />
                                    </div>
                                    <div className="mt-8 border bg-slate-50 rounded-3xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">HSC Subjects</h4>
                                            <button onClick={()=>addChildArrayItem("hscSubjects", {subject: "", totalMark: "", securedMark: ""})} className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg">Add Subject</button>
                                        </div>
                                        <table className="w-full">
                                            <thead><tr className="text-xs text-slate-400 text-left border-b border-slate-200">
                                              <th className="pb-3 px-2">Subject</th><th className="pb-3 px-2">Total</th><th className="pb-3 px-2">Secured</th><th className="pb-3 px-2"></th>
                                            </tr></thead>
                                            <tbody>{childData.hscSubjects?.map((s, i) => (
                                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                                  <td className="py-2 px-2"><input className="bg-transparent font-bold w-full outline-none" value={s.subject} onChange={(e)=>updateChildArray("hscSubjects", i, "subject", e.target.value)} /></td>
                                                  <td className="py-2 px-2"><input className="bg-transparent font-bold w-20 outline-none" value={s.totalMark} onChange={(e)=>updateChildArray("hscSubjects", i, "totalMark", e.target.value)} /></td>
                                                  <td className="py-2 px-2"><input className="bg-transparent font-bold w-20 outline-none" value={s.securedMark} onChange={(e)=>updateChildArray("hscSubjects", i, "securedMark", e.target.value)} /></td>
                                                  <td className="py-2 px-2 text-right"><button onClick={()=>removeChildArrayItem("hscSubjects", i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black mb-6">Edu Background</h3>
                                    <div className="border bg-slate-50 rounded-3xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">History</h4>
                                            <button onClick={()=>addChildArrayItem("educationBackground", {examinationPassed: "", instituteName: "", yearOfPassing: "", marksPercentage: ""})} className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg">Add History</button>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <table className="w-full min-w-[600px]">
                                              <thead><tr className="text-xs text-slate-400 text-left border-b border-slate-200">
                                                <th className="pb-3 px-2">Exam</th><th className="pb-3 px-2">Institute</th><th className="pb-3 px-2">Year</th><th className="pb-3 px-2">Percentage</th><th></th>
                                              </tr></thead>
                                              <tbody>{childData.educationBackground?.map((e, i) => (
                                                  <tr key={i} className="border-b border-slate-100 last:border-0">
                                                    <td className="py-2 px-2"><input className="bg-transparent font-bold w-full outline-none" value={e.examinationPassed} onChange={(ev)=>updateChildArray("educationBackground", i, "examinationPassed", ev.target.value)} /></td>
                                                    <td className="py-2 px-2"><input className="bg-transparent font-bold w-full outline-none" value={e.instituteName} onChange={(ev)=>updateChildArray("educationBackground", i, "instituteName", ev.target.value)} /></td>
                                                    <td className="py-2 px-2"><input className="bg-transparent font-bold w-20 outline-none" value={e.yearOfPassing} onChange={(ev)=>updateChildArray("educationBackground", i, "yearOfPassing", ev.target.value)} /></td>
                                                    <td className="py-2 px-2"><input className="bg-transparent font-bold w-20 outline-none" value={e.marksPercentage} onChange={(ev)=>updateChildArray("educationBackground", i, "marksPercentage", ev.target.value)} /></td>
                                                    <td className="py-2 px-2 text-right"><button onClick={()=>removeChildArrayItem("educationBackground", i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                                                  </tr>
                                              ))}</tbody>
                                          </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {childEditorTab === "family" && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black">Family Members</h3>
                                    <button onClick={()=>addChildArrayItem("familyBackground", {relationship: "", name: "", occupation: "", phone: ""})} className="px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl">Add Member</button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {childData.familyBackground?.map((f, i) => (
                                        <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative group/card">
                                            <button onClick={()=>removeChildArrayItem("familyBackground", i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                            <div className="grid grid-cols-2 gap-6">
                                                <InputCard label="Relationship" value={f.relationship} onChange={(e)=>updateChildArray("familyBackground", i, "relationship", e.target.value)} isEditing={true} />
                                                <InputCard label="Name" value={f.name} onChange={(e)=>updateChildArray("familyBackground", i, "name", e.target.value)} isEditing={true} />
                                                <InputCard label="Occupation" value={f.occupation} onChange={(e)=>updateChildArray("familyBackground", i, "occupation", e.target.value)} isEditing={true} />
                                                <InputCard label="Phone" value={f.phone} onChange={(e)=>updateChildArray("familyBackground", i, "phone", e.target.value)} isEditing={true} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {childEditorTab === "references" && (
                            <div className="space-y-8 text-center py-12">
                                <h3 className="text-xl font-black mb-8">Personal References</h3>
                                <div className="max-w-2xl mx-auto space-y-4">
                                {childData.references?.map((r, i) => (
                                    <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <InputCard label="Name" value={r.name} onChange={(e)=>updateChildArray("references", i, "name", e.target.value)} isEditing={true} />
                                        <InputCard label="Mobile" value={r.mobile} onChange={(e)=>updateChildArray("references", i, "mobile", e.target.value)} isEditing={true} />
                                        <button onClick={()=>removeChildArrayItem("references", i)} className="mt-6 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button onClick={()=>addChildArrayItem("references", {name: "", mobile: ""})} className="mt-8 px-10 py-4 border-2 border-dashed border-slate-300 text-slate-400 font-black rounded-3xl hover:bg-slate-50 hover:border-blue-300 hover:text-blue-500 transition-all">Add New Reference +</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 p-8 flex justify-end gap-4 border-t border-slate-100">
                        <button onClick={() => setSelectedChildId(null)} className="px-10 py-4 font-black text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all">
                            Discard
                        </button>
                        <button onClick={saveChildProfile} className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3">
                            <Check size={24} /> Sync & Save All Changes
                        </button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MEGA REUSABLE COMPONENTS ---

const SectionCard = ({ title, icon, children }) => (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-blue-100 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
            {icon}
        </div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
            <span className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg rotate-3">{icon}</span>
            {title}
        </h2>
        {children}
    </div>
);

const InputCard = ({ label, value, onChange, isEditing, type = "text" }) => (
    <div className="space-y-2 group">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        {isEditing ? (
            <input
                type={type}
                value={value || ""}
                onChange={onChange}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700 shadow-inner"
            />
        ) : (
            <div className="px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-800 font-black shadow-sm group-hover:translate-x-1 transition-transform">
                {value || <span className="text-slate-300 font-normal italic">Pending Record</span>}
            </div>
        )}
    </div>
);

export default Profile;
