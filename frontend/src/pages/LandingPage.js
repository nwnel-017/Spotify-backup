import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import Logo from "../components/Logo";
import styles from "../pages/styles/Home.module.css";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.landingPage}>
      <div className={styles.contentContainer}>
        <div className={styles.innerContent}>
          <Logo />
          <div className={styles.landingContent}>
            <div className={styles.titleText}>TuneBacker</div>
            <div className={styles.subTitleText}>
              Keep your playlists safe for free - backup and restore anytime
            </div>
            <div className={styles.landingButtons}>
              <button
                className={styles.signupBtnHollow}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
              <button
                className={`${styles.loginBtnHollow} ${styles.footerText}`}
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <Logo /> */}
    </div>
  );
};

export default LandingPage;
