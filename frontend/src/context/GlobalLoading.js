import { useContext } from "react";
import { LoadingContext } from "./LoadingContext";
import styles from "../pages/styles/Home.module.css";
import { Player } from "@lottiefiles/react-lottie-player";

const GlobalLoading = () => {
  const { loading } = useContext(LoadingContext);

  if (!loading) {
    return null;
  }

  return (
    <div className={styles.loadingContext}>
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
