import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCloud } from "@fortawesome/free-regular-svg-icons";
import styles from "../pages/styles/Home.module.css";
import cloudIcon from "../assets/icons/croppedCloud.svg";
import musicIcon from "../assets/icons/music.svg";

const Logo = () => {
  return (
    <div className={styles.appLogo}>
      <div className={styles.iconWrapper}>
        <img src={cloudIcon} className={styles.cloudIcon} />
        <img src={musicIcon} className={styles.musicIcon} />
      </div>
    </div>
  );
};

export default Logo;
