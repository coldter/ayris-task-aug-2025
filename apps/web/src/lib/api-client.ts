import { getHonoRpcClient } from "server/src/rcp-client";

export const apiRpc = getHonoRpcClient(
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
  {
    init: {
      credentials: "include",
    },
  },
);
