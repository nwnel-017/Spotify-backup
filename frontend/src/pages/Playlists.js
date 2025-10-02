import { useEffect, useState, useContext } from "react";
import {
  fetchUserPlaylists,
  backupPlaylist,
  triggerWeeklyBackup,
} from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import Popup from "../components/Popup";
import { LoadingContext } from "../context/LoadingContext";
import { useLoading } from "../context/LoadingContext";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Playlists = ({ stopParentLoader }) => {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const pageLimit = 5;
  // amount of playlists to retrieve per request
  const apiLimit = 50;

  // Retry-aware API call with rate-limit logging
  const fetchPlaylistsWithRetry = async (offset, limit, retries = 3) => {
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
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
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
  };

  // To get all playlists quickly while ensuring we retrieve correct playlists
  const fetchAllPlaylists = async (limit = 50) => {
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

    return unique; // array of unique playlists
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      startLoading("page");
      try {
        const playlists = await fetchAllPlaylists();
        setAllPlaylists(playlists);
        setFilteredPlaylists(playlists);
      } catch (error) {
        console.error("Error fetching playlists", error);
      } finally {
        // setLoading({ active: false, type: null }); // turn off solid loader
        stopLoading("page");
        stopParentLoader?.(); // notify Home loader to stop
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

  const paginatedPlaylists = (filteredPlaylists || []).slice(
    page * pageLimit,
    page * pageLimit + pageLimit
  );

  const nextPage = () => {
    if ((page + 1) * pageLimit < filteredPlaylists.length) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const displayBackupOptions = (playlistId, playlistName) => {
    setShowPopup(true);
    setSelectedPlaylist([playlistId, playlistName]);
    console.log(showPopup);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedPlaylist(null);
  };

  return (
    <section className={styles.playlistsSection}>
      <div className={styles.playlistsHeader}>
        <h5>Playlists</h5>
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
        <button onClick={prevPage} disabled={page === 0}>
          &lt;
        </button>
        <button
          onClick={nextPage}
          disabled={(page + 1) * pageLimit >= filteredPlaylists.length}
        >
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
