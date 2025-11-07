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
            through Spotify’s Web API, including: a) Your Spotify user ID and
            display name b) Playlist IDs and the track IDs contained in your
            playlists
          </p>
          <p>
            To keep you connected to Spotify, we securely store authentication
            information (such as tokens) in encrypted form. This information is
            used only to maintain your connection and is promptly deleted when
            you unlink your account or revoke access.
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
            We use the collected data solely to provide playlist saving and
            restoring functionality. We do <strong>not</strong> use your
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
              Your saved playlists will remain stored until you delete them or
              unlink your Spotify account.
            </li>
            <li>
              You can delete your saved playlists or disconnect Spotify at any
              time from within the app.
            </li>
            <li>
              When you disconnect, TuneBacker will immediately stop updating
              your saved playlists.
            </li>
          </ul>
          <p>
            You may also revoke our access to your Spotify account directly at{" "}
            <a
              href="https://www.spotify.com/account/apps"
              className={styles.link}
            >
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
            <li>Delete your saved playlist snapshots at any time</li>
            <li>Revoke Spotify access at any time</li>
          </ul>
          <p>
            If you revoke Spotify access, TuneBacker will stop updating your
            saved playlists. You can choose to delete your stored data at any
            time from within the app.
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
          <p>tunebacker.help@gmail.com</p>
          <p>
            TuneBacker uses Spotify’s Web API and OAuth authentication in
            accordance with Spotify’s Developer Terms of Service . TuneBacker is
            not affiliated with or endorsed by Spotify AB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
