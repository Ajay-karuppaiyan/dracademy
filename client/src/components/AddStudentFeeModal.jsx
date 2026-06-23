import React, { useState } from 'react';
import { X, Save, DollarSign } from 'lucide-react';

const AddStudentFeeModal = ({ onClose, onSave, students, centers, courses, batches }) => {
  const [formData, setFormData] = useState({
    student: "",
    center: "",
    course: "",
    batch: "",
    feeType: "Term",
    otherFeeType: "",
    terms: [],
    amount: 0,
    status: "pending"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Add Student Payment</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Student</label>
              <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})}>
                <option value="">Select Student</option>
                {students?.map(s => <option key={s._id} value={s._id}>{s.studentNameEnglish} ({s.studentId})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Center</label>
              <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.center} onChange={e => setFormData({...formData, center: e.target.value})}>
                <option value="">Select Center</option>
                {centers?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
              <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                <option value="">Select Course</option>
                {courses?.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Batch</label>
              <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})}>
                <option value="">Select Batch</option>
                {batches?.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Fee Type</label>
              <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.feeType} onChange={e => setFormData({...formData, feeType: e.target.value})}>
                <option value="Term">Term Fee</option>
                <option value="Exam">Exam Fee</option>
                <option value="Other">Other Fee</option>
              </select>
            </div>
            {formData.feeType === 'Other' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Specify Other Fee</label>
                <input type="text" required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.otherFeeType} onChange={e => setFormData({...formData, otherFeeType: e.target.value})} />
              </div>
            )}
            {formData.feeType !== 'Other' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Term / Installment</label>
                <select className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.terms[0] || ""} onChange={e => setFormData({...formData, terms: e.target.value ? [Number(e.target.value)] : []})}>
                  <option value="">Select Term (Optional)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Term {sem}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Amount (₹)</label>
              <input type="number" required min="0" className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Initial Status</label>
              <select required className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-3 text-sm bg-slate-50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="pending">Pending / Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
              <Save size={18} /> Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentFeeModal;
