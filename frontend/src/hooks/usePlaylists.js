import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserPlaylists } from "../services/SpotifyService";

const apiLimit = 50;

// Retry-aware API call with rate-limit logging
async function fetchPlaylistsWithRetry(offset, limit, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchUserPlaylists(offset, limit);

      // If response.status exists, check for 429
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "1",
          10
        );
        console.warn(
          `Rate limit hit at offset ${offset}. Retrying in ${retryAfter}s (attempt ${
            attempt + 1
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue; // retry
      }

      return response; // success
    } catch (error) {
      console.error(`Error fetching offset ${offset}:`, error);
    }
  }
  throw new Error(
    `Failed to fetch playlists at offset ${offset} after ${retries} retries`
  );
}

// To get all playlists quickly while ensuring we retrieve correct playlists
async function fetchAllPlaylists(limit = 50) {
  console.log("Entered fetchAllPlaylists in usePlaylists!");
  let all = [];

  // Retrieve first page -> get total playlist count from response.total
  // const firstPage = await fetchUserPlaylists(0, apiLimit);
  const firstPage = await fetchPlaylistsWithRetry(0, apiLimit);

  all = firstPage.items || []; // set to first page -> 50 items
  const total = firstPage.total || 0;

  // Prepare batches of offsets to run in parallel
  const batchSize = 5; // number of pages to fetch in parallel per batch
  let offsets = [];
  for (let offset = apiLimit; offset < total; offset += apiLimit) {
    offsets.push(offset);
  }

  // Process batches sequentially to avoid rate limits
  for (let i = 0; i < offsets.length; i += batchSize) {
    const batchOffsets = offsets.slice(i, i + batchSize);
    const pages = await Promise.all(
      // batchOffsets.map((offset) => fetchUserPlaylists(offset, apiLimit))
      batchOffsets.map((offset) => fetchPlaylistsWithRetry(offset, apiLimit))
    );
    all = all.concat(pages.flatMap((p) => p.items || []));
  }

  // Removing duplicates
  const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());

  console.log("Finished fetching playlists! Returning result...");

  return unique; // array of unique playlists
}

export function usePlaylists() {
  return useQuery({
    queryKey: ["spotify-playlists"],
    queryFn: fetchAllPlaylists,
  });
}
