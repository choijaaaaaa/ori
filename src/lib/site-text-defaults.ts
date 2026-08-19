// site_texts 테이블에 아직 값이 없을 때(최초 배포 직후 등) 보여줄 기본 문구.
export const APPLY_INTRO_KEY = "apply_intro";
export const APPLY_INTRO_DEFAULT = {
  jp: "日韓交流会への参加申し込みフォームです。お名前をご記入ください。",
  kr: "일한교류회 참가 신청 폼입니다. 이름을 입력해주세요.",
};

// 홈 화면 "소개" 문구 — 비워서 저장하면 섹션 자체가 숨겨지므로(삭제 대신), apply_intro와
// 달리 빈 값일 때 이 기본값으로 대체하지 않는다(DB에 실제로 빈 값이 있으면 그대로 숨김).
export const ABOUT_INTRO_KEY = "about_intro";
