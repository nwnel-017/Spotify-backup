import styles from "../pages/styles/Home.module.css";
import { Player } from "@lottiefiles/react-lottie-player";
import { useLoading } from "./LoadingContext";

const GlobalLoading = () => {
  const { active, type } = useLoading();

  if (!active) return null;

  return (
    <div
      className={`${styles.loadingContext} ${
        type === "page" ? styles.fullPageLoader : styles.transparentLoader
      }`}
    >
      <Player
        autoplay
        loop
        src="/animations/DualRingSpinner.json" // if in /public
        className={styles.loadingAnimation}
      />
    </div>
  );
};

export default GlobalLoading;
