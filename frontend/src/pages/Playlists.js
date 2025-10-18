import { useEffect, useState, useContext, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserPlaylists,
  backupPlaylist,
  triggerWeeklyBackup,
} from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import Popup from "../components/Popup";
import { LoadingContext, useLoading } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePlaylists } from "../hooks/usePlaylists";

const Playlists = ({ stopParentLoader }) => {
  const { user, authLoading } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const pageLimit = 5;

  // using hooks/usePlaylists to handle retrieving all playlists with caching
  // uses tan stack query to cache all the playlists
  const {
    data: allPlaylists = [],
    isLoading,
    isError,
    refetch,
  } = usePlaylists();

  // new useEffect based on isLoading from usePlaylists()
  useEffect(() => {
    if (!startLoading || !stopLoading) return;

    if (isLoading) {
      startLoading("page");
      return () => stopLoading("page"); // cleanup function
    } else {
      stopLoading("page");
      stopParentLoader?.();
    }
  }, [isLoading]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const filteredPlaylists = useMemo(() => {
    return (allPlaylists || []).filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPlaylists, searchQuery]);

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
              <div className={styles.iconContainer}>
                {" "}
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className={styles.downloadIcon}
                  onClick={() =>
                    displayBackupOptions(playlist.id, playlist.name)
                  }
                />
              </div>
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
