import axios from "axios";
import csv from "../utils/csv";
import api from "../utils/axios/api";

export const getSpotifyProfile = async () => {
  try {
    const response = await api.get("/spotify/profile");
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

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
      {
        email,
        password,
      },
      { withCredentials: true }
    );

    if (res.status !== 200) {
      console.log(
        "Unexpected status returned: " + res.status + ": " + res.statusText
      );
    }
    return res.data;
  } catch (error) {
    console.log("Error logging in: " + error);
    throw new Error("Error logging in!");
  }
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
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
    return response;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      const err = new Error(data.message);
      err.status = status;
      err.code = data.message;
      throw err;
    } else {
      const err = new Error("Network error");
      err.status = 0;
      err.code = "NETWORK_ERROR";
      throw err;
    }
  }
};

export const logoutUser = async () => {
  console.log("logging out...");
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/auth/logout`,
    { withCredentials: true }
  );
  return response.status;
};

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
    const res = await api.get(endpoint);

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
  const res = await api.get("/spotify/playlists", {
    params: { offset, limit },
  });
  return res.data;
};

export async function getMyBackups() {
  try {
    const res = await api.get("/backup/backups");

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
    const response = await api.post(
      `/backup/single/${playlistId}`,
      {},
      {
        responseType: "blob",
      }
    );
    const blob = response.data; // Access binary data from response.data
    const url = window.URL.createObjectURL(blob); // error here
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
    await api.post("/backup/weekly", { playlistId, playlistName });
  } catch (error) {
    throw {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || "UNKNOWN_ERROR",
      status: error.response?.status || 500,
    };
  }
}

export async function deleteBackup(playlistId) {
  console.log("hit deleteBackup() in service! deleting playlist " + playlistId);
  if (!playlistId) {
    throw new Error("No backup ID provided to deleteBackup");
  }
  console.log("Deleting backup with ID: " + playlistId);
  try {
    const res = await api.delete(`/backup/delete/${playlistId}`);
    return res.data;
  } catch (error) {
    console.log("Error deleting backup: " + error);
    throw error;
  }
}

export async function restorePlaylist(playlistId) {
  if (!playlistId) {
    throw new Error("No backup ID provided to restorePlaylist");
  }

  const res = await api.post(`/backup/restore/${playlistId}`, {});

  if (res.status !== 200) {
    throw new Error("backend returned: " + res.status);
  }
  const { url } = await res.data;
  window.location.href = url;
}

export async function uploadCSV(file, playlistName) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("playlistName", playlistName);
  try {
    const res = await api.post("/backup/upload", formData);
    const { url } = await res.data;
    window.location.href = url;
  } catch (error) {
    console.error("Error uploading CSV file:", error);
    throw new Error("Error uploading CSV file: " + error.message);
  }
  return;
}
