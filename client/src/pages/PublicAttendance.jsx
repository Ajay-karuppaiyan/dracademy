import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, User, CheckCircle, Search, AlertCircle, ArrowRight, ShieldCheck, Clock, MapPin, X, RefreshCw } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import attendanceBg from "../assets/attendance.png";

const PublicAttendance = () => {
    const [identifier, setIdentifier] = useState("");
    const [person, setPerson] = useState(null);
    const [step, setStep] = useState("verify"); // verify, capture, review
    const [capturedImage, setCapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [marking, setMarking] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [location, setLocation] = useState(null);
    const [snapInfo, setSnapInfo] = useState({ time: null, loc: null });
    const webcamRef = useRef(null);

    // Update time and fetch location
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const locStr = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                    setLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        display: locStr
                    });
                },
                (err) => console.log("Location access denied", err),
                { enableHighAccuracy: true }
            );
        }

        return () => clearInterval(timer);
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!identifier.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.get(`/public-attendance/identify/${identifier.trim()}`);
            setPerson(data);
            setStep("capture");
            toast.success("Identity Verified!");
        } catch (err) {
            toast.error(err.response?.data?.message || "ID not found");
        } finally {
            setLoading(false);
        }
    };

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setSnapInfo({
                time: currentTime.toLocaleTimeString([], { hour12: true }),
                loc: location?.display || "Location Hidden"
            });
            setStep("review");
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setSnapInfo({ time: null, loc: null });
        setStep("capture");
    };

    const submitAttendance = async () => {
        if (!person || !capturedImage || marking) return;

        setMarking(true);
        try {
            const loginTime = currentTime.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            await api.post("/public-attendance/mark", {
                userId: person.userId,
                name: person.name,
                role: person.role,
                loginTime: loginTime,
                photo: capturedImage,
                location: location ? { lat: location.lat, lng: location.lng } : null
            });

            toast.success("Attendance marked successfully!", { duration: 5000 });

            // Reset to start
            setIdentifier("");
            setPerson(null);
            setCapturedImage(null);
            setSnapInfo({ time: null, loc: null });
            setStep("verify");

        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark attendance");
        } finally {
            setMarking(false);
        }
    };

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const placeholderImg = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    const bgUrl = attendanceBg;

    return (
        <div className="min-h-screen bg-white/30 backdrop-blur-md relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
            {/* Background Layer - Clean Institutional Feel */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${bgUrl})` }}
            ></div>
            {/* <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/30 to-white/80"></div> */}

            {/* Header / Logo Component */}
            <div className="relative z-10 mb-8 sm:mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="inline-block p-4 bg-white rounded-[2rem] shadow-xl mb-4 ring-8 ring-brand-50/50">
                    <img src={logo} alt="Dr.RG Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Dr.RG Academy</h1>
                <p className="text-brand-600 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-[11px] mt-2 italic">Official Attendance Gateway</p>
            </div>

            <main className="relative z-10 w-full max-w-[480px]">

                {/* STEP 1: VERIFICATION (Light Professional Card) */}
                {step === "verify" && (
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]">
                        <div className="px-10 py-12 sm:p-16">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/30 backdrop-blur-md rounded-[2.5rem] mb-6 shadow-inner">
                                    <Clock size={48} className="text-brand-600" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Member Login</h2>
                                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Institutional ID Required</p>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-8">
                                <div className="relative group">
                                   <input 
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                                        placeholder="STU-20XX-XXXX"
                                        className="w-full pl-16 pr-4 py-6 bg-white/30 backdrop-blur-md border-2 border-slate-100 rounded-3xl text-xl font-bold text-slate-800 focus:bg-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-300 tracking-wide text-left shadow-inner"
                                        autoFocus
                                    />
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
                                        <ShieldCheck size={28} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !identifier}
                                    className="w-full py-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-3xl font-black text-xl shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 group"
                                >
                                    {loading ? (
                                        <RefreshCw size={24} className="animate-spin" />
                                    ) : (
                                        <>
                                            Verify
                                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* STEP 2 & 3: CAPTURE & REVIEW (Professional View) */}
                {(step === "capture" || step === "review") && person && (
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-bottom-20 duration-700">

                        {/* Camera Port */}
                        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                            {step === "capture" ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={videoConstraints}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Institutional Scanner Overlay */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 border-[60px] border-black/40"></div>
                                        <div className="absolute inset-[60px] border-2 border-white/20 rounded-[3rem]">
                                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-brand-500/30"></div>
                                            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-brand-500/30"></div>
                                            <div className="absolute -top-1 -left-1 w-16 h-16 border-t-8 border-l-8 border-brand-500 rounded-tl-3xl"></div>
                                            <div className="absolute -top-1 -right-1 w-16 h-16 border-t-8 border-r-8 border-brand-500 rounded-tr-3xl"></div>
                                            <div className="absolute -bottom-1 -left-1 w-16 h-16 border-b-8 border-l-8 border-brand-500 rounded-bl-3xl"></div>
                                            <div className="absolute -bottom-1 -right-1 w-16 h-16 border-b-8 border-r-8 border-brand-500 rounded-br-3xl"></div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-8 flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200 shadow-xl">
                                        <div className="w-2.5 h-2.5 bg-brand-600 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Biometric Ready</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-brand-600/5"></div>
                                    <div className="absolute top-4 left-8 flex items-center gap-3 bg-emerald-500 px-6 py-3 rounded-full shadow-2xl border border-emerald-400/30">
                                        <CheckCircle size={20} className="text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Biometric Logged</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Details Panel */}
                        <div className="p-10 space-y-8">
                            {/* Member Profile Card */}
                            <div className="relative p-6 bg-white/30 backdrop-blur-md rounded-[2rem] border-2 border-slate-100 flex items-center gap-6 group hover:border-brand-100 transition-colors">
                                <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-100">                                    <div className={`w-2 h-2 rounded-full ${location ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">
                                        {location ? 'GIS Sync Active' : 'Acquiring GIS...'}
                                    </span>
                                </div>

                                <div className="w-24 h-24 rounded-[1.5rem] bg-white border-4 border-white overflow-hidden shrink-0 shadow-2xl">
                                    <img
                                        src={person.photo || placeholderImg}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = placeholderImg }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md ${person.role === 'student' ? 'bg-brand-600 text-white' : 'bg-amber-500 text-white'
                                            }`}>
                                            {person.role}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em]">{identifier}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 truncate">{person.name}</h3>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <p className="flex items-center gap-1 text-[11px] font-bold">
                                            <Clock size={12} className="text-brand-600" />
                                            {currentTime.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Captured Metadata Display (Post Capture) */}
                            {step === "review" && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Time Captured</p>
                                        <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                            <Clock size={14} className="text-emerald-500" />
                                            {snapInfo.time}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">GIS Coordinates</p>
                                        <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                            <MapPin size={14} className="text-indigo-500" />
                                            {snapInfo.loc}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Control Cluster */}
                            <div className="grid grid-cols-2 gap-5">
                                {step === "capture" ? (
                                    <button
                                        onClick={handleCapture}
                                        className="col-span-2 py-6 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] font-black text-xl shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 group"
                                    >
                                        <Camera size={28} className="group-hover:scale-110 transition-transform" />
                                        Capture
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleRetake}
                                            className="py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={20} /> Retry
                                        </button>
                                        <button
                                            onClick={submitAttendance}
                                            disabled={marking}
                                            className="py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black text-lg shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {marking ? "Saving..." : "Submit Record"}
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => { setStep("verify"); setPerson(null); setSnapInfo({ time: null, loc: null }); }}
                                className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-[0.4em] transition-colors"
                            >
                                <X size={14} /> Reset Session
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Ambient Footer */}
            <footer className="relative z-10 mt-12 text-center">
                <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                    <ShieldCheck size={12} className="text-brand-400" />
                    Trusted Verification Network • Dr.RG Academy Infrastructure
                </p>
            </footer>
        </div>
    );
};

export default PublicAttendance;
