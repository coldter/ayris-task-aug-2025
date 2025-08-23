import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface PingResponse {
  message: string;
  timestamp?: string;
  status: "ok" | "error";
}

export const useApiStatus = () => {
  return useQuery({
    queryKey: ["api-status"],
    queryFn: async (): Promise<PingResponse> => {
      const response = await fetch(`${BACKEND_URL}/ping`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the response to match our interface
      return {
        message: data.message || "Unknown response",
        timestamp: new Date().toISOString(),
        status: response.ok && data.dbStatus === true ? "ok" : "error",
      };
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
