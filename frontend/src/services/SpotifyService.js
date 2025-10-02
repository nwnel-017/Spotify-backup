import axios from "axios";
import { supabase } from "../supabase/supabaseClient";
import csv from "../utils/csv";

export const getSpotifyProfile = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/spotify/profile`,
      {
        withCredentials: true,
      }
    );
    console.log("Fetched Spotify profile:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  // To Do: sanitize input first and then send to backend
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const response = await axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
    {
      email,
      password,
    },
    {
      withCredentials: true,
    }
  );

  console.log("Login response:", response);

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.status}`);
  }

  return response;
};

// To Do: we are now using cookies to manage sessions
export const startSpotifyAuth = async (mode = "link") => {
  console.log("starting auth with mode " + mode);

  if (!mode) {
    throw new Error("Error: startSpotifyAuth called incorrectly!");
  }

  let endpoint;
  if (mode === "link") {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    endpoint = `${process.env.REACT_APP_API_BASE_URL}/auth/linkAccount`;
  } else if (mode === "login") {
    endpoint = `${process.env.REACT_APP_API_BASE_URL}/auth/loginWithSpotify`;
  }
  try {
    const res = await axios.get(endpoint, { withCredentials: true });

    if (res.status !== 200) {
      throw new Error("backend returned: " + res.status);
    }
    const { url } = await res.data;
    window.location.href = url;
  } catch (error) {
    console.log("Error retrieving Spotify URL: " + error);
  }
};

export const fetchUserPlaylists = async (offset = 0, limit = 50) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/spotify/playlists`,
    {
      withCredentials: true,
      params: { offset, limit },
    }
  );
  return res.data;
};

export async function getMyBackups() {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/backup/backups`,
      {
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    console.log("Error retrieving backups from backend: " + error);
  }
}

export async function backupPlaylist(playlistId, playlistName) {
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
        withCredentials: true,
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
  console.log("calling weekly backup API"); // successfully reached
  const res = await axios.post(
    "http://localhost:5000/api/backup/weekly",
    { playlistId, playlistName }, // POST body
    {
      withCredentials: true,
    }
  );

  if (res.status !== 200) {
    throw new Error(`Failed to trigger weekly backup: ${res.status}`);
  }

  return res;
}

export async function deleteBackup(playlistId) {
  if (!playlistId) {
    throw new Error("No backup ID provided to deleteBackup");
  }
  console.log("Deleting backup with ID: " + playlistId);
  try {
    const res = await axios.delete(
      `${process.env.REACT_APP_API_BASE_URL}/backup/delete/${playlistId}`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.log("Error deleting backup: " + error);
    throw error;
  }
}

export async function restorePlaylist(playlistId) {
  console.log("Restoring playlist with ID: " + playlistId);
  if (!playlistId) {
    throw new Error("No backup ID provided to restorePlaylist");
  }

  try {
    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/backup/restore/${playlistId}`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log("Error restoring backup: " + error);
    throw new Error("Error restoring backup: " + error.message);
  }
}

export async function uploadCSV(file) {
  console.log("Uploading CSV file:", file);
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/backup/upload`,
      file,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.error("Error uploading CSV file:", error);
    throw new Error("Error uploading CSV file: " + error.message);
  }
  return;
}
