import React, { useState } from "react";
import { SignupPage } from "./Signup";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { startSpotifyAuth, loginUser } from "../services/SpotifyService";
import { validateInput } from "./../utils/validator";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
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

    const {
      valid,
      email: sanitizedEmail,
      password: sanitizedPassword,
    } = validateInput(email, password);

    if (!valid) {
      setMessage("Invalid email or password format.");
      return;
    }

    try {
      const res = await loginUser(email, password);
      console.log("Login successful");
      if (res.status !== 200) {
        setMessage("Login failed: " + res.statusText);
        console.log("Login failed with status", res.status);
        return;
      }
      await getUser();
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed: " + error.message);
    }
  };

  const handleSignUp = () => {
    window.location.href = `${process.env.REACT_APP_CLIENT_URL}/`;
  };
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
      {/* <button onClick={handleLogin} className={styles.submitButton}>
        Login
      </button> */}
      <div className={styles.dividerContainer}>
        <hr className={styles.divider} />
        <p>or</p>
        <hr className={styles.divider} />
      </div>
      <button
        className={`${styles.secondaryBtn} ${styles.spotifyLogin}`}
        onClick={() => startSpotifyAuth("login")}
      >
        <FontAwesomeIcon icon={faSpotify} />
        Login with Spotify
      </button>
    </div>
  );
};

export default LoginPage;
