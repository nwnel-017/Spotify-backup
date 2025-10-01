import styles from "../pages/styles/Home.module.css";
import { faArrowRotateRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RestoreOptions = ({ active, onClose, removeBackup, restorePlaylist }) => {
  return (
    <div
      className={`${styles.overlay} ${active ? styles.active : ""}`}
      onClick={onClose}
    >
      <div className={styles.popup}>
        <h2>I would like to</h2>
        <div className={styles.downloadOptions}>
          <div className={styles.backupOption}>
            <FontAwesomeIcon
              icon={faArrowRotateRight}
              className={styles.backupIcon}
              onClick={() => restorePlaylist()}
            />
            <h5>Restore my Playlist</h5>
          </div>
          <div className={styles.backupOption}>
            <FontAwesomeIcon icon={faTrash} onClick={() => removeBackup()} />
            <h5>Remove my Weekly Backup</h5>
          </div>
        </div>
        {/* <span className={`${styles.textFooter} ${styles.smallText}`}>
          Important Note: If you lost access to your Spotify account, please
          reconnect your account through the homepage and restore your playlist
        </span> */}
      </div>
    </div>
  );
};

export default RestoreOptions;
