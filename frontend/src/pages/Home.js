import React, { useEffect, useState } from "react";
import Playlists from "./Playlists";
import Popup from "../components/Popup";
import {
  getSpotifyProfile,
  linkSpotifyAccount,
} from "../services/SpotifyService";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import styles from "./styles/Home.module.css";

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountNotLinked, setAccountNotLinked] = useState(false);

  // To Do: implement logout to refresh supabase JWT
  // if that fails, log out user
  const handleUnauthorized = () => {
    console.log("User is not logged in. Redirecting to login page.");
    //logout();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getSpotifyProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response && error.response.status === 401) {
          // Unauthorized - user not logged in
          handleUnauthorized();
        }
        if (error.response && error.response.status === 403) {
          console.log("Spotify account not linked");
          setAccountNotLinked(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    if (profile) {
      setAccountNotLinked(false);
    }
  }, []);

  if (loading) {
    return <p className="text-gray-500 mt-4">Loading profile...</p>;
  }

  if (accountNotLinked) {
    return (
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <h1>
          Your Spotify account is not linked. Please link your account to access
          all features.
        </h1>
        <button onClick={linkSpotifyAccount}>
          Click Here to Link Your Account
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      ></link>
      <h1 className={styles.headerText}>Home</h1>
      {/* Profile */}
      <header className={styles.header}>
        <img
          src={
            (profile?.images.length > 0 && profile.images[0].url) ||
            "default-avatar.png"
          }
          alt="Profile"
          className={styles.profileImage}
        ></img>
        <h1 className={styles.headerText}>{profile?.display_name}</h1>
      </header>
      <div>
        <Playlists />
      </div>
    </div>
  );
};

export default Home;
