import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

export default function HomePage() {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login"); // default page if no token
    }
  }, [token, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Welcome Section */}
      <div className="w-full max-w-4xl text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user.name || "User"} 👋
        </h1>
        <p className="text-slate-600 mt-2">
          You are logged in as <span className="font-medium">{user.role}</span>
        </p>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          <img
            src={user.profilePhoto || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full border object-cover"
          />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            {user.name}
          </h2>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-xs text-slate-500 mt-1">Role: {user.role}</p>

          <div className="mt-4 flex gap-3">
            <Link
              to="/profile/view"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              View Profile
            </Link>
            <Link
              to="/profile/edit"
              className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
          <Link
            to="/bills"
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-slate-800">
              {user.role === "teacher" ? "My Bills" : "All Bills"}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              View and manage {user.role === "teacher" ? "your" : "all"} bills
            </p>
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin/teachers"
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-slate-800">
                Teacher Management
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                View, add, and manage teacher accounts
              </p>
            </Link>
          )}

          <Link
            to="/settings"
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-slate-800">Settings</h3>
            <p className="text-sm text-slate-600 mt-1">
              Update your account preferences
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
