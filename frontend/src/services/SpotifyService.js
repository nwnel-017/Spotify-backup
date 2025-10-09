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

export const signupUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Missing email and / or password!");
  }

  const res = await axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
    {
      email,
      password,
    },
    { withCredentials: true }
  );

  if (res.status !== 200) {
    console.log(res.status);
    throw new Error("Error signing up!");
  }
};

export const loginUser = async (email, password) => {
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

// To Do: add third mode = "uploadPlaylist" -> we will have user login through OAuth when they restore a playlist
export const startSpotifyAuth = async (mode = "link") => {
  console.log("starting auth with mode " + mode);

  if (!mode) {
    throw new Error("Error: startSpotifyAuth called incorrectly!");
  }

  let endpoint;
  if (mode === "link") {
    endpoint = `${process.env.REACT_APP_API_BASE_URL}/auth/linkAccount`;
  } else if (mode === "login") {
    // how do we tell backend which mode we are?
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
  try {
    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/backup/weekly`,
      { playlistId, playlistName }, // POST body
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    throw {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || "UNKNOWN_ERROR",
      status: error.response?.status || 500,
    };
  }
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

  const endpoint = `${process.env.REACT_APP_API_BASE_URL}/backup/restore/${playlistId}`;
  const res = await axios.post(endpoint, {}, { withCredentials: true });

  if (res.status !== 200) {
    throw new Error("backend returned: " + res.status);
  }
  const { url } = await res.data;
  window.location.href = url;

  // try {
  //   await axios.post(
  //     `${process.env.REACT_APP_API_BASE_URL}/backup/restore/${playlistId}`,
  //     {},
  //     {
  //       withCredentials: true,
  //     }
  //   );
  // } catch (error) {
  //   console.log("Error restoring backup: " + error);
  //   throw new Error("Error restoring backup: " + error.message);
  // }
}

export async function uploadCSV(file, playlistName) {
  console.log("Uploading CSV file:", file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("playlistName", playlistName);
  try {
    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/backup/upload`,
      formData,
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("Error uploading CSV file:", error);
    throw new Error("Error uploading CSV file: " + error.message);
  }
  return;
}
