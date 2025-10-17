import React, { useState, useContext, useEffect, useRef } from "react";
import { SignupPage } from "./Signup";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { LoadingContext } from "../context/LoadingContext";
import styles from "./styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { startSpotifyAuth, loginUser } from "../services/SpotifyService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const loginError = params.get("loginError ");
  const toastShown = useRef({ loginError: false });
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { getUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      startLoading("overlay");
      const res = await loginUser(email, password);
      console.log("Login successful");
      if (res.status !== 200) {
        setMessage("Login failed: " + res.statusText);
        console.log("Login failed with status", res.status);
        return;
      }
      await getUser();
      stopLoading("overlay");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed: " + error.message);
    }
  };

  useEffect(() => {
    if (loginError === "true" && !toastShown.current.loginError) {
      toast.error("Please create an account first!");
      toastShown.current.loginError = true;
    }
  }, [loginError]);

  return (
    <div className={`${styles.dashboard} ${styles.loginPage}`}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <input
          className={styles.formInput}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          className={styles.formInput}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>
      <div className={styles.dividerContainer}>
        <hr className={styles.divider} />
        <p>or</p>
        <hr className={styles.divider} />
      </div>
      <button
        className={`${styles.secondaryBtn} ${styles.spotifyLogin}`}
        onClick={() => navigate("/signup")}
      >
        <FontAwesomeIcon icon={faCirclePlus} />
        Create Account
      </button>
    </div>
  );
};

export default LoginPage;
