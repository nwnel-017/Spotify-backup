import { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";
import styles from "../pages/styles/Home.module.css";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  backupPlaylist,
  triggerWeeklyBackup,
} from "../services/SpotifyService";
import { toast } from "react-toastify";

// To Do: move trigger weekly backup and one time backup functionality to this page
const Popup = ({ playlist, show, onClose }) => {
  const { startLoading, stopLoading } = useContext(LoadingContext);
  let playlistId, playlistName;

  const handleBackup = async (playlistId, playlistName) => {
    startLoading("overlay");
    try {
      await backupPlaylist(playlistId, playlistName);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while downloading your playlist!");
    } finally {
      stopLoading("overlay");
    }
  };

  const handleWeeklyBackup = async (playlistId, playlistName) => {
    startLoading("overlay");
    try {
      await triggerWeeklyBackup(playlistId, playlistName);
      toast.success(
        "Successfully backed up playlist! View 'Backups' page to manage your backup"
      );
    } catch (error) {
      console.log(error);
      if (error.code === "MAX_BACKUPS_REACHED") {
        toast.error(
          "You have already reached the limit of 5 scheduled backups! Please upgrade your account to save more playlists, or save as a CSV file"
        );
      } else if (error.code === "DUPLICATE_BACKUP") {
        toast.error("This playlist is already backed up!");
      } else {
        toast.error("Something went wrong while backing up");
      }
    } finally {
      stopLoading("overlay");
    }
  };

  if (playlist) {
    playlistId = playlist[0];
    playlistName = playlist[1];
  }

  return (
    <div
      className={`${styles.overlay} ${show ? styles.active : ""}`}
      onClick={onClose}
    >
      <div className={styles.popup}>
        <h2>I would like to:</h2>
        <div className={styles.downloadOptions}>
          <div
            className={styles.backupOption}
            onClick={() => handleBackup(playlistId, playlistName)}
          >
            <FontAwesomeIcon icon={faArrowDown} className={styles.backupIcon} />
            <span>Save playlist as a CSV file</span>
          </div>
          <div
            className={styles.backupOption}
            onClick={() => handleWeeklyBackup(playlistId, playlistName)}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
            Keep my playlist secure with a weekly backup
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
