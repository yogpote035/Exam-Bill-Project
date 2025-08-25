import React, { useMemo, useRef, useState } from "react";

export default function Signup() {
  const [role, setRole] = useState("teacher"); 
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    teacherId: "",
    password: "",
    photo: null,
    showPassword: false,
  });

  const errors = useMemo(() => validate(form, role), [form, role]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

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

    try {
      setSubmitting(true);

      // Build FormData for backend (works for photo uploads)
      const fd = new FormData();
      fd.append("role", role);
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("number", form.number.trim());
      fd.append("password", form.password);
      if (role === "teacher") {
        fd.append("teacherId", form.teacherId.trim());
        if (form.photo) fd.append("photo", form.photo);
      }

      // TODO: replace with your API call, e.g. fetch('/api/auth/signup', { method: 'POST', body: fd })
      await fakeNetwork(fd);

      alert(`Signed up successfully as ${role}!`);
      // Reset form
      setForm({ name: "", email: "", number: "", teacherId: "", password: "", photo: null, showPassword: false });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert("Failed to sign up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Create Account</h1>
              <p className="text-sm text-slate-500">Sign up as a Teacher or Admin</p>
            </div>

            {/* Role Toggle */}
            <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1">
              {(["teacher", "admin"]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={
                    "px-4 py-2 rounded-full text-sm font-medium transition " +
                    (role === r
                      ? "bg-white shadow text-slate-900"
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
          <form onSubmit={onSubmit} className="p-6 grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name">{role === "teacher" ? "Teacher Name" : "Name"} <span className="text-rose-600">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={onChange}
                aria-invalid={!!errors.name}
              />
              <FieldError message={errors.name} />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email <span className="text-rose-600">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={onChange}
                aria-invalid={!!errors.email}
              />
              <Hint text="Must be unique for each account" />
              <FieldError message={errors.email} />
            </div>

            {/* Number */}
            <div>
              <Label htmlFor="number">Number <span className="text-rose-600">*</span></Label>
              <Input
                id="number"
                name="number"
                inputMode="tel"
                placeholder="10-digit mobile number"
                value={form.number}
                onChange={onChange}
                aria-invalid={!!errors.number}
              />
              <Hint text="Must be unique for each account" />
              <FieldError message={errors.number} />
            </div>

            {/* Teacher ID (Teacher only) */}
            {role === "teacher" && (
              <div>
                <Label htmlFor="teacherId">Teacher ID <span className="text-rose-600">*</span></Label>
                <Input
                  id="teacherId"
                  name="teacherId"
                  placeholder="e.g., TCH-2025-001"
                  value={form.teacherId}
                  onChange={onChange}
                  aria-invalid={!!errors.teacherId}
                />
                <Hint text="Must be unique for each teacher" />
                <FieldError message={errors.teacherId} />
              </div>
            )}

            {/* Profile Photo (Teacher only) */}
            {role === "teacher" && (
              <div className="md:col-span-2">
                <Label>Profile Photo (optional)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No photo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={onChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800 active:scale-[.98]"
                    >
                      Upload Photo
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
                        className="px-3 py-2 rounded-xl border text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="md:col-span-2">
              <Label htmlFor="password">Password <span className="text-rose-600">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={form.showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={onChange}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, showPassword: !s.showPassword }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 border rounded-md"
                  aria-label={form.showPassword ? "Hide password" : "Show password"}
                >
                  {form.showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError message={errors.password} />
              <PasswordMeter strength={passwordStrength} />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500">By continuing, you agree to our Terms & Privacy Policy.</p>
              <button
                type="submit"
                disabled={submitting || !isFormValid(errors)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : `Create ${role === "teacher" ? "Teacher" : "Admin"} Account`}
              </button>
            </div>

            {/* Helper: unique constraints note */}
            <div className="md:col-span-2 text-[11px] text-slate-500 border-t pt-3">
              <p><strong>Uniqueness</strong>: Email, Number, and {role === "teacher" ? "Teacher ID" : "—"} must be unique. The app should enforce this on the backend with database unique indexes and return a clear error if duplicates are found.</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-slate-600">
          Already have an account? <a href="#" className="underline underline-offset-4">Log in</a>
        </div>
      </div>
    </div>
  );
}

// ————— Helper Components —————
function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={(props.className ?? "") +
        " w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-200"}
    />
  );
}

function Hint({ text }) {
  return <p className="text-[11px] text-slate-500 mt-1">{text}</p>;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-rose-600 mt-1">{message}</p>;
}

function PasswordMeter({ strength }) {
  const stages = ["Weak", "Fair", "Good", "Strong"];
  const pct = (strength / 3) * 100; // 0..3
  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-slate-500 mt-1">Password strength: {stages[strength]}</p>
    </div>
  );
}

// ————— Validation & Utils —————
function validate(form, role) {
  const errs = {};

  // Name
  if (!form.name.trim()) errs.name = "Name is required";
  else if (form.name.trim().length < 2) errs.name = "Enter a valid name";

  // Email
  if (!form.email.trim()) errs.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "Enter a valid email";

  // Number (10 digits typical in India)
  const number = form.number.trim();
  if (!number) errs.number = "Number is required";
  else if (!/^\d{10}$/.test(number)) errs.number = "Enter a 10-digit mobile number";

  if (role === "teacher") {
    // Teacher ID
    if (!form.teacherId.trim()) errs.teacherId = "Teacher ID is required";
    else if (!/^[A-Za-z0-9_-]{3,}$/.test(form.teacherId.trim())) errs.teacherId = "Use letters, numbers, - or _ (min 3 chars)";
  }

  // Password
  if (!form.password) errs.password = "Password is required";
  else if (form.password.length < 8) errs.password = "Must be at least 8 characters";
  else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
    errs.password = "Include upper, lower, and a number";
  }

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
  return score; // 0..3
}

function fakeNetwork(fd) {
  return new Promise((res) => setTimeout(res, 600));
}
