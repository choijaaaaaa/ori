// 예정/진행된 교류회 회차. 날짜별로 여러 개 존재할 수 있어 카드 목록으로 보여준다.
export interface EventPost {
  id: string;
  title: string;
  content: string;
  eventDate?: string; // 모임 일자 (YYYY-MM-DD, 선택)
  coverPhotoUrl?: string; // 카드 대표 사진
  venueInfo?: string; // 해당 회차 오시는 길 (선택, 없으면 홈의 기본 안내를 따른다)
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
  submittedAt: string;
}

export interface ParticipantNote {
  id: string;
  participantName: string;
  note: string;
  tags: string[];
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  contact?: string;
  submittedAt: string;
}
