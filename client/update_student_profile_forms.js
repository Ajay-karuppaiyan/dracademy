import fs from 'fs';

const origPath = 'c:/Users/AJAY/Pictures/Dr-Academy/client/src/pages/profile/Profile.jsx';
let content = fs.readFileSync(origPath, 'utf8');

// The replacement chunk for Student's role
const studentTarget = `{studentProfile && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {childEditorTab === "personal" && (
                      <div className="space-y-8">
                        <SectionCard title="Identity & Demographics" icon={<User size={20} />}>`;

// We want to replace everything from {studentProfile && ( ... up to Employee View
// BUT we can use RegEx to be precise
const regexStudentForm = /\{studentProfile && \(\s*<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">[\s\S]*?\{employeeProfile && \(/;

const studentReplacement = `{studentProfile && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <StudentFormContent 
                          data={studentProfile} 
                          isEditing={isEditingPersonal}
                          activeTab={childEditorTab}
                          handlers={{
                              updateField: updateStudentField,
                              updateAddress: updateStudentAddress,
                              updateBank: updateStudentBank,
                              updateArray: updateStudentArray,
                              addArrayItem: addStudentArrayItem,
                              removeArrayItem: removeStudentArrayItem
                          }}
                          centers={centers}
                      />
                  </div>
                )}

                {/* Employee View */}
                {employeeProfile && (`;

content = content.replace(regexStudentForm, studentReplacement);


// The replacement chunk for Parent's child form
const regexChildForm = /<div className="p-6 sm:px-8 max-h-\[60vh\] overflow-y-auto bg-white">[\s\S]*?\{activeTab === "children" && \(/;

const childReplacement = `<div className="border-b border-gray-200 bg-gray-50 flex shadow-sm">
                        {["personal", "academic", "family", "references"].map(tab => (
                          <button 
                            key={tab}
                            onClick={() => setChildEditorTab(tab)}
                            className={\`flex-1 py-3 text-sm font-medium transition-colors \${childEditorTab === tab ? "bg-white text-indigo-700 border-t-2 border-t-indigo-600 border-x border-x-gray-200 -mb-px" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}\`}
                          >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                    </div>

                    <div className="p-6 sm:px-8 max-h-[60vh] overflow-y-auto bg-white relative">
                      <StudentFormContent 
                          data={childData} 
                          isEditing={true}
                          activeTab={childEditorTab}
                          handlers={{
                              updateField: updateChildField,
                              updateAddress: updateChildAddress,
                              updateBank: updateChildBank,
                              updateArray: updateChildArray,
                              addArrayItem: addChildArrayItem,
                              removeArrayItem: removeChildArrayItem
                          }}
                          centers={centers}
                      />
                    </div>
                 </div>
               )}
            </div>
          )}`;

content = content.replace(/<div className="p-6 sm:px-8 max-h-\[60vh\] overflow-y-auto bg-white">[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}/, childReplacement);


// Build the actual StudentFormContent component
const studentFormComponentStr = `

const StudentFormContent = ({ data, isEditing, activeTab, handlers, centers }) => {
    const { updateField, updateAddress, updateBank, updateArray, addArrayItem, removeArrayItem } = handlers;
    
    return (
        <div className="animate-in fade-in duration-300">
            {activeTab === "personal" && (
                <div className="space-y-8">
                <SectionCard title="Identity & Demographics" icon={<User size={20} />}>
                    <div className="grid md:grid-cols-3 gap-5">
                    <InputCard label="Mother Tongue Name" value={data.studentNameMotherTongue} onChange={(e)=>updateField("studentNameMotherTongue", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Father's Name" value={data.fatherName} onChange={(e)=>updateField("fatherName", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Date of Birth" value={data.dob?.substring(0,10)} onChange={(e)=>updateField("dob", e.target.value)} isEditing={isEditing} type="date" />
                    <InputCard label="Age" value={data.age} onChange={(e)=>updateField("age", e.target.value)} isEditing={isEditing} type="number" />
                    <InputCard label="Gender" value={data.gender} onChange={(e)=>updateField("gender", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Nationality" value={data.nationality} onChange={(e)=>updateField("nationality", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Aadhar No" value={data.aadharNo} onChange={(e)=>updateField("aadharNo", e.target.value)} isEditing={isEditing} />
                    <InputCard label="WhatsApp" value={data.whatsapp} onChange={(e)=>updateField("whatsapp", e.target.value)} isEditing={isEditing} />
                    <InputCard label="KCET Reg No" value={data.kcetRegNo} onChange={(e)=>updateField("kcetRegNo", e.target.value)} isEditing={isEditing} />
                    <InputCard label="NEET Reg No" value={data.neetRegNo} onChange={(e)=>updateField("neetRegNo", e.target.value)} isEditing={isEditing} />
                    <InputCard label="APAAR ID" value={data.apaarId} onChange={(e)=>updateField("apaarId", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Religion" value={data.religion} onChange={(e)=>updateField("religion", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Community" value={data.community} onChange={(e)=>updateField("community", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Marital Status" value={data.maritalStatus} onChange={(e)=>updateField("maritalStatus", e.target.value)} isEditing={isEditing} />
                    <InputCard label="English Fluency" value={data.englishFluency} onChange={(e)=>updateField("englishFluency", e.target.value)} isEditing={isEditing} />
                    
                    <div className="flex flex-col gap-1.5 focus-within:text-indigo-600 transition-colors">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assigned Center</label>
                        {isEditing ? (
                            <select 
                                className="w-full px-3.5 py-2 hover:border-gray-400 bg-white border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-800 text-sm shadow-sm"
                                value={data.center?._id || data.center || ""}
                                onChange={(e) => updateField("center", e.target.value)}
                            >
                                <option value="">Select Center...</option>
                                {centers?.map(c => (
                                    <option key={c._id} value={c._id}>{c.name} - {c.location}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="px-3.5 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-gray-800 text-sm break-words min-h-[38px] flex items-center">
                                {data.center?.name ? \`\${data.center.name} - \${data.center.location}\` : <span className="text-gray-400 italic">Not specified</span>}
                            </div>
                        )}
                    </div>
                    </div>
                </SectionCard>

                <SectionCard title="Contact Address" icon={<MapPin size={20} />}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InputCard label="Village/Area" value={data.address?.village} onChange={(e)=>updateAddress("village", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Post" value={data.address?.post} onChange={(e)=>updateAddress("post", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Taluk" value={data.address?.taluk} onChange={(e)=>updateAddress("taluk", e.target.value)} isEditing={isEditing} />
                    <InputCard label="District" value={data.address?.district} onChange={(e)=>updateAddress("district", e.target.value)} isEditing={isEditing} />
                    <InputCard label="PIN Code" value={data.address?.pin} onChange={(e)=>updateAddress("pin", e.target.value)} isEditing={isEditing} />
                    </div>
                </SectionCard>

                <SectionCard title="Banking Information" icon={<CreditCard size={20} />}>
                    <div className="grid md:grid-cols-2 gap-5">
                    <InputCard label="Account Holder" value={data.bankDetails?.accountHolderName} onChange={(e)=>updateBank("accountHolderName", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Account No" value={data.bankDetails?.accountNumber} onChange={(e)=>updateBank("accountNumber", e.target.value)} isEditing={isEditing} />
                    <InputCard label="IFSC Code" value={data.bankDetails?.ifscCode} onChange={(e)=>updateBank("ifscCode", e.target.value)} isEditing={isEditing} />
                    <InputCard label="Bank & Branch" value={data.bankDetails?.bankNameBranch} onChange={(e)=>updateBank("bankNameBranch", e.target.value)} isEditing={isEditing} />
                    </div>
                </SectionCard>
                </div>
            )}

            {activeTab === "academic" && (
                <div className="space-y-8">
                <SectionCard title="SSLC Records" icon={<GraduationCap size={20} />}>
                    <div className="grid md:grid-cols-3 gap-5 mb-8">
                    <InputCard label="Register No" value={data.sslcDetails?.registerNo} onChange={(e)=>updateField("sslcDetails", {...data.sslcDetails, registerNo: e.target.value})} isEditing={isEditing} />
                    <InputCard label="Year Of Passing" value={data.sslcDetails?.yearOfPassing} onChange={(e)=>updateField("sslcDetails", {...data.sslcDetails, yearOfPassing: e.target.value})} isEditing={isEditing} />
                    <InputCard label="School Name" value={data.sslcDetails?.schoolName} onChange={(e)=>updateField("sslcDetails", {...data.sslcDetails, schoolName: e.target.value})} isEditing={isEditing} />
                    <InputCard label="Place" value={data.sslcDetails?.placeOfSchool} onChange={(e)=>updateField("sslcDetails", {...data.sslcDetails, placeOfSchool: e.target.value})} isEditing={isEditing} />
                    <InputCard label="Board" value={data.sslcDetails?.boardOfExamination} onChange={(e)=>updateField("sslcDetails", {...data.sslcDetails, boardOfExamination: e.target.value})} isEditing={isEditing} />
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mark Registry</h4>
                        {isEditing && <button onClick={()=>addArrayItem("sslcSubjects", {subject: "", totalMark: "", securedMark: ""})} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Add Entry +</button>}
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="bg-white text-gray-400 border-b border-gray-100">
                        <th className="py-2 px-4 text-left font-medium">Subject</th><th className="py-2 px-4 text-left font-medium w-24">Total</th><th className="py-2 px-4 text-left font-medium w-24">Secured</th>{isEditing && <th></th>}
                        </tr></thead>
                        <tbody className="bg-white">{data.sslcSubjects?.map((s, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                            <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.subject} onChange={(e)=>updateArray("sslcSubjects", i, "subject", e.target.value)} /></td>
                            <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.totalMark} onChange={(e)=>updateArray("sslcSubjects", i, "totalMark", e.target.value)} /></td>
                            <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.securedMark} onChange={(e)=>updateArray("sslcSubjects", i, "securedMark", e.target.value)} /></td>
                            {isEditing && <td className="py-2 px-4 text-right"><button onClick={()=>removeArrayItem("sslcSubjects", i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>}
                        </tr>
                        ))}</tbody>
                    </table>
                    </div>
                </SectionCard>

                <SectionCard title="HSC / PU Records" icon={<BookOpen size={20} />}>
                    <div className="grid md:grid-cols-3 gap-5 mb-8">
                    <InputCard label="Register No" value={data.hscDetails?.registerNo} onChange={(e)=>updateField("hscDetails", {...data.hscDetails, registerNo: e.target.value})} isEditing={isEditing} />
                    <InputCard label="Year Of Passing" value={data.hscDetails?.yearOfPassing} onChange={(e)=>updateField("hscDetails", {...data.hscDetails, yearOfPassing: e.target.value})} isEditing={isEditing} />
                    <InputCard label="School Name" value={data.hscDetails?.schoolName} onChange={(e)=>updateField("hscDetails", {...data.hscDetails, schoolName: e.target.value})} isEditing={isEditing} />
                    <InputCard label="Place" value={data.hscDetails?.placeOfSchool} onChange={(e)=>updateField("hscDetails", {...data.hscDetails, placeOfSchool: e.target.value})} isEditing={isEditing} />
                    <InputCard label="Board" value={data.hscDetails?.boardOfExamination} onChange={(e)=>updateField("hscDetails", {...data.hscDetails, boardOfExamination: e.target.value})} isEditing={isEditing} />
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mark Registry</h4>
                        {isEditing && <button onClick={()=>addArrayItem("hscSubjects", {subject: "", totalMark: "", securedMark: ""})} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Add Entry +</button>}
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="bg-white text-gray-400 border-b border-gray-100">
                        <th className="py-2 px-4 text-left font-medium">Subject</th><th className="py-2 px-4 text-left font-medium w-24">Total</th><th className="py-2 px-4 text-left font-medium w-24">Secured</th>{isEditing && <th></th>}
                        </tr></thead>
                        <tbody className="bg-white">{data.hscSubjects?.map((s, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                            <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.subject} onChange={(e)=>updateArray("hscSubjects", i, "subject", e.target.value)} /></td>
                            <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.totalMark} onChange={(e)=>updateArray("hscSubjects", i, "totalMark", e.target.value)} /></td>
                            <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={s.securedMark} onChange={(e)=>updateArray("hscSubjects", i, "securedMark", e.target.value)} /></td>
                            {isEditing && <td className="py-2 px-4 text-right"><button onClick={()=>removeArrayItem("hscSubjects", i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>}
                        </tr>
                        ))}</tbody>
                    </table>
                    </div>
                </SectionCard>

                <SectionCard title="Other Educational History" icon={<History size={20} />}>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Timeline</h4>
                        {isEditing && <button onClick={()=>addArrayItem("educationBackground", {examinationPassed: "", instituteName: "", yearOfPassing: "", marksPercentage: ""})} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Add Entry +</button>}
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="bg-white text-gray-400 border-b border-gray-100">
                            <th className="py-2 px-4 text-left font-medium">Exam</th><th className="py-2 px-4 text-left font-medium">Institute</th><th className="py-2 px-4 text-left font-medium">Year</th><th className="py-2 px-4 text-left font-medium">%</th>{isEditing && <th></th>}
                            </tr></thead>
                            <tbody className="bg-white">{data.educationBackground?.map((e, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={e.examinationPassed} onChange={(ev)=>updateArray("educationBackground", i, "examinationPassed", ev.target.value)} /></td>
                                <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-full outline-none focus:text-indigo-600 font-medium" value={e.instituteName} onChange={(ev)=>updateArray("educationBackground", i, "instituteName", ev.target.value)} /></td>
                                <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-20 outline-none focus:text-indigo-600 font-medium" value={e.yearOfPassing} onChange={(ev)=>updateArray("educationBackground", i, "yearOfPassing", ev.target.value)} /></td>
                                <td className="py-2 px-4"><input disabled={!isEditing} className="bg-transparent text-gray-800 w-20 outline-none focus:text-indigo-600 font-medium" value={e.marksPercentage} onChange={(ev)=>updateArray("educationBackground", i, "marksPercentage", ev.target.value)} /></td>
                                {isEditing && <td className="py-2 px-4 text-right"><button onClick={()=>removeArrayItem("educationBackground", i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>}
                            </tr>
                            ))}</tbody>
                        </table>
                        </div>
                    </div>
                </SectionCard>
                </div>
            )}

            {activeTab === "family" && (
                <div className="space-y-8">
                <SectionCard title="Family Connections" icon={<Users size={20} />}>
                    <div className="flex justify-end mb-4">
                        {isEditing && <button onClick={()=>addArrayItem("familyBackground", {relationship: "", name: "", occupation: "", phone: ""})} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><Plus size={16} /> Add Member</button>}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {data.familyBackground?.map((f, i) => (
                        <div key={i} className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl relative group/card">
                            {isEditing && <button onClick={()=>removeArrayItem("familyBackground", i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                            <div className="grid gap-4">
                            <InputCard label="Relation" value={f.relationship} onChange={(e)=>updateArray("familyBackground", i, "relationship", e.target.value)} isEditing={isEditing} />
                            <InputCard label="Name" value={f.name} onChange={(e)=>updateArray("familyBackground", i, "name", e.target.value)} isEditing={isEditing} />
                            <InputCard label="Occupation" value={f.occupation} onChange={(e)=>updateArray("familyBackground", i, "occupation", e.target.value)} isEditing={isEditing} />
                            <InputCard label="Phone" value={f.phone} onChange={(e)=>updateArray("familyBackground", i, "phone", e.target.value)} isEditing={isEditing} />
                            </div>
                        </div>
                        ))}
                        {(!data.familyBackground || data.familyBackground.length === 0) && <p className="col-span-2 text-gray-400 italic text-sm py-4">No family members listed.</p>}
                    </div>
                </SectionCard>
                </div>
            )}

            {activeTab === "references" && (
                <div className="space-y-8">
                <SectionCard title="Personal References" icon={<Shield size={20} />}>
                    <div className="flex justify-end mb-4">
                        {isEditing && <button onClick={()=>addArrayItem("references", {name: "", mobile: ""})} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><Plus size={16} /> Add Reference</button>}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {data.references?.map((r, i) => (
                        <div key={i} className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl relative group/card">
                            {isEditing && <button onClick={()=>removeArrayItem("references", i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                            <div className="grid gap-4">
                            <InputCard label="Reference Name" value={r.name} onChange={(e)=>updateArray("references", i, "name", e.target.value)} isEditing={isEditing} />
                            <InputCard label="Contact Mobile" value={r.mobile} onChange={(e)=>updateArray("references", i, "mobile", e.target.value)} isEditing={isEditing} />
                            </div>
                        </div>
                        ))}
                        {(!data.references || data.references.length === 0) && <p className="col-span-2 text-gray-400 italic text-sm py-4">No references listed.</p>}
                    </div>
                </SectionCard>
                </div>
            )}
        </div>
    );
};
`;

content = content.replace("export default Profile;", studentFormComponentStr + "\\nexport default Profile;");

fs.writeFileSync(origPath, content);
console.log("Refactored layout and injected StudentFormContent for massive code reuse!");
