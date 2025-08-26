import React, { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../../AllStateContainer/Authentication/AuthenticationSlice"; // import thunk
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState("teacher");
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);
  const { error } = useSelector((state) => state.authentication);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    teacherId: "",
    department: "",
    password: "",
    photo: null,
    showPassword: false,
  });
  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );
  const errors = useMemo(() => validate(form, role), [form, role]);
  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  function onChange(e) {
    const { name, value, files } = e.target;
    if (name === "photo" && files?.[0]) {
      const file = files[0];
      setForm((s) => ({ ...s, photo: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!isFormValid(errors)) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("role", role);
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    fd.append("mobileNumber", form.mobileNumber.trim()); // matches backend schema
    fd.append("password", form.password);

    fd.append("teacherId", form.teacherId.trim());
    fd.append("department", form.department);
    if (form.photo) fd.append("profileImage", form.photo);
    console.log("as Teacher");
    dispatch(signup(fd), navigate);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSubmitting(false);
  }
  useEffect(() => {
    if (isAuthenticated === "true") {
      navigate("/");
    }
  }, [isAuthenticated]);
  return (
    <div className="outline-none focus:outline-none min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="outline-none focus:outline-none w-full max-w-2xl">
        <div className="outline-none focus:outline-none bg-white rounded-2xl shadow-xl border overflow-hidden">
          {/* Header */}
          <div className="outline-none focus:outline-none p-6 border-b flex items-center justify-between gap-4">
            <div>
              <h1 className="outline-none focus:outline-none text-2xl font-semibold">
                Create Account
              </h1>
              <p className="outline-none focus:outline-none text-sm text-slate-500">
                Sign up as {role === "teacher" ? "Teacher" : "Admin"}
              </p>
            </div>
            <div className="outline-none focus:outline-none bg-slate-100 p-1 rounded-full flex items-center gap-1">
              {["teacher", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={
                    "px-4 py-2 rounded-full text-sm font-medium transition " +
                    (role === r
                      ? "bg-white shadow"
                      : "text-slate-600 hover:text-slate-900")
                  }
                  aria-pressed={role === r}
                >
                  {r === "teacher" ? "Teacher" : "Admin"}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <form
            onSubmit={onSubmit}
            className="outline-none focus:outline-none p-6 grid md:grid-cols-2 gap-4"
          >
            {/* Name */}
            <div className="outline-none focus:outline-none md:col-span-2">
              <Label htmlFor="name">
                {role === "teacher" ? "Teacher Name" : "Name"} *
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
              />
              <FieldError message={errors.name} />
            </div>
            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
              />
              <FieldError message={errors.email} />
            </div>
            {/* Mobile Number */}
            <div>
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={onChange}
              />
              <FieldError message={errors.mobileNumber} />
            </div>
            {/* Teacher ID */}
            {role === "teacher" && (
              <div>
                <Label htmlFor="teacherId">Teacher ID *</Label>
                <Input
                  id="teacherId"
                  name="teacherId"
                  value={form.teacherId}
                  onChange={onChange}
                />
                <FieldError message={errors.teacherId} />
              </div>
            )}
            {/* Department */}
            {role === "teacher" && (
              <div>
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  className="outline-none focus:outline-none w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biotech">Biotech</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Sociology">Sociology</option>
                  <option value="BBA">BBA</option>
                  <option value="BBA-CA">BBA-CA</option>
                  <option value="Law">Law</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Electronics">Electronics</option>
                  <option value="BCA">BCA</option>
                </select>
                <FieldError message={errors.department} />
              </div>
            )}
            {/* Profile Photo */}
            {role === "teacher" && (
              <div className="outline-none focus:outline-none md:col-span-2">
                <Label>Profile Photo</Label>
                <div className="outline-none focus:outline-none flex items-center gap-4 mt-2">
                  <div className="outline-none focus:outline-none w-20 h-20 rounded bg-slate-100 border flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="outline-none focus:outline-none w-full h-full object-cover"
                      />
                    ) : (
                      <span className="outline-none focus:outline-none text-xs text-slate-400">
                        No photo
                      </span>
                    )}
                  </div>
                  <div className="outline-none focus:outline-none flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={onChange}
                      className="outline-none focus:outline-none hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="outline-none focus:outline-none px-4 py-2 rounded bg-slate-900 text-white text-sm"
                    >
                      Upload
                    </button>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                          setForm((s) => ({ ...s, photo: null }));
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="outline-none focus:outline-none px-3 py-2 rounded border text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Password */}
            <div className="outline-none focus:outline-none md:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <div className="outline-none focus:outline-none relative">
                <Input
                  id="password"
                  name="password"
                  type={form.showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({ ...s, showPassword: !s.showPassword }))
                  }
                  className="outline-none focus:outline-none absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 border rounded-md"
                >
                  {form.showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError message={errors.password} />
              <PasswordMeter strength={passwordStrength} />
            </div>
            {/* Submit */}
            <div className="outline-none focus:outline-none md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !isFormValid(errors)}
                className="outline-none focus:outline-none px-5 py-2 rounded bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting
                  ? "Creating..."
                  : `Create ${
                      role === "teacher" ? "Teacher" : "Admin"
                    } Account`}
              </button>
            </div>
            {error && (
              <p className="text-rose-500">
                <span className="text-gray-800">Error:</span>
                {error}
              </p>
            )}{" "}
          </form>
        </div>
      </div>
    </div>
  );
}

// ---- helpers ----
function Label({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="outline-none focus:outline-none block text-sm font-medium mb-1"
    >
      {children}
    </label>
  );
}
function Input(props) {
  return (
    <input
      {...props}
      className="outline-none focus:outline-none w-full rounded border px-3 py-2 text-sm"
    />
  );
}
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="outline-none focus:outline-none text-xs text-rose-600 mt-1">
      {message}
    </p>
  );
}
function PasswordMeter({ strength }) {
  const stages = ["Weak", "Fair", "Good", "Strong"];
  const pct = (strength / 3) * 100;
  return (
    <div className="outline-none focus:outline-none mt-2">
      <div className="outline-none focus:outline-none h-2 w-full bg-slate-200 rounded-full">
        <div
          className="outline-none focus:outline-none h-full bg-slate-900"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="outline-none focus:outline-none text-[11px] mt-1">
        Password strength: {stages[strength]}
      </p>
    </div>
  );
}
function validate(form, role) {
  const errs = {};
  if (!form.name.trim()) errs.name = "Name required";
  if (!form.email.trim()) errs.email = "Email required";
  if (!form.mobileNumber.trim()) errs.mobileNumber = "Mobile number required";
  if (role === "teacher" && !form.teacherId.trim())
    errs.teacherId = "Teacher ID required";
  if (role === "teacher" && !form.department)
    errs.department = "Department required";
  if (!form.password) errs.password = "Password required";
  return errs;
}
function isFormValid(errs) {
  return Object.keys(errs).length === 0;
}
function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
