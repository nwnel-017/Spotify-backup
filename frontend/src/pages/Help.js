import styles from "./styles/Home.module.css";

const Help = ({ show, onClose }) => {
  return (
    <div className={`${styles.overlay} ${styles.active}`} onClick={onClose}>
      <div className={`${styles.popup} ${styles.scrollableWindow}`}>
        <h1>About</h1>
        <div className={styles.popupText}>
          <div>
            TuneBacker is designed for music enthusiasts who want to keep their
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
            anytime), or save your playlist to be saved weekly in TuneBacker.
          </div>
          <div>
            It is important to note that if you select to save a playlist weekly
            - TuneBacker saves a snapshot of your current playlist every week,
            using metadata from the playlist at that time. You have full
            ownership and control over this data, and can delete it from
            TuneBacker at any time.
          </div>
          <div>
            From the 'My Backups' page, you can view and remove your weekly
            backups, or restore them to your Spotify account.
          </div>
          <div>
            If you restore a playlist - TuneBacker creates a new playlist with
            the same name and tracks, using metadata from the playlist you
            selected to save weekly. TuneBacker does <strong>not</strong> add
            any playlists to your Spotify account without your permission.
          </div>
          <div>
            Currently TuneBacker is entirely free, and there is no limit to how
            many playlists you can save as a file. However, our weekly backup
            feature is only available for up to 5 playlists. This is an early
            version of TuneBacker, and more features will be added soon.
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
            TuneBacker will continue to include more features as time goes on.
            If there are any questions, issues, or features you would like to
            see, please contact us at tunebacker.help@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
