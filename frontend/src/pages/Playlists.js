import { useEffect, useState } from "react";
import {
  fetchUserPlaylists,
  backupPlaylist,
  triggerWeeklyBackup,
} from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Playlists = () => {
  // const { accessToken } = useAuth();
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const limit = 5;

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      console.log("fetching playlists");

      let fetchedPlaylists = [];
      let offset = 0;
      let total = 0;

      try {
        do {
          const data = await fetchUserPlaylists(offset, limit);
          fetchedPlaylists = [...fetchedPlaylists, ...(data.items || [])];
          total = data.total || 0;
          offset += limit;
        } while (offset < total);
        setAllPlaylists(fetchedPlaylists);
        setFilteredPlaylists(fetchedPlaylists || []);
      } catch (error) {
        console.error("Error fetching playlists", error);
      }
      setLoading(false);
    };

    fetchPlaylists();

    console.log(allPlaylists);
  }, []);

  // Handle search query
  useEffect(() => {
    const filtered = allPlaylists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPlaylists(filtered);
    setPage(0); // Reset to first page on search
  }, [searchQuery, allPlaylists]);

  const paginatedPlaylists = filteredPlaylists.slice(
    page * limit,
    page * limit + limit
  );

  const nextPage = () => {
    if ((page + 1) * limit < filteredPlaylists.length) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleWeeklyBackup = async (playlistId, playlistName) => {
    try {
      // Call your backend to trigger the weekly backup
      await triggerWeeklyBackup(playlistId, playlistName);

      // Notify user
      alert(`✅ Weekly backup successful for "${playlistName}"`);
    } catch (error) {
      console.error("Weekly backup error:", error);
      alert(`❌ Weekly backup failed for "${playlistName}"`);
    }
  };

  if (loading) return <p>Loading playlists...</p>;

  return (
    <section className={styles.playlistsSection}>
      <div className={styles.playlistsHeader}>
        <h5>Your Playlists</h5>
        <input
          type="text"
          placeholder="Search playlists..."
          className={styles.search}
          onChange={(e) => setSearchQuery(e.target.value)}
        ></input>
      </div>

      <ul className={styles.playlistList}>
        {paginatedPlaylists.length > 0 ? (
          paginatedPlaylists.map((playlist) => (
            <li key={playlist.id} className={styles.playlistItem}>
              <div>
                <div className={styles.playlistTitle}>{playlist.name}</div>
                <div className={styles.trackCount}>
                  {playlist.tracks.total} tracks
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowDown}
                className={styles.downloadIcon}
                onClick={() => backupPlaylist(playlist.id, playlist.name)}
              />
            </li>
          ))
        ) : (
          <p>No playlists found</p>
        )}
      </ul>
      <section className={styles.pagination}>
        <button
          onClick={nextPage}
          disabled={(page + 1) * limit >= filteredPlaylists.length}
        >
          &lt;
        </button>
        <button onClick={prevPage} disabled={page == 0}>
          &gt;
        </button>
      </section>
    </section>
    // <div className="mt-4">
    //   <h2 className="text-xl font-semibold">Your Playlists</h2>
    //   <input
    //     type="text"
    //     placeholder="Search playlists..."
    //     value={searchQuery}
    //     onChange={(e) => setSearchQuery(e.target.value)}
    //     className="border px-3 py-1 rounded w-full mb-4"
    //   />

    //   <ul className="space-y-2">
    //     {paginatedPlaylists.length > 0 ? (
    //       paginatedPlaylists.map((playlist) => (
    //         <li
    //           key={playlist.id}
    //           className="border p-2 rounded flex flex-row gap-1"
    //         >
    //           <p className="font-medium">{playlist.name}</p>
    //           <p className="text-sm text-gray-500">
    //             {playlist.tracks.total} tracks
    //           </p>
    //           <button
    //             id="backup-button"
    //             onClick={() => backupPlaylist(playlist.id, playlist.name)}
    //             className="ml-auto px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    //           >
    //             One-time Backup
    //           </button>
    //           <button
    //             id="weekly-backup-button"
    //             onClick={() => handleWeeklyBackup(playlist.id, playlist.name)}
    //             className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
    //           >
    //             Keep your playlist secure with a weekly backup
    //           </button>
    //         </li>
    //       ))
    //     ) : (
    //       <p className="text-gray-500">No playlists found.</p>
    //     )}
    //   </ul>

    //   <div className="flex justify-between mt-4">
    //     <button
    //       onClick={prevPage}
    //       disabled={page === 0}
    //       className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    //     >
    //       ← Prev
    //     </button>
    //     <button
    //       onClick={nextPage}
    //       disabled={(page + 1) * limit >= filteredPlaylists.length}
    //       className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    //     >
    //       Next →
    //     </button>
    //   </div>
    // </div>
  );
};

export default Playlists;
