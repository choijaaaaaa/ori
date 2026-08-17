import { SupabaseRepository } from "./supabase-repository";
import type {
  EventPost,
  Photo,
  SurveyResponse,
  ParticipantNote,
  Application,
  ApplicationStatus,
} from "./types";

export interface DataRepository {
  listEvents(): Promise<EventPost[]>;
  getEvent(id: string): Promise<EventPost | null>;
  createEvent(input: {
    title: string;
    content: string;
    eventDate?: string;
    coverPhotoUrl?: string;
    venueInfo?: string;
    capacity?: number;
    closed?: boolean;
  }): Promise<EventPost>;

  listPhotos(): Promise<Photo[]>;
  addPhoto(input: { url: string; caption?: string }): Promise<Photo>;

  listSurveyResponses(): Promise<SurveyResponse[]>;
  createSurveyResponse(input: {
    participantName: string;
    contact?: string;
    answers: Record<string, string>;
    eventId?: string;
  }): Promise<SurveyResponse>;

  listNotesByParticipant(participantName: string): Promise<ParticipantNote[]>;
  addNote(input: { participantName: string; note: string; tags: string[] }): Promise<ParticipantNote>;

  listApplications(): Promise<Application[]>;
  countActiveApplications(eventId: string): Promise<number>;
  createApplication(input: {
    name: string;
    contact?: string;
    message?: string;
    eventId?: string;
  }): Promise<Application>;
  updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application>;
}

export const repository: DataRepository = new SupabaseRepository();
