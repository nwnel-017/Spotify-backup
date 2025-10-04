import React, { useState } from "react";
import { signup } from "../services/SpotifyService";
import { supabase } from "../supabase/supabaseClient";
import { signupUser } from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import { toast } from "react-toastify";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordReenter, setPasswordReenter] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    // To Do: fix -> this block doesnt work
    if (!email || !password) {
      toast.error("Please enter both email and password!");
      return;
    } else if (!passwordReenter) {
      toast.error("Please reenter your password");
      return;
    } else if (password != passwordReenter) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await signupUser(email, password);
    } catch (error) {
      console.log("Error signing up!");
      // To Do: handle different error types here
      toast.error("There was an error signing up");
      return;
    }

    toast.success(
      "Verification email has been sent! Please follow the link to verify your account"
    );

    console.log("Signup successful");
  };

  const login = () => {
    window.location.href = `${process.env.REACT_APP_CLIENT_URL}/login`;
  };
  return (
    <div className={`${styles.dashboard} ${styles.loginPage}`}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignUp} className={styles.loginForm}>
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
        <input
          className={styles.formInput}
          type="password"
          placeholder="Re-enter Password"
          value={passwordReenter}
          onChange={(e) => setPasswordReenter(e.target.value)}
        ></input>
      </form>
      <button onClick={handleSignUp} className={styles.submitButton}>
        Login
      </button>
      <div className={styles.dividerContainer}>
        <hr className={styles.divider} />
        <button
          onClick={login}
          className={`${styles.secondaryBtn} ${styles.smallText}`}
        >
          Already Have an Account? Click Here
        </button>
        <hr className={styles.divider} />
      </div>
    </div>
  );
};

export default SignupPage;
