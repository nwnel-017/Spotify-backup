import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getMyBackups } from "../services/SpotifyService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackups } from "../hooks/useBackups";
import styles from "./styles/Home.module.css";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RestoreOptions from "../components/RestoreOptions";
import FileRestore from "../components/FileRestore";
import {
  deleteBackup,
  restorePlaylist,
  startSpotifyAuth,
} from "../services/SpotifyService";
import { LoadingContext } from "../context/LoadingContext";
import { toast } from "react-toastify";
import queryClient from "../utils/query/QueryClient";

const Backups = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [showFileRestore, setShowFileRestore] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const { startLoading, stopLoading } = useContext(LoadingContext);

  const {
    data: backups = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useBackups();

  const toggleOptions = (id) => {
    setShowOptions(!showOptions);
    if (!selectedPlaylistId) {
      setSelectedPlaylistId(id);
    } else {
      setSelectedPlaylistId(null);
    }
  };

  const toggleFileRestore = () => {
    setShowFileRestore(!showFileRestore);
    if (!showFileRestore) {
      setShowFileRestore(true);
    } else {
      setShowFileRestore(false);
    }
  };

  // using mutation to remove backup from tan stack query data
  const removeBackupMutation = useMutation({
    mutationFn: async (id) => {
      if (!id) {
        throw new Error("Missing playlist id!");
      }
      return await deleteBackup(id);
    },
    onMutate: () => {
      startLoading("overlay");
    },
    onSuccess: (_, playlistId) => {
      console.log("id returned in mutation fuction: " + playlistId);
      queryClient.setQueryData(["spotify-backups"], (oldBackups) => {
        return oldBackups?.filter((b) => b.playlist_id !== playlistId);
      });
      toast.success("Backup removed successfully!");
      setSelectedPlaylistId(null);
    },
    onError: (error) => {
      console.error("Failed to delete backup:", error);
      toast.error("Failed to remove backup. Please try again.");
    },
    onSettled: () => {
      stopLoading("overlay");
    },
  });

  const removeBackup = () => {
    const id = selectedPlaylistId;
    if (!id) {
      console.log("Missing playlist id!");
      toast.error("Error removing playlist. Please try again!");
    }
    removeBackupMutation.mutate(id);
  };

  const restore = async () => {
    const playlistId = selectedPlaylistId;
    if (!playlistId) {
      throw new Error("No backup ID provided to restorePlaylist");
    }
    try {
      startLoading("overlay");
      await restorePlaylist(playlistId);
    } catch (error) {
      console.error("Error restoring backup: " + error);
      toast.error("Error restoring playlist. Please try again later!");
    } finally {
      stopLoading("overlay");
      setSelectedPlaylistId(null);
    }
  };

  useEffect(() => {
    if (!startLoading || !stopLoading) return;

    let stop = false;

    if (isFetching) {
      startLoading("page");
      stop = true;
    }

    return () => {
      if (stop) stopLoading("page");
    };
  }, [isFetching, startLoading, stopLoading]);

  return (
    <div>
      <section className={styles.playlistSection}>
        <div className={styles.playlistsHeader}>
          <h5>Select a Backup to Remove or Restore</h5>
        </div>
      </section>

      <ul className={styles.playlistList}>
        {backups?.length > 0
          ? backups.map((playlist) => (
              <li
                key={playlist.id}
                className={styles.playlistItem}
                onClick={() => toggleOptions(playlist.playlist_id)}
              >
                <div className={styles.playlistTitle}>
                  {playlist.playlist_name}
                </div>
                <div className={styles.iconContainer}>
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={styles.downloadIcon}
                  />
                </div>
              </li>
            ))
          : "Playlists not found"}
      </ul>
      {showOptions ? (
        <RestoreOptions
          active={showOptions}
          onClose={() => setShowOptions(!showOptions)}
          removeBackup={removeBackup}
          restorePlaylist={restore}
        />
      ) : (
        ""
      )}
      {showFileRestore ? (
        <FileRestore
          active={showFileRestore}
          onClose={() => setShowFileRestore(!showFileRestore)}
        />
      ) : (
        ""
      )}
      <div className={styles.alignCenter}>
        <button
          className={styles.navButton}
          onClick={() => toggleFileRestore()}
        >
          Restore Playlist From a CSV File
        </button>
      </div>
    </div>
  );
};

export default Backups;
