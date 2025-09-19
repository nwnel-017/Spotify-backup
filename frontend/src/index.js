import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext"; // ✅ import AuthProvider
import { LoadingProvider } from "./context/LoadingContext";
import GlobalLoading from "./context/GlobalLoading";
import { Toaster } from "react-hot-toast"; // ✅ add this
import "./icons"; // just import it once to register icons globally

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        {/* ✅ wrap App in AuthProvider */}
        {/* <Toaster position="top-center" reverseOrder={false} /> */}
        <App />
      </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
