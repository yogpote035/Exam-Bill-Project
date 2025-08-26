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
    //  Common
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

    //  Signup
    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      (state.user = {
        userId: action.payload.id,
        name: action.payload.name,
        profileImage: action.payload.profileImage?.url,
      }),
        (state.token = action.payload.token);
      state.role = action.payload.role; // set role
      localStorage.setItem("token", action.payload.token); // store token in local storage
      localStorage.setItem("role", action.payload.role); // store role in local storage
      localStorage.setItem("userId", action.payload.id); // store user in local storage
      localStorage.setItem("name", action.payload.name); // store username in local storage
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    otpSuccess: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    //  Login / OTP
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      (state.user = {
        userId: action.payload.id,
        name: action.payload.name,
        profileImage: action.payload.profileImage?.url,
      }),
        (state.token = action.payload.token);
      state.role = action.payload.role; // set role
      localStorage.setItem("token", action.payload.token); // store token in local storage
      localStorage.setItem("role", action.payload.role); // store role in local storage
      localStorage.setItem("userId", action.payload.id); // store user in local storage
      localStorage.setItem("name", action.payload.name); // store username in local storage
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
  otpSuccess,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;

// Signup (Teacher or Admin)
export const signup = (formData, navigate) => async (dispatch) => {
  dispatch(signupRequest());
  Swal.fire({
    title: "Signing up...",
    didOpen: () => Swal.showLoading(),
  });

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/authentication/signup`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    Swal.close();
    console.log(data);
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
export const loginEmailPassword =
  (email, password, navigate) => async (dispatch) => {
    dispatch(request());
    Swal.fire({ title: "Logging in...", didOpen: () => Swal.showLoading() });

    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_API
        }/authentication/login/email-password`,
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
export const loginNumberPassword =
  (mobileNumber, password, navigate) => async (dispatch) => {
    dispatch(request());
    Swal.fire({ title: "Logging in...", didOpen: () => Swal.showLoading() });

    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_API
        }/authentication/login/number-password`,
        { mobileNumber, password }
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
  if (!email) {
    return toast.error("please Fill Email First");
  }
  dispatch(request());
  Swal.fire({ title: "Sending OTP...", didOpen: () => Swal.showLoading() });

  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/authentication/login/sent-otp`,
      { email }
    );
    Swal.close();
    toast.success("OTP sent to email!");
    dispatch(otpSuccess());
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
      `${import.meta.env.VITE_BACKEND_API}/authentication/login/email-otp`,
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
