import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../AllStateContainer/Authentication/AuthenticationSlice";
import { Menu, X } from "lucide-react"; // Lucide icons

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { user } = useSelector((state) => state.authentication);
  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect click outside dropdown
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-slate-900">
            Staff Remuneration
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive("/login")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive("/signup")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/create-bill"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive("/create-bill")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Create Bill
                </Link>

                <Link
                  to="/bills"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive("/bills")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  All Bills
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center gap-2 focus:outline-none px-2 py-1 rounded hover:bg-slate-100 transition"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <img
                      src={
                        user?.profileImage ||
                        "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=1024x1024&w=is&k=20&c=oGqYHhfkz_ifeE6-dID6aM7bLz38C6vQTy1YcbgZfx8="
                      }
                      alt="Profile"
                      className="w-9 h-9 rounded-full border object-cover"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {user?.name || "Profile"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                      <Link
                        to="/profile/view"
                        className="block px-4 py-2 text-sm text-slate-700 hover:underline"
                        onClick={() => setDropdownOpen(false)}
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/profile/edit"
                        className="block px-4 py-2 text-sm text-slate-700 hover:underline"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 space-y-1 pb-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive("/login")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive("/signup")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/create-bill"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive("/create-bill")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  Create Bill
                </Link>
                <Link
                  to="/bills"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive("/bills")
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Bills
                </Link>

                <Link
                  to="/profile/view"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Profile
                </Link>
                <Link
                  to="/profile/edit"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
