import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getMyBackups } from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RestoreOptions from "../components/RestoreOptions";
import FileRestore from "../components/FileRestore";
import { deleteBackup, restorePlaylist } from "../services/SpotifyService";
import { LoadingContext } from "../context/LoadingContext";

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showFileRestore, setShowFileRestore] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [message, setMessage] = useState("");

  const toggleOptions = (id) => {
    setShowOptions(!showOptions);
    console.log("selected playlist: " + id);
    if (!selectedPlaylist) {
      setSelectedPlaylist(id);
    } else {
      setSelectedPlaylist(null); // this gets hit sometimes when we select a new playlist
    }
  };

  const toggleFileRestore = () => {
    setShowFileRestore(!showFileRestore);
    if (!showFileRestore) {
      setShowFileRestore(true);
    } else {
      setShowFileRestore(false);
    }
  };

  const removeBackup = async () => {
    const playlistId = selectedPlaylist;
    try {
      startLoading("overlay");
      const res = await deleteBackup(playlistId);
      setMessage("Backup successfully removed.");
    } catch (error) {
      console.error("Error deleting backup: " + error);
      setMessage("Error deleting backup. Please try again later.");
    } finally {
      stopLoading("overlay");
      setSelectedPlaylist(null);
      setBackups(backups.filter((b) => b.playlist_id !== playlistId));
    }
  };

  const restore = async () => {
    const playlistId = selectedPlaylist;
    console.log("Restoring backup with id: " + playlistId);
    if (!playlistId) {
      throw new Error("No backup ID provided to restorePlaylist");
    }
    try {
      startLoading("overlay");
      await restorePlaylist(playlistId);
      // toast success
    } catch (error) {
      console.error("Error restoring backup: " + error);
      setMessage("Error restoring backup. Please try again later.");
    } finally {
      stopLoading("overlay");
      setSelectedPlaylist(null);
      // setBackups(backups.filter((b) => b.id !== playlistId));
    }
  };

  useEffect(() => {
    const fetchBackups = async () => {
      startLoading("page");
      try {
        const res = await getMyBackups();
        setBackups(res);
      } catch (error) {
        console.log("Error retrieving backups from Backup component: " + error);
      } finally {
        stopLoading("page");
      }
    };

    fetchBackups();
  }, []);

  return (
    <div>
      <section className={styles.playlistSection}>
        <div className={styles.playlistsHeader}>
          <h5>Select a Backup to Remove or Restore</h5>
        </div>
      </section>

      <ul className={styles.playlistList}>
        {backups?.length > 0
          ? backups.map((playlist) => (
              <li
                key={playlist.id}
                className={styles.playlistItem}
                onClick={() => toggleOptions(playlist.playlist_id)}
              >
                <div className={styles.playlistTitle}>
                  {playlist.playlist_name}
                </div>
                <FontAwesomeIcon
                  icon={faCheck}
                  className={styles.downloadIcon}
                />
              </li>
            ))
          : "Playlists not found"}
      </ul>
      {showOptions ? (
        <RestoreOptions
          active={showOptions}
          onClose={() => setShowOptions(!showOptions)}
          removeBackup={removeBackup}
          restorePlaylist={restore}
        />
      ) : (
        ""
      )}
      {showFileRestore ? (
        <FileRestore
          active={showFileRestore}
          onClose={() => setShowFileRestore(!showFileRestore)}
        />
      ) : (
        ""
      )}
      <div className={styles.alignCenter}>
        <button
          className={styles.navButton}
          onClick={() => toggleFileRestore()}
        >
          Restore Playlist From a CSV File
        </button>
      </div>
    </div>
  );
};

export default Backups;
