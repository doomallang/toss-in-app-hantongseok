import { useEffect } from "react";

/**
 * 안드로이드 뒤로가기 버튼 처리.
 * active=true 일 때 히스토리 엔트리를 하나 쌓고,
 * 뒤로가기가 오면 onBack 을 호출해 모달을 닫는다.
 * active=false 가 되면 쌓인 엔트리를 제거한다.
 */
export function useBackButton(active: boolean, onBack: () => void) {
  useEffect(() => {
    if (!active) return;

    // 모달이 열릴 때 더미 히스토리 엔트리 추가
    window.history.pushState({ backModal: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // 우리가 쌓은 엔트리가 pop 되면 모달 닫기
      if (!e.state?.backModal) return;
      onBack();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // 모달이 코드로 닫힐 때(버튼 클릭 등) 쌓은 엔트리 제거
      if (window.history.state?.backModal) {
        window.history.back();
      }
    };
  }, [active, onBack]);
}
