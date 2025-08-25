import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    // ---------- Common
    request: (state) => {
      state.loading = true;
      state.error = null;
    },
    failure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },

    // ---------- Signup
    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("role", action.payload.role);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------- Login / OTP
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("role", action.payload.role);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
  },
});

export const {
  request,
  failure,
  logout,
  signupRequest,
  signupSuccess,
  signupFailure,
  loginSuccess,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;




// Signup (Teacher or Admin)
export const signupUser = (formData, role, navigate) => async (dispatch) => {
  dispatch(signupRequest());
  Swal.fire({ title: "Signing up...", didOpen: () => Swal.showLoading() });

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/auth/signup/${role.toLowerCase()}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    Swal.close();
    dispatch(signupSuccess(data));
    toast.success("Signup successful!");
    navigate("/");
  } catch (err) {
    Swal.close();
    dispatch(signupFailure(err.response?.data?.message || "Signup failed"));
    toast.error(err.response?.data?.message || "Signup failed");
  }
};

// Login with Email+Password
export const loginEmailPassword = (email, password, navigate) => async (dispatch) => {
  dispatch(request());
  Swal.fire({ title: "Logging in...", didOpen: () => Swal.showLoading() });

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/auth/login/email-password`,
      { email, password }
    );

    Swal.close();
    dispatch(loginSuccess(data));
    toast.success("Login successful!");
    navigate("/");
  } catch (err) {
    Swal.close();
    dispatch(failure(err.response?.data?.message || "Login failed"));
    toast.error(err.response?.data?.message || "Login failed");
  }
};

// Login with Number+Password
export const loginNumberPassword = (number, password, navigate) => async (dispatch) => {
  dispatch(request());
  Swal.fire({ title: "Logging in...", didOpen: () => Swal.showLoading() });

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/auth/login/mobile-password`,
      { number, password }
    );

    Swal.close();
    dispatch(loginSuccess(data));
    toast.success("Login successful!");
    navigate("/");
  } catch (err) {
    Swal.close();
    dispatch(failure(err.response?.data?.message || "Login failed"));
    toast.error(err.response?.data?.message || "Login failed");
  }
};

// Send OTP
export const otpSent = (email) => async (dispatch) => {
  dispatch(request());
  Swal.fire({ title: "Sending OTP...", didOpen: () => Swal.showLoading() });

  try {
    await axios.post(`${import.meta.env.VITE_BACKEND_API}/auth/login/send-otp`, { email });
    Swal.close();
    toast.success("OTP sent to email!");
  } catch (err) {
    Swal.close();
    dispatch(failure(err.response?.data?.message || "OTP send failed"));
    toast.error(err.response?.data?.message || "OTP send failed");
  }
};

// Verify OTP
export const verifyOtp = (email, otp, navigate) => async (dispatch) => {
  dispatch(request());
  Swal.fire({ title: "Verifying OTP...", didOpen: () => Swal.showLoading() });

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/auth/login/verify-otp`,
      { email, otp }
    );

    Swal.close();
    dispatch(loginSuccess(data));
    toast.success("OTP Verified! Login successful");
    navigate("/");
  } catch (err) {
    Swal.close();
    dispatch(failure(err.response?.data?.message || "OTP failed"));
    toast.error(err.response?.data?.message || "OTP failed");
  }
};
