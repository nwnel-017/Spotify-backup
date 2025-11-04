import styles from "./styles/Home.module.css";

const PrivacyPolicy = ({ show, onClose }) => {
  return (
    <div className={`${styles.overlay} ${styles.active}`} onClick={onClose}>
      <div className={`${styles.popup} ${styles.scrollableWindow}`}>
        <h1>Privacy Policy</h1>
        <div className={styles.popupText}>
          <p>
            TuneBacker allows users to connect their Spotify account to back up
            and restore their playlists. We value your privacy and are committed
            to protecting your personal information.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            When you connect your Spotify account, we access limited data
            through Spotify’s Web API, including:
          </p>
          <ul>
            <li>Your Spotify user ID and display name</li>
            <li>Playlist IDs and the track IDs contained in your playlists</li>
          </ul>
          <p>
            To keep you connected to Spotify, we securely store authentication
            information (such as tokens) in encrypted form. This information is
            used only to maintain your connection and is deleted if you unlink
            your account
          </p>
          <p>
            We do <strong>not</strong> store any other sensitive data, such as
            your email or password.
          </p>
          <p>
            We do <strong>not</strong> access your followers, listening history,
            or private playback data.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected data solely to provide playlist backup and
            restore functionality. We do <strong>not</strong> use your
            information for advertising or analytics, and we do not sell or
            share your data with third parties.
          </p>

          <h2>3. Data Storage and Security</h2>
          <p>
            Your data is securely stored in our database hosted on{" "}
            <strong>Supabase</strong>. We apply standard security practices to
            protect your data from unauthorized access, alteration, or deletion.
          </p>

          <h2>4. Data Retention and Deletion</h2>
          <ul>
            <li>
              Your playlist backups remain stored until you delete them or
              unlink your Spotify account.
            </li>
            <li>
              You can delete your backups or disconnect Spotify at any time from
              within the app.
            </li>
            <li>
              When you disconnect, all associated Spotify data (including
              backups) is permanently deleted from our servers.
            </li>
          </ul>
          <p>
            You may also revoke our access to your Spotify account directly at{" "}
            <a href="https://www.spotify.com/account/apps">
              https://www.spotify.com/account/apps
            </a>
            .
          </p>

          <h2>5. Third-Party Services</h2>
          <p>This app uses:</p>
          <ul>
            <li>
              <strong>Spotify Web API</strong> — to access your playlists with
              your consent
            </li>
            <li>
              <strong>Supabase</strong> — to store backup data securely
            </li>
          </ul>
          <p>
            Both services may process data in accordance with their own privacy
            policies.
          </p>

          <h2>6. Your Rights</h2>
          <ul>
            <li>Access and review the Spotify data we store</li>
            <li>Delete your backups at any time</li>
            <li>Revoke Spotify access at any time</li>
          </ul>
          <p>
            If you revoke Spotify access, we automatically delete all stored
            data associated with your account.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be
            posted on this page with an updated “Last updated” date.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this privacy policy or your data, please
            contact us at:
          </p>
          <p>
            <strong>Email:</strong> support@[yourappdomain].com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
