import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const base = mode === "github" ? "/js13k-snake/" : "";

  return defineConfig({
    base,
    server: {
      host: true,
    },
  });
};
