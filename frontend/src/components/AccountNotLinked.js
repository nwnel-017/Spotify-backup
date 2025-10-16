import styles from "../pages/styles/Home.module.css";

const AccountNotLinked = ({ linkAccount }) => {
  return (
    <>
      <div className={`${styles.dashboard} ${styles.loginPage}`}>
        <h2>Please continue by linking your spotify account</h2>
        <div>
          No confidential information from your Spotify account will be saved in
          SpotSave
        </div>
        <button className={styles.secondaryBtn} onClick={() => linkAccount()}>
          Click Here to Link Your Account
        </button>
      </div>
    </>
  );
};

export default AccountNotLinked;
