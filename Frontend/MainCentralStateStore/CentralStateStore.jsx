import { configureStore } from "@reduxjs/toolkit";

import React from "react";
import authenticationReducer from "../AllStateContainer/Authentication/AuthenticationSlice";
import billSliceReducer from "../AllStateContainer/Bill/BillSlice";
const CentralStore = configureStore({
  reducer: {
    authentication: authenticationReducer,
    bill: billSliceReducer,
  },
});

export default CentralStore;
