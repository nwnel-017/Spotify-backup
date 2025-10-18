import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyBackups } from "../services/SpotifyService";

async function fetchBackups() {
  try {
    const res = await getMyBackups();
    return res;
  } catch (error) {
    console.log("Error retrieving backups from Backup component: " + error);
  }
}

export function useBackups() {
  return useQuery({
    queryKey: ["spotify-backups"],
    queryFn: fetchBackups,
  });
}
