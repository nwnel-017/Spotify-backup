import logo from "./logo.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import SignupPage from "./pages/Signup.js";
import Home from "./pages/Home.js";
import LandingPage from "./pages/LandingPage.js";
import GlobalLoading from "./context/GlobalLoading";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <GlobalLoading />
    </>
  );
}

export default App;
