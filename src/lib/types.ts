// 예정/진행된 교류회 회차. 날짜별로 여러 개 존재할 수 있어 카드 목록으로 보여준다.
export interface EventPost {
  id: string;
  title: string;
  content: string;
  eventDate?: string; // 모임 일자 (YYYY-MM-DD, 선택)
  coverPhotoUrl?: string; // 카드 대표 사진
  venueMapUrl?: string; // 지도 앱(구글맵 등)에서 공유한 위치 링크 — 오시는 길의 주된 안내 수단
  venueInfo?: string; // 지도 링크에 곁들이는 보충 설명 (선택)
  capacity?: number; // 정원 (선택, 없으면 무제한)
  closed: boolean; // 관리자가 수동으로 마감했는지
  sortOrder: number; // 홈 화면 노출 순서 (관리자가 드래그로 직접 조정)
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number; // 갤러리 노출 순서 (관리자가 드래그로 직접 조정)
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  participantName: string;
  contact?: string;
  answers: Record<string, string>;
  eventId?: string; // 어느 회차에 대한 설문인지 (선택)
  submittedAt: string;
}

export interface ParticipantNote {
  id: string;
  participantName: string;
  note: string;
  tags: string[];
  createdAt: string;
}

export type ApplicationStatus = "pending" | "confirmed" | "attended" | "cancelled";

export interface Application {
  id: string;
  name: string;
  contact?: string;
  message?: string;
  eventId?: string; // 어느 회차에 신청한 것인지 (선택, 미지정이면 일반 문의로 취급)
  status: ApplicationStatus;
  answers: Record<string, string>; // apply_form_fields의 field_key를 키로 하는 동적 응답
  submittedAt: string;
}

// 관리자가 코드 수정 없이 직접 고칠 수 있는 사이트 문구(일본어 메인 + 한국어 보조).
export interface SiteText {
  key: string;
  valueJp: string;
  valueKr: string;
}

export type ApplyFormFieldType =
  | "text"
  | "textarea"
  | "radio_group" // 단일 선택
  | "checkbox_group" // 다중 선택(또는 require_all=true면 전부 체크해야 하는 동의 항목)
  | "checkbox" // 단일 체크(예/아니오)
  | "image"; // 관리자가 올린 안내 이미지를 보여주기만 하는 정보성 블록(응답 없음)

export interface ApplyFormFieldOption {
  jp: string;
  kr: string;
}

// 참가 신청 폼의 이름/희망 회차를 제외한 나머지 문항 — 관리자가 추가/삭제/순서변경 가능.
export interface ApplyFormField {
  id: string;
  fieldKey: string;
  type: ApplyFormFieldType;
  labelJp: string;
  labelKr: string;
  helpJp?: string;
  helpKr?: string;
  options: ApplyFormFieldOption[]; // radio_group/checkbox_group 전용
  required: boolean;
  requireAll: boolean; // checkbox_group에서 true면 옵션 전부 체크해야 필수 통과(동의 체크리스트용)
  imageUrl?: string; // type: "image" 전용
  sortOrder: number;
  createdAt: string;
}
