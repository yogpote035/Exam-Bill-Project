import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import deleteConfirm from "../../Components/General/DeleteConfirm";

const initialState = {
  bills: [],
  singleBill: [],
  loading: false,
  error: null,
};

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    request: (state) => {
      state.loading = true;
      state.error = null;
    },
    failure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createBillSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },

    // Fetch
    fetchAllBillsSuccess: (state, action) => {
      state.loading = false;
      state.bills = action.payload;
      state.error = null;
    },
    // Fetch
    fetchSingleBillsSuccess: (state, action) => {
      state.loading = false;
      state.singleBill = action.payload;
      state.error = null;
    },

    // Update
    updateBillSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },

    // Delete
    deleteBillSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  request,
  failure,
  createBillSuccess,
  fetchAllBillsSuccess,
  fetchSingleBillsSuccess,
  updateBillSuccess,
  deleteBillSuccess,
} = billSlice.actions;

export default billSlice.reducer;

//  Get token
const getAuthHeader = (getState) => {
  const token =
    getState().authentication?.token || localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// Thunks
export const createBill =
  (formData, navigate) => async (dispatch, getState) => {
    dispatch(request());
    Swal.fire({ title: "Creating Bill...", didOpen: () => Swal.showLoading() });

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/bill`,
        formData,
        getAuthHeader(getState)
      );

      Swal.close();

      dispatch(createBillSuccess());
      toast.success("Bill created successfully!");
      navigate("/bills");
      dispatch(fetchBills());
    } catch (err) {
      Swal.close();
      console.error(err);
      dispatch(
        failure(
          err.response?.data?.message ||
            err.response?.data?.errors[0]?.msg ||
            "Create failed"
        )
      );
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors[0]?.msg ||
          "Create failed"
      );
    }
  };

export const fetchBills = () => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({ title: "Fetching Bills...", didOpen: () => Swal.showLoading() });

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/bill`,
      getAuthHeader(getState)
    );

    Swal.close();
    dispatch(fetchAllBillsSuccess(data?.data));
  } catch (err) {
    Swal.close();
    dispatch(failure(err.response?.data?.message || "Fetch failed"));
    toast.error(err.response?.data?.message || "Fetch failed");
  }
};
export const fetchBillById = (id) => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({ title: "Fetching Bills...", didOpen: () => Swal.showLoading() });

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/bill/${id}`,
      getAuthHeader(getState)
    );

    Swal.close();
    dispatch(fetchSingleBillsSuccess(data?.data));
  } catch (err) {
    Swal.close();
    dispatch(failure(err.response?.data?.message || "Fetch failed"));
    toast.error(err.response?.data?.message || "Fetch failed");
  }
};

export const updateBill =
  (id, formData, navigate) => async (dispatch, getState) => {
    dispatch(request());
    Swal.fire({ title: "Updating Bill...", didOpen: () => Swal.showLoading() });

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_API}/bill/${id}`,
        formData,
        getAuthHeader(getState)
      );

      Swal.close();
      dispatch(updateBillSuccess());
      toast.success("Bill updated successfully!");
      dispatch(fetchBills());
      navigate("/bills");
    } catch (err) {
      Swal.close();
      console.error(err);
      dispatch(
        failure(
          err.response?.data?.message ||
            err.response?.data?.errors[0]?.msg ||
            "Update failed"
        )
      );
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors[0]?.msg ||
          "Update failed"
      );
    }
  };

export const deleteBill = (id) => async (dispatch, getState) => {
  const result = await deleteConfirm(
    "Delete This Bill?",
    "Are You Sure This Action Cannot Be Undone"
  );
  if (result === true) {
    dispatch(request());
    Swal.fire({ title: "Deleting Bill...", didOpen: () => Swal.showLoading() });

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API}/bill/${id}`,
        getAuthHeader(getState)
      );

      Swal.close();
      dispatch(deleteBillSuccess());
      toast.success("Bill deleted successfully!");
      dispatch(fetchBills());
    } catch (err) {
      Swal.close();
      dispatch(failure(err.response?.data?.message || "Delete failed"));
      toast.error(err.response?.data?.message || "Delete failed");
    }
  }
};

export const downloadBill = (id) => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({
    title: "Preparing your Bill...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const token =
      getState().authentication.token || localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/bill/download/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );

    Swal.close();

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bill-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    dispatch(createBillSuccess());
    toast.success("Bill downloaded successfully!");
  } catch (error) {
    Swal.close();
    dispatch(failure(error.response?.data?.message || error.message));
  }
};
export const downloadBankDetailForm = () => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({
    title: "Preparing your Bank Detail Form...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const token =
      getState().authentication.token || localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/bill/download/bank-detail-form`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );

    Swal.close();

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bank-Detail-Form.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    dispatch(createBillSuccess());
    toast.success("Bill downloaded successfully!");
  } catch (error) {
    Swal.close();
    dispatch(failure(error.response?.data?.message || error.message));
  }
};
export const downloadPersonBill = (id) => async (dispatch, getState) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Download Person Bill for Each Person You Get Separate Bill!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Proceed!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      dispatch(request());
      Swal.fire({
        title: "Preparing Bills for individual...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const token =
          getState().authentication.token || localStorage.getItem("token");

        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_API
          }/bill/download/personalBill/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          }
        );

        Swal.close();

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Bill-individual-Person-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        dispatch(createBillSuccess());
        toast.success("Bill downloaded successfully!");
      } catch (error) {
        Swal.close();
        dispatch(failure(error.response?.data?.message || error.message));
      }
    }
  });
};
export const mailPersonalBillsToSelf = (id) => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({
    title: "Wait!!, Sending Bill to Your Mail...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
  try {
    const token =
      getState().authentication.token || localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/bill/mail/personalBill/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );
    dispatch(createBillSuccess());

    toast.success("Bill Mailed successfully!, Check Your Mail");
    Swal.close();
    Swal.fire("Success!", "Bill mailed to your registered email.", "success");
  } catch (error) {
    Swal.close();
    dispatch(failure(error.response?.data?.message || error.message));
  }
};
export const mailPersonalBillsToOther =
  (id, email) => async (dispatch, getState) => {
    dispatch(request());
    Swal.fire({
      title: `Sending Bill To : ${email}`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token =
        getState().authentication.token || localStorage.getItem("token");

      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_API
        }/bill/mail/personalBill/other/${id}`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(createBillSuccess());
      Swal.close();
      Swal.fire("Success!", `Bill mailed to ${email}`, "success");
      toast.success(`Bill is Sent To: ${email}`);
    } catch (error) {
      Swal.close();
      dispatch(failure(error.response?.data?.message || error.message));
    }
  };

export const mailMainBillToSelf = (id) => async (dispatch, getState) => {
  dispatch(request());
  Swal.fire({
    title: "Wait!!, Sending Bill to Your Mail...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
  try {
    const token =
      getState().authentication.token || localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API}/bill/mail/mainBill/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );
    dispatch(createBillSuccess());

    toast.success("Bill Mailed successfully!, Check Your Mail");
    Swal.close();
    Swal.fire("Success!", "Bill mailed to your registered email.", "success");
  } catch (error) {
    Swal.close();
    dispatch(failure(error.response?.data?.message || error.message));
  }
};
export const mailMainBillToOther =
  (id, email) => async (dispatch, getState) => {
    dispatch(request());
    Swal.fire({
      title: `Sending Bill To : ${email}`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token =
        getState().authentication.token || localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/bill/mail/mainBill/other/${id}`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(createBillSuccess());
      Swal.close();
      Swal.fire("Success!", `Bill mailed to ${email}`, "success");
      toast.success(`Bill is Sent To: ${email}`);
    } catch (error) {
      Swal.close();
      dispatch(failure(error.response?.data?.message || error.message));
    }
  };
