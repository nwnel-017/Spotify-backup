import React, { useState } from "react";
import { signup } from "../services/SpotifyService";
import { supabase } from "../supabase/supabaseClient";
import styles from "./styles/Home.module.css";

const SignupPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordReenter, setPasswordReenter] = useState("");
  const [verficationSent, setVerificationSent] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    // To Do: fix -> this block doesnt work
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    } else if (!passwordReenter) {
      setErrorMessage("Please reenter your password");
      return;
    } else if (password != passwordReenter) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setErrorMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.REACT_APP_CLIENT_URL}/home`,
      },
    });

    if (error) {
      // toast.error("Error creating account");
      console.log("Error signing up:", error.message);
      return;
    } else {
      // toast.success("Verification email sent! Please check your inbox.");
      console.log("Verification email sent! Please check your inbox.");
    }
    setVerificationSent(true);
    console.log("Signup successful:", data);
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
