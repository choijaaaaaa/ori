export interface Announcement {
  id: string;
  title: string;
  content: string;
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
