import React, { useState } from "react";
import { signup } from "../services/SpotifyService";
import { supabase } from "../supabase/supabaseClient";

const SignupPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verficationSent, setVerificationSent] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to My Spotify App 🎵</h1>
      <form onSubmit={handleSignUp} className="w-full max-w-sm mt-6">
        <h1 className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md">
          Sign up for an Acount
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </form>
      <button
        onClick={handleSignUp}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md"
      >
        Sign Up
      </button>
      <button onClick={login}>
        Already Have an Account? Click Here to Login
      </button>
    </div>
  );
};

export default SignupPage;
