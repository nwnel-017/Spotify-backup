// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );

        setUser(data.user || null);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      }
    };

    getUser();

    const interval = setInterval(getUser, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
