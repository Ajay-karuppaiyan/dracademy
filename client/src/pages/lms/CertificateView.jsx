import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Download, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const CertificateView = () => {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const certRef = useRef();

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const { data } = await api.get(`/courses/${courseId}/certificate`);
        setCert(data);
      } catch (error) {
        toast.error("Certificate not found or course not completed");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [courseId, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );

  if (!cert) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* Controls */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 font-bold hover:text-brand-600 transition"
        >
          <ArrowLeft size={20} /> Back to Course
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-slate-800 px-6 py-3 rounded-2xl font-black shadow-sm hover:shadow-md transition"
          >
            <Printer size={20} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div 
        ref={certRef}
        className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-white shadow-2xl overflow-hidden border-[20px] border-double border-slate-900 p-12 flex flex-col items-center text-center font-serif bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-white"
        id="certificate-print-area"
      >
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-[10px] border-l-[10px] border-brand-600 m-4 rounded-tl-3xl opacity-20" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-[10px] border-r-[10px] border-brand-600 m-4 rounded-tr-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-[10px] border-l-[10px] border-brand-600 m-4 rounded-bl-3xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-[10px] border-r-[10px] border-brand-600 m-4 rounded-br-3xl opacity-20" />

        {/* Logo/Header */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-16 w-16 bg-brand-600 rounded-2xl flex items-center justify-center -rotate-12 shadow-xl shadow-brand-600/20">
              <Award size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Dr-Academy</h1>
          </div>
          <div className="h-1 w-24 bg-brand-200 mx-auto rounded-full" />
        </div>

        <div className="mt-16 space-y-6">
          <h2 className="text-2xl uppercase tracking-[0.3em] font-light text-slate-500">Certificate of Completion</h2>
          <p className="text-xl italic text-slate-600">This is to certify that</p>
          <h3 className="text-6xl font-black text-slate-900 border-b-2 border-slate-200 inline-block pb-4 min-w-[400px]">
            {cert.data.studentName}
          </h3>
          <p className="text-xl italic text-slate-600 max-w-xl mx-auto pt-6">
            has successfully fulfilled all requirements and completed the course
          </p>
          <h4 className="text-3xl font-black text-brand-600 tracking-tight">
            "{cert.data.courseTitle}"
          </h4>
        </div>

        {/* Footer/Signatures */}
        <div className="mt-auto mb-12 w-full flex justify-between items-end px-12">
          <div className="text-left space-y-2">
            <p className="border-b border-slate-900 font-bold min-w-[200px] text-lg text-slate-900">
               {cert.data.instructorName}
            </p>
            <p className="text-xs uppercase tracking-widest font-black text-slate-400">Course Instructor</p>
          </div>

          <div className="flex flex-col items-center gap-4">
             <div className="h-24 w-24 border-4 border-slate-100/50 rounded-full flex items-center justify-center opacity-30 select-none pointer-events-none">
                <ShieldCheck size={48} className="text-brand-600" />
             </div>
             <p className="text-[10px] font-mono text-slate-400">ID: {cert.certificateId}</p>
          </div>

          <div className="text-right space-y-2">
            <p className="border-b border-slate-900 font-bold min-w-[200px] text-lg text-slate-900">
               {new Date(cert.data.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs uppercase tracking-widest font-black text-slate-400">Date of Issue</p>
          </div>
        </div>

        {/* Decorative Seal Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
           <Award size={600} />
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          #certificate-print-area { 
            box-shadow: none !important; 
            border: 15px solid #0f172a !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateView;
