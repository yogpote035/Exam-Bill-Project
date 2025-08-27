import { useState } from "react";

import "./App.css";
import { Route, Routes } from "react-router-dom";
import Navbar from "../Components/General/Navbar";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import HomePage from "../Components/General/HomePage";
import { Toaster } from "react-hot-toast";
import ProtectedRoutes from "../Components/General/ProtectedRoute";
import CreateBIll from "../Components/Bill/CreateBill";
import AllBills from "../Components/Bill/AllBills";
import UpdateBill from "../Components/Bill/UpdateBill";
import ViewBill from "../Components/Bill/ViewBill";
function App() {
  return (
    <>
      <Navbar />
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          top: 80,
        }}
      />
      <Routes>
        <Route path="/" element={<ProtectedRoutes><AllBills /></ProtectedRoutes>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* create bill */}
        <Route
          path="/create-bill"
          element={
            <ProtectedRoutes>
              <CreateBIll />
            </ProtectedRoutes>
          }
        />
        {/* update bill */}
        <Route
          path="/edit-bill/:id"
          element={
            <ProtectedRoutes>
              <UpdateBill />
            </ProtectedRoutes>
          }
        />

        {/* get all bill */}
        <Route
          path="/bills"
          element={
            <ProtectedRoutes>
              <AllBills />
            </ProtectedRoutes>
          }
        />
        {/* get one bill */}
        <Route
          path="/view-bill/:id"
          element={
            <ProtectedRoutes>
              <ViewBill />
            </ProtectedRoutes>
          }
        />

        <Route
          path="*"
          element={
            <h1 className="mt-6 text-3xl text-rose-500 font-bold">
              404 Not Found
            </h1>
          }
        />
      </Routes>
    </>
  );
}

export default App;
