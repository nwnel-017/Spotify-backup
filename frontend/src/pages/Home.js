import React, { useEffect, useState } from "react";
import Playlists from "./Playlists";
import {
  getSpotifyProfile,
  linkSpotifyAccount,
} from "../services/SpotifyService";
import { useAuth } from "../context/AuthContext";

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
    <div className="p-10">
      <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
      {profile && (
        <div className="mt-4">
          <div>
            <strong>Username:</strong> {profile.display_name}
          </div>
          <div>
            <strong>Followers:</strong> {profile.followers?.total}
          </div>
          <div>
            <strong>Email:</strong> {profile.email}
          </div>
          {profile.images?.length > 0 && (
            <img
              src={profile.images[0].url}
              alt="Profile"
              className="mt-4 rounded-full w-32 h-32 object-cover"
            />
          )}
          <div>
            <Playlists />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
