import logo from "./logo.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.js";
import Login from "./pages/Login.js";
import SignupPage from "./pages/Signup.js";
import Restore from "./pages/Restore.js";
import Home from "./pages/Home.js";
import Backups from "./pages/Backups.js";
import LandingPage from "./pages/LandingPage.js";
import GlobalLoading from "./context/GlobalLoading";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/home/:firstTimeUser"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/restore"
          element={
            <PrivateRoute>
              <Restore />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/backups"
          element={
            <PrivateRoute>
              <Backups />
            </PrivateRoute>
          }
        />
      </Routes>
      <GlobalLoading />
    </>
  );
}

export default App;
