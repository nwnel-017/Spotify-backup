import styles from "../pages/styles/Home.module.css";
import { LoadingContext } from "../context/LoadingContext";
import { useContext } from "react";
import { unlinkSpotifyAccount } from "../services/SpotifyService";
import { toast } from "react-toastify";

const UnlinkAccount = ({ isOpen, onClose }) => {
  const { startLoading, stopLoading } = useContext(LoadingContext);

  const handleUnlink = async (e) => {
    e.stopPropagation();
    console.log("Unlinking account...");
    try {
      startLoading("page");
      await unlinkSpotifyAccount();
      console.log("Spotify account unlinked successfully.");
    } catch (error) {
      console.error("Error unlinking Spotify account:", error);
      toast.error("Error unlinking Spotify account. Please try again.");
    } finally {
      stopLoading("page");
      onClose();
    }
  };

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.active : ""}`}
      onClick={onClose}
    >
      <div className={styles.popup}>
        <h3>Are You Sure You Would Like to Unlink Your Spotify Account?</h3>
        <div className={styles.confirmOptions}>
          <span>
            <h3 className={styles.confirmBtn}>No</h3>
          </span>
          <span>
            <h3 className={styles.confirmBtn} onClick={(e) => handleUnlink(e)}>
              Yes
            </h3>
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnlinkAccount;
