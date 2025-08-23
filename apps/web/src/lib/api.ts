import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "./api-client";

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

export const useTestCasesGroupedByTesters = () => {
  return useQuery({
    queryKey: ["test-cases-grouped"],
    queryFn: async () => {
      const response = await apiRpc.api["test-case"].$get();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useAvailableTesters = () => {
  return useQuery({
    queryKey: ["available-testers"],
    queryFn: async () => {
      const response = await apiRpc.api.tester["short-info-list"].$get();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - testers don't change frequently
    refetchOnWindowFocus: false,
  });
};

export const useCreateTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      testerIds: string[];
      description: string;
    }) => {
      const response = await apiRpc.api["test-case"].$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch test cases data after creation
      queryClient.invalidateQueries({ queryKey: ["test-cases-grouped"] });
    },
  });
};

export const useTestCaseDetails = (testCaseId: string) => {
  return useQuery({
    queryKey: ["test-case-details", testCaseId],
    queryFn: async () => {
      const response = await apiRpc.api["test-case"][":testCaseId"].$get({
        param: { testCaseId },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!testCaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
