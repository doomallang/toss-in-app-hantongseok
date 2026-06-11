import { useEffect, useState } from "react";

const BANNER_AD_ID = "ca-app-pub-6320975448857378/7023678736";

function isNative(): boolean {
  return typeof window !== "undefined" && !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
}

export function useAdMob() {
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    if (!isNative()) return;

    let mounted = true;

    async function init() {
      try {
        const { AdMob, BannerAdSize, BannerAdPosition } = await import("@capacitor-community/admob");

        await AdMob.initialize({ testingDevices: [] });

        if (!mounted) return;

        AdMob.addListener("bannerAdSizeChanged", (info: { height: number }) => {
          if (mounted) setBannerHeight(info.height);
        });

        await AdMob.showBanner({
          adId: BANNER_AD_ID,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });
      } catch (e) {
        console.warn("[AdMob] 초기화 실패:", e);
      }
    }

    init();

    return () => {
      mounted = false;
      if (!isNative()) return;
      import("@capacitor-community/admob")
        .then(({ AdMob }) => {
          AdMob.removeAllListeners();
          AdMob.removeBanner();
        })
        .catch(() => {});
    };
  }, []);

  return { isNative: isNative(), bannerHeight };
}
