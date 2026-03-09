import React, { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const RegisterChild = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    studentNameEnglish: "",
    studentNameMotherTongue: "",
    dob: "",
    age: "",
    fatherName: "",
    gender: "",
    nationality: "",
    aadharNo: "",
    kcetRegNo: "",
    neetRegNo: "",
    apaarId: "",
    debId: "",
    abcId: "",
    religion: "",
    community: "",
    maritalStatus: "",
    village: "",
    post: "",
    taluk: "",
    district: "",
    pin: "",
    whatsapp: "",
    email: "",
    englishFluency: "",
    language1: "",
    language2: "",
    language3: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankNameBranch: ""
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? value : value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ EMAIL VALIDATION HERE
  if (!formData.email || formData.email.trim() === "") {
    toast.error("Email is required");
    return;
  }

  // Optional: Proper email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.error("Enter valid email address");
    return;
  }

  setLoading(true);

  try {
    await api.post("/parent/register-child", formData);
    toast.success("Child Registered Successfully");
    navigate("/dashboard/parent-dashboard");
  } catch (err) {
    toast.error("Registration Failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Registration Form</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow">

        {/* PERSONAL DETAILS */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            1. Personal Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <Input label="Name of Student (English)" name="studentNameEnglish" value={formData.studentNameEnglish} onChange={handleChange} />
            <Input label="Name of Student (Mother Tongue)" name="studentNameMotherTongue" value={formData.studentNameMotherTongue} onChange={handleChange} />

            <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
            <Input label="Age" name="age" value={formData.age} onChange={handleChange} />

            <Input label="Father / Mother Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />

            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}
              options={["Male", "Female", "Other"]} />

            <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
            <Input label="Aadhar No" name="aadharNo" value={formData.aadharNo} onChange={handleChange} />

            <Input label="KCET Reg No" name="kcetRegNo" value={formData.kcetRegNo} onChange={handleChange} />
            <Input label="NEET Reg No" name="neetRegNo" value={formData.neetRegNo} onChange={handleChange} />
            <Input label="APAAR ID Reg No" name="apaarId" value={formData.apaarId} onChange={handleChange} />
            <Input label="DEB Unique ID No" name="debId" value={formData.debId} onChange={handleChange} />
            <Input label="ABC ID No" name="abcId" value={formData.abcId} onChange={handleChange} />

            <Select label="Religion" name="religion" value={formData.religion} onChange={handleChange}
              options={["Hindu", "Muslim", "Christian", "Others"]} />

            <Select label="Community" name="community" value={formData.community} onChange={handleChange}
              options={["MBC", "OC", "OBC", "BC", "SC", "ST", "Others"]} />

            <Select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
              options={["Married", "Unmarried"]} />

          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Address for Correspondence
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Village" name="village" value={formData.village} onChange={handleChange} />
            <Input label="Post" name="post" value={formData.post} onChange={handleChange} />
            <Input label="Taluk" name="taluk" value={formData.taluk} onChange={handleChange} />
            <Input label="District" name="district" value={formData.district} onChange={handleChange} />
            <Input label="PIN Code" name="pin" value={formData.pin} onChange={handleChange} />
            <Input label="Whatsapp Number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
            <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} />
          </div>
        </div>

        {/* LANGUAGE */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Language Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Select label="Fluency in English" name="englishFluency" value={formData.englishFluency}
              onChange={handleChange}
              options={["Excellent", "Average", "Below Average"]} />

            <Input label="Language 1" name="language1" value={formData.language1} onChange={handleChange} />
            <Input label="Language 2" name="language2" value={formData.language2} onChange={handleChange} />
            <Input label="Language 3" name="language3" value={formData.language3} onChange={handleChange} />
          </div>
        </div>

        {/* BANK DETAILS */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Bank Account Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} />
            <Input label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
            <Input label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
            <Input label="Bank Name & Branch" name="bankNameBranch" value={formData.bankNameBranch} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded-lg">
            Cancel
          </button>

          <button type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

      </form>
    </div>
  );
};

// Reusable Components
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input {...props} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"/>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select {...props} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
      <option value="">Select</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default RegisterChild;