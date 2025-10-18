import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes before data is considered stale
      cacheTime: 1000 * 60 * 30, // 30 minutes before unused cache is garbage collected
      refetchOnWindowFocus: false, // don't refetch when user switches tabs
    },
  },
});

export default queryClient;
