import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../features/auth/authSlice"; // your auth slice

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = () => {
    alert("logged out");
  };
  //   const { token, user } = useSelector((state) => state.auth);
  const token = "wejgdjkgwehjuy";
const  user = {
    name: "yogesh",
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-slate-900">
            BillSys
          </Link>

          {/* Nav Options */}
          <div className="flex items-center gap-6">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-700 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/bills"
                  className="text-sm text-slate-700 hover:text-slate-900"
                >
                  All Bills
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <img
                      src={
                        user?.profilePhoto || "https://via.placeholder.com/40"
                      }
                      alt="Profile"
                      className="w-9 h-9 rounded-full border object-cover"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {user?.name || "Profile"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                    <Link
                      to="/profile/view"
                      className="block px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="block px-4 py-2 text-sm hover:bg-slate-50"
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
