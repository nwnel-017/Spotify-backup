import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../context/LoadingContext";
import Playlists from "./Playlists";
import Sidebar from "../components/Sidebar";
import Backups from "./Backups";
import {
  getSpotifyProfile,
  linkSpotifyAccount,
  startSpotifyAuth,
} from "../services/SpotifyService";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import styles from "./styles/Home.module.css";

const Home = () => {
  const { navigate } = useNavigate();
  const [profile, setProfile] = useState(null);
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [accountNotLinked, setAccountNotLinked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewBackups, setViewBackups] = useState(false);

  // To Do: implement logout to refresh supabase JWT
  // if that fails, log out user
  // right now -> everytime the page is refreshed our user is logged out
  const handleUnauthorized = () => {
    console.log("User is not logged in. Redirecting to login page.");
    // logout();
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      throw new error("Error ending user session: " + error);
    }
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeWindows = () => {
    setSidebarOpen(!sidebarOpen);
    setViewBackups(!viewBackups);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      startLoading("page");
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
        stopLoading("page");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setAccountNotLinked(false);
    }
  }, [profile]);

  if (accountNotLinked) {
    return (
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <h1>
          Your Spotify account is not linked. Please link your account to access
          all features.
        </h1>
        <button onClick={() => startSpotifyAuth("link")}>
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
      {/* <h1 className={styles.headerText}>Home</h1>
      {/* Profile */}
      <header className={styles.header}>
        <button onClick={() => toggleSidebar()} className={styles.menuIcon}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => closeWindows()}
        viewBackups={() => {
          setViewBackups(!viewBackups);
          setSidebarOpen(!sidebarOpen);
        }}
      />
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
        {viewBackups ? (
          <Backups />
        ) : (
          <Playlists profileLoaded={!!profile} stopParentLoader={stopLoading} />
        )}
      </div>
    </div>
  );
};

export default Home;
