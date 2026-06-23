import React, { useState, useEffect } from 'react';
import { X, Users, Check, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AssignStudentsModal = ({ batch, onClose, onAssignSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState(
    batch.students ? batch.students.map(s => typeof s === 'object' ? s._id : s) : []
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students');
        const studentsList = response.data.students || [];
        // Filter students enrolled in the same course as the batch
        const filteredStudents = studentsList.filter(st => {
          if (!st.enrolledCourses) return false;
          return st.enrolledCourses.some(ec => 
            ec.course && 
            (typeof ec.course === 'object' ? ec.course._id : ec.course) === 
            (typeof batch.course === 'object' ? batch.course._id : batch.course)
          );
        });
        setStudents(filteredStudents);
      } catch (error) {
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [batch]);

  const toggleStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredList.map(s => s._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/batches/${batch._id}/assign-students`, {
        studentIds: selectedStudentIds
      });
      toast.success("Students assigned successfully");
      onAssignSuccess(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign students");
    }
  };

  const filteredList = students.filter(s => 
    s.studentNameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-start justify-center p-4 py-10">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl scale-in-center">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assign Students
              </h2>
              <p className="text-sm text-gray-500 font-medium">Batch: {batch.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <input 
            type="text" 
            placeholder="Search students..." 
            className="rounded-xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2 text-sm w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="button"
            onClick={handleSelectAll}
            className="text-sm font-medium text-brand-600 hover:text-brand-800"
          >
            {selectedStudentIds.length === filteredList.length && filteredList.length > 0 ? "Deselect All" : "Select All"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-xl bg-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading students...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No students found enrolled in this course.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredList.map(st => {
                  const isSelected = selectedStudentIds.includes(st._id);
                  return (
                    <div 
                      key={st._id} 
                      onClick={() => toggleStudent(st._id)}
                      className={`p-3 flex items-center gap-4 cursor-pointer hover:bg-white transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{st.studentNameEnglish}</div>
                        <div className="text-xs text-gray-500">{st.studentId}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm font-medium text-gray-600">
              Selected: <span className="text-indigo-600 font-bold">{selectedStudentIds.length}</span> / {students.length}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 shadow-md shadow-brand-200 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <Save size={16} /> Save Assignment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStudentsModal;
