import React, { useState, useEffect } from "react";
import { Loader2, Mail, Key } from "lucide-react";

const ForgotPassword = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===============================
  // SEND OTP
  // ===============================
  const sendOtp = async () => {
    if (!formData.email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/password/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      alert("OTP sent successfully");
      setStep(2);
      setTimer(30);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // VERIFY OTP
  // ===============================
  const verifyOtp = async () => {
    if (!formData.otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      alert("OTP verified");
      setStep(3);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RESET PASSWORD
  // ===============================
  const resetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      alert("Please fill all password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/password/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      alert("Password reset successful!");
      window.location.href = "/login";
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // OTP TIMER
  // ===============================
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-10">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Forgot Password
        </h2>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8 text-sm font-medium text-gray-500">
          <span className={step >= 1 ? "text-blue-600" : ""}>Email</span>
          <span className={step >= 2 ? "text-blue-600" : ""}>OTP</span>
          <span className={step >= 3 ? "text-blue-600" : ""}>Reset</span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="flex items-center border rounded mb-4 p-2">
              <Mail className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full outline-none p-2"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="flex items-center border rounded mb-4 p-2">
              <Key className="text-gray-400 mr-2" />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                className="w-full outline-none p-2"
                value={formData.otp}
                onChange={handleChange}
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center mb-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
            </button>

            <button
              onClick={sendOtp}
              disabled={timer > 0 || loading}
              className={`w-full py-2 rounded-lg ${
                timer > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="w-full p-3 border rounded mb-4"
              value={formData.newPassword}
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border rounded mb-6"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;