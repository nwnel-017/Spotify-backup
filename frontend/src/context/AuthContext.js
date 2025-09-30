// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
// import { useLoading } from "./LoadingContext.js";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // const { startLoading, stopLoading } = useLoading();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      console.log("Fetching user in AuthContext...");
      // startLoading("page");
      setAuthLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        console.log("Fetched user:", data.user);
        setUser(data.user || null);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        // stopLoading("page");
        setAuthLoading(false);
      }
    };

    getUser();

    const interval = setInterval(getUser, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
