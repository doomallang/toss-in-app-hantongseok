import { useBackButton } from "../hooks/useBackButton";

interface Props {
  onClose: () => void;
}

const STEPS = [
  {
    title: "커넥션스란?",
    desc: "16개 단어 중 공통점이 있는 단어를 4개씩 골라 그룹을 맞추는 게임이에요.",
    visual: (
      <div className="tutorial-grid">
        {["짜장면", "냉면", "짬뽕", "칼국수", "비빔밥", "삼계탕", "된장찌개", "볶음밥",
          "갈비탕", "순두부찌개", "설렁탕", "김치찌개", "돌솥밥", "해장국", "부대찌개", "영양밥"]
          .map((w) => (
            <div key={w} className="tutorial-word">{w}</div>
          ))}
      </div>
    ),
  },
  {
    title: "4개를 선택하고 제출",
    desc: "공통점이 있다고 생각하는 단어 4개를 선택한 뒤 제출 버튼을 누르세요.",
    visual: (
      <div className="tutorial-grid">
        {[
          { w: "짜장면", sel: true },
          { w: "냉면", sel: true },
          { w: "짬뽕", sel: true },
          { w: "칼국수", sel: true },
          { w: "비빔밥", sel: false },
          { w: "삼계탕", sel: false },
          { w: "된장찌개", sel: false },
          { w: "볶음밥", sel: false },
        ].map(({ w, sel }) => (
          <div key={w} className={`tutorial-word${sel ? " tutorial-word--selected" : ""}`}>{w}</div>
        ))}
      </div>
    ),
  },
  {
    title: "난이도는 4단계",
    desc: "쉬운 것부터 노랑 → 초록 → 파랑 → 보라 순이에요. 보라색은 꽤 어려워요!",
    visual: (
      <div className="tutorial-levels">
        {[
          { color: "#f9df6d", label: "쉬움", example: "배달의민족 · 쿠팡이츠 · 요기요 · 땡겨요" },
          { color: "#a0c35a", label: "보통", example: "카리나 · 윈터 · 지젤 · 닝닝" },
          { color: "#b0c4ef", label: "어려움", example: "박연폭포 · 구천동폭포 · 직소폭포 · 정방폭포" },
          { color: "#ba81c5", label: "최고난도", example: "태형 · 장형 · 도형 · 유형" },
        ].map(({ color, label, example }) => (
          <div key={label} className="tutorial-level-row" style={{ background: color }}>
            <span className="tutorial-level-label">{label}</span>
            <span className="tutorial-level-example">{example}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "기회는 4번",
    desc: "틀릴 때마다 기회가 1개씩 줄어요. 기회가 모두 없어지면 게임 종료!",
    visual: (
      <div className="tutorial-lives-wrap">
        <div className="tutorial-lives">
          {[true, true, false, false].map((active, i) => (
            <div key={i} className={`tutorial-dot${active ? " tutorial-dot--active" : ""}`} />
          ))}
        </div>
        <p className="tutorial-lives-desc">남은 기회 2개</p>
        <div className="tutorial-tip">
          <span className="tutorial-tip-icon">💡</span>
          <span>3개 맞으면 "하나만 더!" 힌트를 알려드려요</span>
        </div>
      </div>
    ),
  },
];

const TUTORIAL_KEY = "connections-tutorial-seen";

export function markTutorialSeen() {
  localStorage.setItem(TUTORIAL_KEY, "1");
}

export function isTutorialSeen(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) === "1";
}

export function TutorialModal({ onClose }: Props) {
  const handleClose = () => {
    markTutorialSeen();
    onClose();
  };

  useBackButton(true, handleClose);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-steps">
          {STEPS.map((step, i) => (
            <div key={i} className="tutorial-step">
              <div className="tutorial-step-header">
                <span className="tutorial-step-num">{i + 1}</span>
                <h3 className="tutorial-step-title">{step.title}</h3>
              </div>
              <p className="tutorial-step-desc">{step.desc}</p>
              <div className="tutorial-visual">{step.visual}</div>
            </div>
          ))}
        </div>

        <button className="share-btn" onClick={handleClose}>
          시작하기
        </button>
      </div>
    </div>
  );
}
