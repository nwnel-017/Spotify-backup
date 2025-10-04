import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const getUser = async () => {
    console.log("Fetching user in AuthContext...");
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
      console.error("Error fetching session. Attempting to refresh token");
      try {
        await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/auth/refreshToken`,
          {
            withCredentials: true,
          }
        );

        const { data } = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(data.user || null);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        setUser(null);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
