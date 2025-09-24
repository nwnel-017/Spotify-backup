import { useEffect, useState } from "react";
import axios from "axios";
import { getMyBackups } from "../services/SpotifyService";
import styles from "./styles/Home.module.css";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RestoreOptions from "../components/RestoreOptions";

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const toggleOptions = (id) => {
    setShowOptions(!showOptions);
    if (!selectedPlaylist) {
      setSelectedPlaylist(id);
    } else {
      setSelectedPlaylist(null);
    }
  };

  useEffect(() => {
    console.log("use effect hook");

    const fetchBackups = async () => {
      try {
        const res = await getMyBackups();
        setBackups(res);
        console.log(backups);
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
          playlist={selectedPlaylist}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default Backups;
