import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("teacher");
  const [method, setMethod] = useState("email-password"); // 'email-password' | 'number-password' | 'email-otp'
  const [form, setForm] = useState({
    email: "",
    number: "",
    password: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // TODO: replace with real API call
    setTimeout(() => {
      setLoading(false);
      if (role === "teacher") {
        navigate("/dashboard/bills"); // Teacher dashboard
      } else {
        navigate("/admin/bills"); // Admin dashboard
      }
    }, 800);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Login</h1>

          {/* Role Toggle */}
          <div className="bg-slate-100 rounded-full flex items-center gap-1 p-1">
            {["teacher", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                type="button"
                className={`px-3 py-1 rounded-full text-sm ${
                  role === r ? "bg-white shadow text-slate-900" : "text-slate-600"
                }`}
              >
                {r === "teacher" ? "Teacher" : "Admin"}
              </button>
            ))}
          </div>
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setMethod("email-password")}
            className={`flex-1 py-2 text-sm ${
              method === "email-password"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-slate-500"
            }`}
          >
            Email + Password
          </button>
          <button
            onClick={() => setMethod("number-password")}
            className={`flex-1 py-2 text-sm ${
              method === "number-password"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-slate-500"
            }`}
          >
            Number + Password
          </button>
          <button
            onClick={() => setMethod("email-otp")}
            className={`flex-1 py-2 text-sm ${
              method === "email-otp"
                ? "border-b-2 border-slate-900 font-medium"
                : "text-slate-500"
            }`}
          >
            Email + OTP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {(method === "email-password" || method === "email-otp") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="name@example.com"
                required
              />
            </div>
          )}

          {method === "number-password" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number
              </label>
              <input
                type="tel"
                name="number"
                value={form.number}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="10-digit number"
                required
              />
            </div>
          )}

          {method === "email-password" || method === "number-password" ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
          ) : null}

          {method === "email-otp" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Enter OTP"
                required
              />
              <button
                type="button"
                className="mt-2 text-xs text-slate-600 underline"
                onClick={() => alert("Send OTP API call here")}
              >
                Send OTP
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
