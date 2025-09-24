import React, { useState } from "react";
import { SignupPage } from "./Signup";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { startSpotifyAuth } from "../services/SpotifyService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setMessage("");
    console.log("Logging in with", { email, password });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Login failed: ${error.message}`);
    } else {
      console.log("Login successful!");
      // You can now redirect or fetch user data
      navigate("/home");
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
      </form>
      <button onClick={handleLogin} className={styles.submitButton}>
        Login
      </button>
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
