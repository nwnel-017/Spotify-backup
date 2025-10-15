import styles from "../pages/styles/Home.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

const Sidebar = ({ isOpen, goHome, onClose, viewBackups, logout }) => {
  const navigate = useNavigate();

  // const logout = async () => {
  //   try {
  //     await supabase.auth.signOut();
  //   } catch (error) {
  //     throw new error("Error ending user session: " + error);
  //   }
  //   navigate("/login");
  // };

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
        <li onClick={() => viewBackups()}>My Backups</li>
        <li onClick={() => logout()}>Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;
