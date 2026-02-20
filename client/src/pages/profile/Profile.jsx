// src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg max-w-md">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center text-xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Phone</p>
            <p className="text-white">{user.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Department / Class</p>
            <p className="text-white">{user.department || user.class || "N/A"}</p>
          </div>
        </div>

        {/* Optional: Edit button */}
        <button className="mt-6 px-4 py-2 bg-brand-600 rounded-lg text-white hover:bg-brand-700 transition">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
