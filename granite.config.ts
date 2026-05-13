import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "connections",
  brand: {
    displayName: "커넥션스",
    primaryColor: "#5a594e",
    icon: "https://raw.githubusercontent.com/doomallang/toss-in-app-saving-map/main/public/icon.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
  webViewProps: {
    type: "partner",
  },
});
