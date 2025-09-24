import axios from "axios";
import { supabase } from "../supabase/supabaseClient";
import csv from "../utils/csv";

export const getSpotifyProfile = async () => {
  //get supabase token
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session
    ? session.data.session.access_token
    : null;

  let response;
  try {
    response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/spotify/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // sends Supabase JWT
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    throw error;
  }
};

export const startSpotifyAuth = async (mode = "link") => {
  console.log("starting auth with mode " + mode);

  if (!mode) {
    throw new Error("Error: startSpotifyAuth called incorrectly!");
  }

  let headers = {};
  if (mode === "link") {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    headers = mode === "link" ? { Authorization: `Bearer ${token}` } : {}; /// we have an error logging in -> probably because there are no headers
  }
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/auth/login?mode=${mode}`,
      { headers }
    );

    if (!res.ok) {
      throw new Error("backend returned: " + res.status);
    }
    const { url } = await res.json();
    console.log(url);
    window.location.href = url;
  } catch (error) {
    console.log("Error retrieving Spotify URL: " + error);
  }
};

export const linkSpotifyAccount = async () => {
  const session = await supabase.auth.getSession();
  const token = session.data.session.access_token;

  if (!token) {
    throw new Error("User is not authenticated");
  }
  // Call backend to get Spotify auth URL
  const res = await fetch(
    `${process.env.REACT_APP_API_BASE_URL}/auth/linkAccount`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const { url } = await res.json();
  console.log("Redirecting to Spotify auth URL:", url);
  window.location.href = url;
};

// export const refreshSpotifyToken = async () => {
//   const response = await axios.post(
//     `${process.env.REACT_APP_API_BASE_URL}/spotify/refresh_token`
//   );
//   return response.data.access_token;
// };

export const fetchUserPlaylists = async (offset = 0, limit = 50) => {
  const session = await supabase.auth.getSession();
  const token = session.data.session.access_token;
  const res = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/spotify/playlists`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { offset, limit },
    }
  );
  return res.data;
};

export async function getMyBackups() {
  console.log("fetching backups in frontend service");
  const session = await supabase.auth.getSession();
  const token = session.data.session.access_token;

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/backup/backups`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.data;
  } catch (error) {
    console.log("Error retrieving backups from backend: " + error);
  }
}

export async function backupPlaylist(playlistId, playlistName) {
  const session = await supabase.auth.getSession();
  const token = session.data.session.access_token;

  console.log("service - Backing up playlist:", playlistId, playlistName);

  if (!playlistId || !playlistName) {
    throw new Error("Playlist ID or name missing!");
  }
  console.log(
    "calling backend api route with: " +
      `${process.env.REACT_APP_API_BASE_URL}/backup/single/${playlistId}`
  );
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/backup/single/${playlistId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Set response type to blob
      }
    );
    const blob = response.data; // Access binary data from response.data
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = csv.getFileName(playlistName);
    link.href = url;
    link.download = `${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error triggering backup:", error);
    throw error;
  }
}

export async function triggerWeeklyBackup(playlistId, playlistName) {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session.access_token;
  if (!accessToken || !playlistId) {
    throw new Error("Missing required parameters for weekly backup");
  }
  console.log("calling weekly backup API"); // successfully reached
  const res = await axios.post(
    "http://localhost:5000/api/backup/weekly",
    { playlistId, playlistName }, // POST body
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (res.status !== 200) {
    throw new Error(`Failed to trigger weekly backup: ${res.status}`);
  }

  return res;
}
