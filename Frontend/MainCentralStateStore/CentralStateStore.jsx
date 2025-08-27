import { configureStore } from "@reduxjs/toolkit";

import React from "react";
import authenticationReducer from "../AllStateContainer/Authentication/AuthenticationSlice";
import billSliceReducer from "../AllStateContainer/Bill/BillSlice";
import profileReducer from "../AllStateContainer/Profile/ProfileSlice";
const CentralStore = configureStore({
  reducer: {
    authentication: authenticationReducer,
    bill: billSliceReducer,
    profile: profileReducer,
  },
});

export default CentralStore;
