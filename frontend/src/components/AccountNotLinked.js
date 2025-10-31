import styles from "../pages/styles/Home.module.css";

const AccountNotLinked = ({ linkAccount }) => {
  return (
    <>
      <div className={styles.loginPage}>
        <h2>Please continue by linking your spotify account</h2>
        <div>
          No confidential information from your Spotify account will be saved
        </div>
        {/* <div>
          If you currently have playlists saved and lost access to your account,
          you can still remove / restore them from the 'My Backups' page
        </div> */}
        <button className={styles.secondaryBtn} onClick={() => linkAccount()}>
          Click Here to Link Your Account
        </button>
      </div>
    </>
  );
};

export default AccountNotLinked;
