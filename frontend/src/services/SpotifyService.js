import axios from "axios";
import { supabase } from "../supabase/supabaseClient";

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

export const linkSpotifyAccount = async () => {
  const session = await supabase.auth.getSession();
  const token = session.data.session.access_token;

  // Call backend to get Spotify auth URL
  const res = await fetch(
    `${process.env.REACT_APP_API_BASE_URL}/auth/linkAccount`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const { url } = await res.json();
  window.location.href = url;
};

// export const refreshSpotifyToken = async () => {
//   const response = await axios.post(
//     `${process.env.REACT_APP_API_BASE_URL}/spotify/refresh_token`
//   );
//   return response.data.access_token;
// };

export const fetchUserPlaylists = async (
  accessToken,
  offset = 0,
  limit = 50
) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/spotify/playlists`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { offset, limit },
    }
  );
  return res.data;
};

export async function backupPlaylist(accessToken, playlistId, limit, offset) {
  const response = await axios.post(
    `${process.env.API_BASE_URL}/backup/single`
  );
}

export async function triggerWeeklyBackup(
  accessToken,
  playlistId,
  playlistName
) {
  if (!accessToken || !playlistId || !playlistName) {
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

  if (!res.ok) {
    throw new Error(`Failed to trigger weekly backup: ${res.status}`);
  }

  return res;
}
