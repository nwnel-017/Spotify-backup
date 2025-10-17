import styles from "./styles/Home.module.css";

const Help = ({ show, onClose }) => {
  return (
    <div className={`${styles.overlay} ${styles.active}`} onClick={onClose}>
      <div className={`${styles.popup} ${styles.scrollableWindow}`}>
        <h1>About</h1>
        <div className={styles.popupText}>
          <div>
            SpotSave is designed for music enthusiasts who want to keep their
            playlists safe.
          </div>
          <div>
            With a growing number of playlists, why worry about losing access to
            your favorite music?
          </div>
          <div>
            Once linking your spotify account, select a playlist from the
            homepage to backup. We provide the option to save a playlist as a
            CSV file (a snapshot of your current playlist that can be restored
            anytime), or save your playlist to be backed up weekly in SpotSave.
          </div>
          <div>
            From the 'My Backups' page, you can view and remove your weekly
            backups, or restore them to your Spotify account.
          </div>
          <div>
            Currently SpotSave is entirely free, and you will have the option to
            use our weekly backup feature for up to 10 playlists. This is an
            early version of SpotSave, and more features will be added soon!
            Soon you will be able to have a paid account with unlimited playlist
            backups!
          </div>
          <div>
            If you select 'Restore from a CSV File', you can upload a playist
            you backed up to a file.
          </div>
          <div>
            When you select a restore option, you will be asked to login to a
            spotify account where the playlist will be restored.
          </div>
          <div>
            If you lost access to your linked spotify account, don't worry! When
            you sign in to restore a playlist, you can restore the playlist to
            any Spotify account.
          </div>
          <div>
            Security and privacy is our primary concern. Anytime you login
            through Spotify to link your account or restore a playlist, we do
            not store any confidential information, such as your email or
            password. We use Spotify only for a one-time sign in, which occurs
            entirely in the Spotify application.
          </div>
          <div>
            SpotSave will continue to include more features as time goes on. If
            there are any questions, issues, or features you would like to see,
            please contact us at help@spotsave.com.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
