// PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import { useLoading } from "../context/LoadingContext";

const PrivateRoute = ({ children }) => {
  const { user, authLoading } = useAuth();
  // const { active } = useLoading();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" />; // redirect to landing/login page
  }

  return children; // render the protected page
};

export default PrivateRoute;
