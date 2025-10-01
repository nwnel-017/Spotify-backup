import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import styles from "../pages/styles/Home.module.css";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.landingPage}>
      <div className={styles.contentContainer}>
        <Player
          autoplay
          loop
          src="/animations/LaptopAnimation.json"
          className={styles.laptopAnimation}
        />
        <div className={styles.landingContent}>
          <h1>Listen Freely, Securely</h1>
          <div className={styles.smallText}>
            Keep your playlists safe, everywhere
          </div>
          <div className={styles.landingButtons}>
            <button
              className={styles.loginBtnHollow}
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
            <button
              className={styles.signupBtnHollow}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
