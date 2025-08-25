import { configureStore } from "@reduxjs/toolkit";

import React from "react";
import authenticationReducer from "../AllStateContainer/Authentication/AuthenticationSlice";
const CentralStore = configureStore({
  reducer: {
    authentication: authenticationReducer,
  },
});

export default CentralStore;
