import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getDirsAsync } from "./vite-utils/index";
import "dotenv/config";

const baseDir = "src";

export default defineConfig(async ({ command, mode }) => {
  const dirs = await getDirsAsync(baseDir);
  return {
    plugins: [react()],
    server: {
      hmr: { overlay: false },
      proxy: {
        "/api": "http://localhost:4000",
      },
    },
    resolve: {
      alias: {
        ...dirs,
      },
    },
    define: {
      "process.env": {
        ...Object.entries(process.env).reduce((sum, [key, val]) => {
          if (key.indexOf("REACT_APP") === 0) sum[key] = val;
          return sum;
        }, {}),
      },
    },
  };
});
