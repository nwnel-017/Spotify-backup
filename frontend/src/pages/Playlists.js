import { useEffect, useState } from "react";
import {
  fetchUserPlaylists,
  backupPlaylist,
  triggerWeeklyBackup,
} from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import Popup from "../components/Popup";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Playlists = () => {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const limit = 5;

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      console.log("fetching playlists");

      let offset = 0;

      try {
        const firstPage = await fetchUserPlaylists(offset, 50); // retrieve the first page
        const total = firstPage.total || 0; // total number of playlists for the profile
        console.log("Your total amount of playlists: " + total);

        const requests = []; // holds all of the requests to run in parallel
        for (let offset = 50; offset < total; offset += 50) {
          requests.push(fetchUserPlaylists(offset, 50));
        }

        const pages = await Promise.all(requests);

        const all = [
          ...(firstPage.items || []),
          ...pages.flatMap((p) => p.items || []),
        ];

        setAllPlaylists(all);
        setFilteredPlaylists(all);
      } catch (error) {
        console.error("Error fetching playlists", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
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

  const displayBackupOptions = (playlistId, playlistName) => {
    console.log("opening popup for playlist: " + playlistId);
    setShowPopup(true);
    setSelectedPlaylist([playlistId, playlistName]);
    console.log(showPopup);
  };

  const closePopup = () => {
    console.log("closing popup window");
    setShowPopup(false);
    setSelectedPlaylist(null);
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
                onClick={() => displayBackupOptions(playlist.id, playlist.name)}
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
      <div>
        <Popup
          show={showPopup}
          playlist={selectedPlaylist}
          onClose={closePopup}
        />
      </div>
    </section>
  );
};

export default Playlists;
