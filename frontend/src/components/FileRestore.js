import styles from "../pages/styles/Home.module.css";
import { useState, useContext } from "react";
import axios from "axios";
import { LoadingContext } from "../context/LoadingContext";
import { uploadCSV } from "../services/SpotifyService";

const FileRestore = ({ active, onClose }) => {
  const [file, setFile] = useState(null);
  const { startLoading, stopLoading } = useContext(LoadingContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      startLoading("overlay");
      await uploadCSV(formData);
      alert("File uploaded successfully!");
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error uploading file: " + error);
      throw new Error("Error uploading file: " + error);
    } finally {
      stopLoading("overlay");
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`${styles.overlay} ${active ? styles.active : ""}`}
      onClick={onClose}
    >
      <div className={styles.popup} onClick={stopPropagation}>
        <h2>Select a File to Restore</h2>
        <form onSubmit={handleUpload} className={styles.fileUploadForm}>
          <input type="file" accept=".csv" onChange={handleFileChange}></input>
          <button type="submit" className={styles.navButton}>
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileRestore;
