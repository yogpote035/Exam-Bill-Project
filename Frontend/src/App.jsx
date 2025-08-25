import { useState } from "react";

import "./App.css";
import { Route, Routes } from "react-router-dom";
import Navbar from "../Components/General/Navbar";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import HomePage from "../Components/General/HomePage";
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="*"
          element={
            <h1 className="mt-6 text-3xl text-rose-500 font-bold">
              404 Not Found
            </h1>
          }
        />
      </Routes>
      <div>
        <h1 className="text-9xl text-rose-500">Hello</h1>
      </div>
    </>
  );
}

export default App;
