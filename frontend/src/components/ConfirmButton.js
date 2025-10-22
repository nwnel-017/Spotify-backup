import styles from "../pages/styles/Home.module.css";

// should probably delete later
const ConfirmButton = ({ message, handleYes, handleNo }) => {
  return (
    <div>
      {message}
      <div className={styles.ynOptions}>
        <span
          className={`${styles.secondaryBtn} ${styles.ynBtn}`}
          onClick={() => handleYes()}
        >
          Yes
        </span>
        <span
          className={`${styles.secondaryBtn} ${styles.ynBtn}`}
          onClick={() => handleNo()}
        >
          No
        </span>
      </div>
    </div>
  );
};

export default ConfirmButton;
