import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getMyBackups } from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RestoreOptions from "../components/RestoreOptions";
import { deleteBackup, restorePlaylist } from "../services/SpotifyService";
import { LoadingContext } from "../context/LoadingContext";

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [message, setMessage] = useState("");

  const toggleOptions = (id) => {
    setShowOptions(!showOptions);
    if (!selectedPlaylist) {
      setSelectedPlaylist(id);
    } else {
      setSelectedPlaylist(null);
    }
  };

  const removeBackup = async () => {
    const playlistId = selectedPlaylist;
    console.log("Removing backup with id: " + playlistId);
    try {
      startLoading("overlay");
      const res = await deleteBackup(playlistId);
      setMessage("Backup successfully removed.");
    } catch (error) {
      console.error("Error deleting backup: " + error);
      setMessage("Error deleting backup. Please try again later.");
    } finally {
      stopLoading("overlay");
      setBackups(backups.filter((b) => b.id !== playlistId));
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
    }
  };

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const res = await getMyBackups();
        setBackups(res);
      } catch (error) {
        console.log("Error retrieving backups from Backup component: " + error);
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
                onClick={() => toggleOptions(playlist.id)}
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
    </div>
  );
};

export default Backups;
