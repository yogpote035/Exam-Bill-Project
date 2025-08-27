import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  loginEmailPassword,
  loginNumberPassword,
  verifyOtp,
  otpSent,
} from "../../AllStateContainer/Authentication/AuthenticationSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.authentication);
  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );

  const [method, setMethod] = useState("email-password");
  const [form, setForm] = useState({
    email: "",
    number: "",
    password: "",
    otp: "",
  });

  const sentOtp = (email) => {
    if (!email) {
      return toast.error("Please Fill Email First");
    }
    dispatch(otpSent(email));
  };

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (method === "email-password") {
      await dispatch(loginEmailPassword(form.email, form.password, navigate));
    } else if (method === "number-password") {
      await dispatch(loginNumberPassword(form.number, form.password, navigate));
    } else if (method === "email-otp") {
      await dispatch(verifyOtp(form.email, form.otp, navigate));
    }
  }

  useEffect(() => {
    if (isAuthenticated === true) {
      navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiDX-TI_GWDRoSUoutAJU6HDoAwjH9sPY_PUd2yOYyYNdY6g6un5KNinkcCQmHdmuqIPg&usqp=CAU"
            alt="College Logo"
            className="w-20 h-20 mb-3"
          />
          <h1 className="text-2xl font-bold text-slate-900">
            Staff Remuneration Login
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          {["email-password", "number-password", "email-otp"].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 py-2 text-sm ${
                method === m
                  ? "border-b-2 border-slate-900 font-medium"
                  : "text-slate-500"
              }`}
            >
              {m === "email-password"
                ? "Email + Password"
                : m === "number-password"
                ? "Number + Password"
                : "Email + OTP"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {(method === "email-password" || method === "email-otp") && (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
              {method === "email-otp" && (
                <button
                  type="button"
                  onClick={() => {
                    if (form.email) {
                      sentOtp(form.email);
                    }
                  }}
                  className="mt-1 text-xs text-slate-600 hover:underline"
                >
                  Send OTP
                </button>
              )}
            </div>
          )}

          {method === "number-password" && (
            <div>
              <label className="block text-sm font-medium mb-1">Number</label>
              <input
                type="tel"
                name="number"
                value={form.number}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          )}

          {(method === "email-password" || method === "number-password") && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          )}

          {method === "email-otp" && (
            <div>
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={onChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <Link to={"/forgot-password"} className="text-indigo-500 text-sm hover:underline">Forgot Password</Link>
          {error && <p className="text-red-600 text-sm">Error: {error}</p>}
        </form>
      </div>
    </div>
  );
}
