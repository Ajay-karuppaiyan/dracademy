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
    profilePic: null,
  });

  const [preview, setPreview] = useState(null);

  // Role Specific Profiles
  const [studentProfile, setStudentProfile] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  // Parent's Children State
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childData, setChildData] = useState({});
  const [childEditorTab, setChildEditorTab] = useState("personal");
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await api.get("/centers");
        setCenters(res.data);
      } catch (err) {
        console.error("Failed to fetch centers:", err);
      }
    };
    fetchCenters();
  }, []);

  useEffect(() => {
    fetchProfile();
    if (authUser?.role === "parent") {
      fetchChildren();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    setPreview(null);
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
        if (!userData.mobile && sRes.data.studentProfile?.whatsapp) {
          setProfileData(prev => ({ ...prev, mobile: sRes.data.studentProfile.whatsapp }));
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, profilePic: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    if (studentProfile) {
        if (name === "name") setStudentProfile({ ...studentProfile, studentNameEnglish: value });
        if (name === "email") setStudentProfile({ ...studentProfile, email: value });
        if (name === "mobile") setStudentProfile({ ...studentProfile, whatsapp: value });
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
    const loadingToast = toast.loading("Updating profile...");
    try {
      let res;
      const data = new FormData();
      
      // Append fields to FormData
      Object.keys(profileData).forEach(key => {
        if (key === "profilePic") {
          if (profileData.profilePic instanceof File) {
            data.append("profilePic", profileData.profilePic);
          }
        } else {
          data.append(key, profileData[key]);
        }
      });

      // Also append student/employee specific fields if needed
      if (authUser?.role === "student" && studentProfile) {
          // Flatten student profile for the backend if it expects top level fields or handle specifically
          // For now, assume the backend can handle the student update via PUT /students/:id
          const studentFormData = new FormData();
          Object.keys(studentProfile || {}).forEach(key => {
            if (key === 'profilePic' && profileData.profilePic instanceof File) {
               studentFormData.append('profilePic', profileData.profilePic);
            } else if (typeof studentProfile[key] === 'object' && studentProfile[key] !== null) {
               // Only send _id for populated objects like center/parent/user
               if (studentProfile[key]._id) {
                 studentFormData.append(key, studentProfile[key]._id);
               }
            } else {
               studentFormData.append(key, studentProfile[key]);
            }
          });
          res = await api.put(`/students/${studentProfile._id}`, studentFormData, {
             headers: { "Content-Type": "multipart/form-data" }
          });
      } else if (employeeProfile) {
          const employeeFormData = new FormData();
          Object.keys(employeeProfile || {}).forEach(key => {
            if (key === 'profilePic' && profileData.profilePic instanceof File) {
               employeeFormData.append('profilePic', profileData.profilePic);
            } else if (typeof (employeeProfile[key]) === 'object' && employeeProfile[key] !== null) {
               // Only send _id for populated objects like center/user
               if (employeeProfile[key]._id) {
                 employeeFormData.append(key, employeeProfile[key]._id);
               }
            } else {
               employeeFormData.append(key, employeeProfile[key]);
            }
          });
          res = await api.put(`/employees/${employeeProfile._id}`, employeeFormData, {
             headers: { "Content-Type": "multipart/form-data" }
          });
      } else {
          res = await api.put("/auth/profile", data, {
             headers: { "Content-Type": "multipart/form-data" }
          });
      }

      const serverData = res.data.user || res.data.employee || res.data.student || res.data;
      const serverUser = serverData.user || serverData;

      const updatedUser = {
        ...authUser,
        name: serverUser.name || profileData.name,
        email: serverUser.email || profileData.email,
        mobile: serverUser.mobile || profileData.mobile,
        profilePic: serverUser.profilePic || serverData.profilePic || authUser.profilePic
      };

      if (setAuthUser) setAuthUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditingPersonal(false);
      await fetchProfile();
      toast.success("Profile updated!", { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", { id: loadingToast });
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

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-indigo-600"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      {/* Cover Header */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 relative">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay flex items-center justify-center overflow-hidden pointer-events-none">
          <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0,0 L100,100 M100,0 L0,100" stroke="currentColor" strokeWidth="0.5" fill="none" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 md:-mt-24">
        {/* Profile Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative z-10">
          <div className="relative group/avatar shrink-0 -mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-lg bg-gray-100 overflow-hidden flex items-center justify-center text-5xl font-bold text-gray-400 relative">
              {preview || studentProfile?.profilePic?.url || employeeProfile?.profilePic?.url ? (
                <img src={preview || studentProfile?.profilePic?.url || employeeProfile?.profilePic?.url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profileData.name.charAt(0)
              )}
              {isEditingPersonal && (
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      <Plus size={24} className="mb-1" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Update</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {profileData.name}
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-100 uppercase tracking-widest self-center">
                    {authUser?.role}
                  </span>
                </h1>
                <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2"><Mail size={16} className="text-gray-400" /> {profileData.email}</span>
                  <span className="flex items-center gap-2"><Phone size={16} className="text-gray-400" /> {profileData.mobile || employeeProfile?.phone || studentProfile?.whatsapp || "No Phone"}</span>
                  {(studentProfile?.center || employeeProfile?.center) && (
                      <span className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {studentProfile?.center?.name || employeeProfile?.center?.name}</span>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                {!isEditingPersonal ? (
                  <button 
                    onClick={() => setIsEditingPersonal(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={savePersonalProfile} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                      <Check size={16} /> Save Settings
                    </button>
                    <button onClick={() => setIsEditingPersonal(false)} className="flex-1 md:flex-none flex justify-center items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b border-gray-200">
           <button
             onClick={() => setActiveTab("personal")}
             className={`px-1 py-3 mr-8 text-sm font-medium transition-colors relative ${activeTab === "personal" ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
           >
             Personal Details
             {activeTab === "personal" && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-lg"></div>}
           </button>
           {authUser?.role === "parent" && (
             <button
               onClick={() => setActiveTab("children")}
               className={`px-1 py-3 text-sm font-medium transition-colors relative ${activeTab === "children" ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
             >
               My Dependents
               {activeTab === "children" && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-lg"></div>}
             </button>
           )}
        </div>

        {/* Tab Contents */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column - Sub nav for Students */}
              <div className="lg:col-span-1 border-r border-gray-200/60 pr-4">
                {studentProfile && (
                  <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 sticky top-24">
                    {["personal", "academic", "family", "references"].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setChildEditorTab(tab)}
                          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${childEditorTab === tab ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
                        </button>
                    ))}
                  </div>
                )}
                {!studentProfile && (
                   <div className="text-sm text-gray-500 italic p-4">Settings & Information</div>
                )}
              </div>

              {/* Right Column - Forms */}
              <div className="lg:col-span-3 space-y-8">
                {/* Always show base Account box */}
                <SectionCard title="Account Details" icon={<User size={20} />}>
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputCard label="Full Name" name="name" value={profileData.name} onChange={handlePersonalChange} isEditing={isEditingPersonal} />
                    <InputCard label="Email Address" name="email" value={profileData.email} onChange={handlePersonalChange} isEditing={isEditingPersonal} type="email" />
                    <InputCard label="Mobile Number" name="mobile" value={profileData.mobile} onChange={handlePersonalChange} isEditing={isEditingPersonal} />
                  </div>
                </SectionCard>

                {/* Role Specific */}
                {studentProfile && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {childEditorTab === "personal" && (
                      <div className="space-y-8">
                        <SectionCard title="Identity & Demographics" icon={<User size={20} />}>
                          <div className="grid md:grid-cols-3 gap-5">
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

                        <SectionCard title="Contact Address" icon={<MapPin size={20} />}>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <InputCard label="Village/Area" value={studentProfile.address?.village} onChange={(e)=>updateStudentAddress("village", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Post" value={studentProfile.address?.post} onChange={(e)=>updateStudentAddress("post", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Taluk" value={studentProfile.address?.taluk} onChange={(e)=>updateStudentAddress("taluk", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="District" value={studentProfile.address?.district} onChange={(e)=>updateStudentAddress("district", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="PIN Code" value={studentProfile.address?.pin} onChange={(e)=>updateStudentAddress("pin", e.target.value)} isEditing={isEditingPersonal} />
                          </div>
                        </SectionCard>

                        <SectionCard title="Banking Information" icon={<CreditCard size={20} />}>
                          <div className="grid md:grid-cols-2 gap-5">
                            <InputCard label="Account Holder" value={studentProfile.bankDetails?.accountHolderName} onChange={(e)=>updateStudentBank("accountHolderName", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Account No" value={studentProfile.bankDetails?.accountNumber} onChange={(e)=>updateStudentBank("accountNumber", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="IFSC Code" value={studentProfile.bankDetails?.ifscCode} onChange={(e)=>updateStudentBank("ifscCode", e.target.value)} isEditing={isEditingPersonal} />
                            <InputCard label="Bank & Branch" value={studentProfile.bankDetails?.bankNameBranch} onChange={(e)=>updateStudentBank("bankNameBranch", e.target.value)} isEditing={isEditingPersonal} />
                          </div>
                        </SectionCard>
                      </div>
                    )}

                    {childEditorTab === "academic" && (
                      <div className="space-y-8">
                        <SectionCard title="SSLC Records" icon={<GraduationCap size={20} />}>
                          <div className="grid md:grid-cols-3 gap-5 mb-8">
                            <InputCard label="Register No" value={studentProfile.sslcDetails?.registerNo} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, registerNo: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Year Of Passing" value={studentProfile.sslcDetails?.yearOfPassing} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, yearOfPassing: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="School Name" value={studentProfile.sslcDetails?.schoolName} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, schoolName: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Place" value={studentProfile.sslcDetails?.placeOfSchool} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, placeOfSchool: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Board" value={studentProfile.sslcDetails?.boardOfExamination} onChange={(e)=>updateStudentField("sslcDetails", {...studentProfile.sslcDetails, boardOfExamination: e.target.value})} isEditing={isEditingPersonal} />
                          </div>
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mark Registry</h4>
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("sslcSubjects", {subject: "", totalMark: "", securedMark: ""})} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Add Entry +</button>}
                            </div>
                            <table className="w-full text-sm">
                              <thead><tr className="bg-white text-gray-400 border-b border-gray-100">
                                <th className="py-2 px-4 text-left font-medium">Subject</th><th className="py-2 px-4 text-left font-medium w-24">Total</th><th className="py-2 px-4 text-left font-medium w-24">Secured</th>{isEditingPersonal && <th></th>}
                              </tr></thead>
                              <tbody className="bg-white">{studentProfile.sslcSubjects?.map((s, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                  <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.subject} onChange={(e)=>updateStudentArray("sslcSubjects", i, "subject", e.target.value)} /></td>
                                  <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.totalMark} onChange={(e)=>updateStudentArray("sslcSubjects", i, "totalMark", e.target.value)} /></td>
                                  <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.securedMark} onChange={(e)=>updateStudentArray("sslcSubjects", i, "securedMark", e.target.value)} /></td>
                                  {isEditingPersonal && <td className="py-2 px-4 text-right"><button onClick={()=>removeStudentArrayItem("sslcSubjects", i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>}
                                </tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </SectionCard>

                        <SectionCard title="HSC / PU Records" icon={<BookOpen size={20} />}>
                          <div className="grid md:grid-cols-3 gap-5 mb-8">
                            <InputCard label="Register No" value={studentProfile.hscDetails?.registerNo} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, registerNo: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Year Of Passing" value={studentProfile.hscDetails?.yearOfPassing} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, yearOfPassing: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="School Name" value={studentProfile.hscDetails?.schoolName} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, schoolName: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Place" value={studentProfile.hscDetails?.placeOfSchool} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, placeOfSchool: e.target.value})} isEditing={isEditingPersonal} />
                            <InputCard label="Board" value={studentProfile.hscDetails?.boardOfExamination} onChange={(e)=>updateStudentField("hscDetails", {...studentProfile.hscDetails, boardOfExamination: e.target.value})} isEditing={isEditingPersonal} />
                          </div>
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                             <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mark Registry</h4>
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("hscSubjects", {subject: "", totalMark: "", securedMark: ""})} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Add Entry +</button>}
                            </div>
                            <table className="w-full text-sm">
                              <thead><tr className="bg-white text-gray-400 border-b border-gray-100">
                                <th className="py-2 px-4 text-left font-medium">Subject</th><th className="py-2 px-4 text-left font-medium w-24">Total</th><th className="py-2 px-4 text-left font-medium w-24">Secured</th>{isEditingPersonal && <th></th>}
                              </tr></thead>
                              <tbody className="bg-white">{studentProfile.hscSubjects?.map((s, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                  <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.subject} onChange={(e)=>updateStudentArray("hscSubjects", i, "subject", e.target.value)} /></td>
                                  <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.totalMark} onChange={(e)=>updateStudentArray("hscSubjects", i, "totalMark", e.target.value)} /></td>
                                  <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.securedMark} onChange={(e)=>updateStudentArray("hscSubjects", i, "securedMark", e.target.value)} /></td>
                                  {isEditingPersonal && <td className="py-2 px-4 text-right"><button onClick={()=>removeStudentArrayItem("hscSubjects", i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>}
                                </tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </SectionCard>

                        <SectionCard title="Other Educational History" icon={<History size={20} />}>
                           <div className="border border-gray-200 rounded-xl overflow-hidden">
                             <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Timeline</h4>
                               {isEditingPersonal && <button onClick={()=>addStudentArrayItem("educationBackground", {examinationPassed: "", instituteName: "", yearOfPassing: "", marksPercentage: ""})} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Add Entry +</button>}
                             </div>
                             <div className="overflow-x-auto">
                               <table className="w-full text-sm">
                                 <thead><tr className="bg-white text-gray-400 border-b border-gray-100">
                                   <th className="py-2 px-4 text-left font-medium">Exam</th><th className="py-2 px-4 text-left font-medium">Institute</th><th className="py-2 px-4 text-left font-medium">Year</th><th className="py-2 px-4 text-left font-medium">%</th>{isEditingPersonal && <th></th>}
                                 </tr></thead>
                                 <tbody className="bg-white">{studentProfile.educationBackground?.map((e, i) => (
                                   <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                     <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={e.examinationPassed} onChange={(ev)=>updateStudentArray("educationBackground", i, "examinationPassed", ev.target.value)} /></td>
                                     <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={e.instituteName} onChange={(ev)=>updateStudentArray("educationBackground", i, "instituteName", ev.target.value)} /></td>
                                     <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-20 outline-none focus:text-indigo-600 font-medium" value={e.yearOfPassing} onChange={(ev)=>updateStudentArray("educationBackground", i, "yearOfPassing", ev.target.value)} /></td>
                                     <td className="py-2 px-4"><input disabled={!isEditingPersonal} className="bg-transparent text-gray-800 w-20 outline-none focus:text-indigo-600 font-medium" value={e.marksPercentage} onChange={(ev)=>updateStudentArray("educationBackground", i, "marksPercentage", ev.target.value)} /></td>
                                     {isEditingPersonal && <td className="py-2 px-4 text-right"><button onClick={()=>removeStudentArrayItem("educationBackground", i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>}
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
                        <SectionCard title="Family Connections" icon={<Users size={20} />}>
                           <div className="flex justify-end mb-4">
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("familyBackground", {relationship: "", name: "", occupation: "", phone: ""})} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><Plus size={16} /> Add Member</button>}
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              {studentProfile.familyBackground?.map((f, i) => (
                                <div key={i} className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl relative group/card">
                                  {isEditingPersonal && <button onClick={()=>removeStudentArrayItem("familyBackground", i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                                  <div className="grid gap-4">
                                    <InputCard label="Relation" value={f.relationship} onChange={(e)=>updateStudentArray("familyBackground", i, "relationship", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Name" value={f.name} onChange={(e)=>updateStudentArray("familyBackground", i, "name", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Occupation" value={f.occupation} onChange={(e)=>updateStudentArray("familyBackground", i, "occupation", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Phone" value={f.phone} onChange={(e)=>updateStudentArray("familyBackground", i, "phone", e.target.value)} isEditing={isEditingPersonal} />
                                  </div>
                                </div>
                              ))}
                              {studentProfile.familyBackground?.length === 0 && <p className="col-span-2 text-gray-400 italic text-sm py-4">No family members listed.</p>}
                           </div>
                        </SectionCard>
                      </div>
                    )}

                    {childEditorTab === "references" && (
                      <div className="space-y-8">
                        <SectionCard title="Personal References" icon={<Shield size={20} />}>
                           <div className="flex justify-end mb-4">
                              {isEditingPersonal && <button onClick={()=>addStudentArrayItem("references", {name: "", mobile: ""})} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><Plus size={16} /> Add Reference</button>}
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              {studentProfile.references?.map((r, i) => (
                                <div key={i} className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl relative group/card">
                                  {isEditingPersonal && <button onClick={()=>removeStudentArrayItem("references", i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                                  <div className="grid gap-4">
                                    <InputCard label="Reference Name" value={r.name} onChange={(e)=>updateStudentArray("references", i, "name", e.target.value)} isEditing={isEditingPersonal} />
                                    <InputCard label="Contact Mobile" value={r.mobile} onChange={(e)=>updateStudentArray("references", i, "mobile", e.target.value)} isEditing={isEditingPersonal} />
                                  </div>
                                </div>
                              ))}
                              {studentProfile.references?.length === 0 && <p className="col-span-2 text-gray-400 italic text-sm py-4">No references listed.</p>}
                           </div>
                        </SectionCard>
                      </div>
                    )}
                  </div>
                )}

                {/* Employee View */}
                {employeeProfile && (
                  <div className="space-y-8">
                    <SectionCard title="Professional Overview" icon={<Briefcase size={20} />}>
                      <div className="grid md:grid-cols-2 gap-5">
                        <InputCard label="First Name" value={employeeProfile.firstName} onChange={(e)=>updateEmployeeField("firstName", e.target.value)} isEditing={isEditingPersonal} />
                        <InputCard label="Last Name" value={employeeProfile.lastName} onChange={(e)=>updateEmployeeField("lastName", e.target.value)} isEditing={isEditingPersonal} />
                        <InputCard label="Mobile (Professional)" value={employeeProfile.phone} onChange={(e)=>updateEmployeeField("phone", e.target.value)} isEditing={isEditingPersonal} />
                        <InputCard label="User ID" value={employeeProfile.employeeId} isEditing={false} />
                        <InputCard label="Core Department" value={employeeProfile.department} isEditing={false} />
                        <InputCard label="Role Title" value={employeeProfile.designation} isEditing={false} />
                        <InputCard label="Joined On" value={employeeProfile.joiningDate?.substring(0,10)} isEditing={false} />
                        <InputCard label="Assigned Gender" value={employeeProfile.gender} onChange={(e)=>updateEmployeeField("gender", e.target.value)} isEditing={isEditingPersonal} />
                        <InputCard label="Assigned Center" value={employeeProfile.center?.name || "No Center"} isEditing={false} />
                      </div>
                    </SectionCard>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "children" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {!selectedChildId ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {children.map(child => (
                     <div key={child._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors flex flex-col">
                       <div className="flex items-center gap-4 mb-5">
                           <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                             {child.studentNameEnglish?.charAt(0)}
                           </div>
                           <div>
                               <h3 className="text-lg font-bold text-gray-900 leading-tight">{child.studentNameEnglish}</h3>
                               <p className="text-gray-500 text-xs font-semibold">{child.course || "No Course Linked"}</p>
                           </div>
                       </div>
                       <div className="flex-1 space-y-2 text-sm mb-6">
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">WhatsApp</span><span className="font-medium text-gray-800">{child.whatsapp || "N/A"}</span></div>
                          <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Center</span><span className="font-medium text-indigo-600">{child.center?.name || "N/A"}</span></div>
                       </div>
                       <button 
                         onClick={() => openChildEditor(child)}
                         className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                       >
                         View Details
                       </button>
                     </div>
                   ))}
                   {children.length === 0 && (
                       <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
                           <Users className="mx-auto mb-3 text-gray-300" size={32} />
                           No children profiles found attached to this account.
                       </div>
                   )}
                 </div>
               ) : (
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="border-b border-gray-200 p-6 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-gray-200 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
                                {childData.studentNameEnglish?.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{childData.studentNameEnglish}</h2>
                                <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Dependent Record</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                           <button onClick={() => setSelectedChildId(null)} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg lg:hover:bg-gray-50 font-medium text-sm transition-colors">
                               Cancel
                           </button>
                           <button onClick={saveChildProfile} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 border border-transparent text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors">
                               Save Record
                           </button>
                        </div>
                    </div>

                    <div className="p-6 sm:px-8 max-h-[60vh] overflow-y-auto bg-white">
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                            <InputCard label="Name (English)" value={childData.studentNameEnglish} onChange={(e)=>updateChildField("studentNameEnglish", e.target.value)} isEditing={true} />
                            <InputCard label="Email" value={childData.email} onChange={(e)=>updateChildField("email", e.target.value)} isEditing={true} type="email" />
                            <InputCard label="Phone / WhatsApp" value={childData.whatsapp} onChange={(e)=>updateChildField("whatsapp", e.target.value)} isEditing={true} />
                            <InputCard label="Date of Birth" value={childData.dob} onChange={(e)=>updateChildField("dob", e.target.value)} isEditing={true} type="date" />
                            <InputCard label="Aadhar No" value={childData.aadharNo} onChange={(e)=>updateChildField("aadharNo", e.target.value)} isEditing={true} />
                            
                            <div className="flex flex-col gap-1.5 focus-within:text-indigo-600 transition-colors">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Center</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-800"
                                    value={childData.center?._id || childData.center || ""}
                                    onChange={(e) => updateChildField("center", e.target.value)}
                                >
                                    <option value="">Select Center...</option>
                                    {centers.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} - {c.location}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                           <h4 className="font-semibold text-gray-800 mb-4">Location</h4>
                           <div className="grid md:grid-cols-3 gap-6">
                              <InputCard label="District" value={childData.address?.district} onChange={(e)=>updateChildAddress("district", e.target.value)} isEditing={true} />
                              <InputCard label="PIN / Zip Code" value={childData.address?.pin} onChange={(e)=>updateChildAddress("pin", e.target.value)} isEditing={true} />
                              <InputCard label="Taluk / Area" value={childData.address?.taluk} onChange={(e)=>updateChildAddress("taluk", e.target.value)} isEditing={true} />
                           </div>
                        </div>
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

// --- LOGICAL UI COMPONENTS ---

const SectionCard = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2.5">
                <span className="text-indigo-600">{icon}</span>
                {title}
            </h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const InputCard = ({ label, value, onChange, isEditing, type = "text" }) => (
    <div className="flex flex-col gap-1.5 focus-within:text-indigo-600 transition-colors">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        {isEditing ? (
            <input
                type={type}
                value={value || ""}
                onChange={onChange}
                className="w-full px-3.5 py-2 hover:border-gray-400 bg-white border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-800 text-sm shadow-sm"
            />
        ) : (
            <div className="px-3.5 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-gray-800 text-sm break-words min-h-[38px] flex items-center">
                {value || <span className="text-gray-400 italic">Not specified</span>}
            </div>
        )}
    </div>
);

export default Profile;
