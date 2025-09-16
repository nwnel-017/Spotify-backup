import React, { useState } from "react";
import { SignupPage } from "./Signup";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to My Spotify App 🎵</h1>
      <form onSubmit={handleLogin} className="w-full max-w-sm mt-6">
        <h1 className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md">
          Login To Your Account
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
        onClick={handleLogin}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md"
      >
        Login
      </button>
    </div>
  );
};

export default LoginPage;
