import styles from "../pages/styles/Home.module.css";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <button className={styles.closeButton} onClick={() => onClose()}>
        close
      </button>
      <ul className={styles.sidebarMenu}>
        <li>Home</li>
        <li>Restore a Playlist</li>
        <li>Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;
