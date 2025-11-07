import styles from "./styles/Home.module.css";

const Help = ({ show, onClose }) => {
  return (
    <div className={`${styles.overlay} ${styles.active}`} onClick={onClose}>
      <div className={`${styles.popup} ${styles.scrollableWindow}`}>
        <h1>About</h1>
        <div className={styles.popupText}>
          <div>
            TuneBacker is designed for Spotify users who want an easy way to
            back up their playlists safely.
          </div>
          <div>
            With a growing number of playlists, why worry about losing access to
            your favorite music?
          </div>
          <div>
            Once linking your spotify account, select a playlist from the
            homepage to save. We provide the option to save a playlist to your
            device as a .CSV file, or choose to have your playlist saved weekly
            in TuneBacker. Playlists that you choose to be saved weekly will be
            updated every Monday.
          </div>
          <div>
            When we save your playlist, we only save its metadata, such as
            playlist name track IDs from spotify. No audio files or playback
            data are ever stored or streamed. This creates a simple snapshot of
            your playlist’s structure at that moment in time.
          </div>
          <div>
            You can view and manage your saved backups anytime in the “My Saved
            Playlists” page. You can delete any backup whenever you wish.
          </div>
          <div>
            If you lose access to your playlist and wish to restore it, you can
            do so from the 'My Saved Playlists' page. We will create a new
            playlist in your spotify account with the same name and same tracks
            as your old playlist.
          </div>
          <div>
            You can also restore playlists from a .CSV file you previously
            downloaded.
          </div>
          <div>
            TuneBacker does <strong>not</strong> add any playlists to your
            Spotify account without your permission.
          </div>
          <div>
            Currently TuneBacker is entirely free, and there is no limit to how
            many playlists you can save to your device as a .CSV file. However,
            our weekly backup feature is only available for up to 5 playlists.
            This is an early version of TuneBacker, and more features will be
            added soon.
          </div>
          <div>
            If you lose access to your Spotify account, you can link a new
            Spotify account and use TuneBacker to recreate your playlists there.
            Please note that if your original Spotify account is disconnected or
            deleted, TuneBacker will stop updating your saved playlist snapshots
            automatically. You will still be able to restore your saved data
            while it remains in TuneBacker, or you may delete it at any time.
          </div>
          <div>
            When your account is unlinked, you can remove your saved playlists
            from TuneBacker, or select to restore them to a spotify account.
          </div>
          <div>
            Security and privacy are a top priority. TuneBacker never stores
            your Spotify password or email. Authentication happens securely
            through Spotify’s official login process.
          </div>
          <div>
            TuneBacker will continue to include more features as time goes on.
            If there are any questions, issues, or features you would like to
            see, please contact us at tunebacker.help@gmail.com.
          </div>
          <div>
            TuneBacker uses Spotify’s Web API and OAuth authentication in
            accordance with Spotify’s Developer Terms of Service . All Spotify
            content displayed or processed through TuneBacker follows Spotify’s
            data and branding requirements.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
