import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider } from "./context/AuthContext.js";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/query/QueryClient.js";
import GlobalLoading from "./context/GlobalLoading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./icons"; // just import it once to register icons globally

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <ToastContainer />
          </AuthProvider>
        </QueryClientProvider>
      </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
