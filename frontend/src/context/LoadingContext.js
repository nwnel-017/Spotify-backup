import { createContext, useContext, useState } from "react";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [pageLoadingCount, setPageLoadingCount] = useState(0);
  const [overlayLoadingCount, setOverlayLoadingCount] = useState(0);

  const startLoading = (type = "overlay") => {
    if (type === "page") setPageLoadingCount((count) => count + 1);
    else setOverlayLoadingCount((count) => count + 1);
  };

  const stopLoading = (type = "overlay") => {
    if (type === "page") setPageLoadingCount((count) => Math.max(0, count - 1));
    else setOverlayLoadingCount((count) => Math.max(0, count - 1));
  };

  const active = pageLoadingCount > 0 || overlayLoadingCount > 0;
  const type =
    pageLoadingCount > 0 ? "page" : overlayLoadingCount > 0 ? "overlay" : null;

  return (
    <LoadingContext.Provider
      value={{
        active,
        type,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
