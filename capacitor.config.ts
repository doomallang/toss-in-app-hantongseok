import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.doomole.hantongseok",
  appName: "한통속",
  webDir: "dist",
  plugins: {
    AdMob: {
      androidAppId: "ca-app-pub-6320975448857378~8415440001",
    },
  },
};

export default config;
