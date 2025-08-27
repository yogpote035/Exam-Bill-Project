import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    request: (state) => {
      state.loading = true;
      state.error = null;
    },
    success: (state, action) => {
      state.loading = false;
      state.error = null;
      state.profile = action.payload;
    },
    failure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { request, success, failure } = profileSlice.actions;

export default profileSlice.reducer;

// Get Profile
export const getProfile = () => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({
    title: "Getting Your Profile...",
    didOpen: () => Swal.showLoading(),
  });

  const token =
    getState().authentication.token || localStorage.getItem("token");

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Swal.close();
    dispatch(success(data));
  } catch (err) {
    Swal.close();
    const message = err.response?.data?.message || "Fetch Profile failed";
    dispatch(failure(message));
    toast.error(message);
  }
};

// Update Profile
export const updateProfile =
  (formData, navigate) => async (dispatch, getState) => {
    dispatch(request());
    Swal.fire({
      title: "Updating Your Profile...",
      didOpen: () => Swal.showLoading(),
    });

    const token =
      getState().authentication.token || localStorage.getItem("token");

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_API}/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();
      dispatch(success(data));
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      Swal.close();
      const message = err.response?.data?.message || "Update Profile failed";
      dispatch(failure(message));
      toast.error(message);
    }
  };

export const sendOtp = (email) => async (dispatch) => {
  dispatch(request());
  try {
    Swal.fire({
      title: `Sending Otp to ${email}`,
      didOpen: () => Swal.showLoading(),
    });
    // const token =
    //   getState().authentication.token || localStorage.getItem("token");

    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/profile/change-password/send-otp`,
      { email }
    );
    dispatch(success());
    Swal.close();
    Swal.fire("Success", data.message, "success");
    return true;
  } catch (err) {
    Swal.close();
    
    dispatch(failure(err.response?.data?.message || err.message));
    Swal.fire("Error", err.response?.data?.message || err.message, "error");
    return false;
  }
};

export const verifyOtpAndReset =
  (email, otp, newPassword, navigate) => async (dispatch, getState) => {
    dispatch(request());
    try {
      Swal.fire({
        title: `Verifying Otp and Setting New Password`,
        didOpen: () => Swal.showLoading(),
      });
      const token = getState().authentication.token;

      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_API
        }/profile/change-password/verify-otp`,
        { email, otp, newPassword }
        // { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(success(data.message));
      Swal.close();
      Swal.fire("Success", data.message, "success");
      if (!token) {
        navigate("/login");
      }
    } catch (err) {
      Swal.close();
      dispatch(failure(err.response?.data?.message || err.message));
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };
