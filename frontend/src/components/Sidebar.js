import styles from "../pages/styles/Home.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

const Sidebar = ({
  isOpen,
  goHome,
  onClose,
  viewBackups,
  viewHelp,
  viewPrivacyPolicy,
  unlinkSpotify,
  logout,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <ul className={styles.sidebarMenu}>
        <li>
          <FontAwesomeIcon
            icon={faXmark}
            className={styles.exitIcon}
            onClick={() => onClose()}
          />
        </li>
        <li onClick={() => goHome()}>Home</li>
        <li onClick={() => viewBackups()}>My Saved Playlists</li>
        <li onClick={() => viewHelp()}>Help</li>
        <li onClick={() => viewPrivacyPolicy()}>Privacy Policy</li>
        <li onClick={() => unlinkSpotify()}>Unlink Spotify</li>
        <li onClick={() => logout()}>Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;
