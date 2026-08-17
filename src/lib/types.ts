// 예정/진행된 교류회 회차. 날짜별로 여러 개 존재할 수 있어 카드 목록으로 보여준다.
export interface EventPost {
  id: string;
  title: string;
  content: string;
  eventDate?: string; // 모임 일자 (YYYY-MM-DD, 선택)
  coverPhotoUrl?: string; // 카드 대표 사진
  venueInfo?: string; // 해당 회차 오시는 길 (선택, 없으면 홈의 기본 안내를 따른다)
  capacity?: number; // 정원 (선택, 없으면 무제한)
  closed: boolean; // 관리자가 수동으로 마감했는지
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
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
  submittedAt: string;
}

// 관리자가 코드 수정 없이 직접 고칠 수 있는 사이트 문구(일본어 메인 + 한국어 보조).
export interface SiteText {
  key: string;
  valueJp: string;
  valueKr: string;
}
