import { SupabaseRepository } from "./supabase-repository";
import type {
  EventPost,
  Photo,
  SurveyResponse,
  ParticipantNote,
  Application,
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
  }): Promise<EventPost>;

  listPhotos(): Promise<Photo[]>;
  addPhoto(input: { url: string; caption?: string }): Promise<Photo>;

  listSurveyResponses(): Promise<SurveyResponse[]>;
  createSurveyResponse(input: {
    participantName: string;
    contact?: string;
    answers: Record<string, string>;
  }): Promise<SurveyResponse>;

  listNotesByParticipant(participantName: string): Promise<ParticipantNote[]>;
  addNote(input: { participantName: string; note: string; tags: string[] }): Promise<ParticipantNote>;

  listApplications(): Promise<Application[]>;
  createApplication(input: {
    name: string;
    contact?: string;
    message?: string;
    eventId?: string;
  }): Promise<Application>;
}

export const repository: DataRepository = new SupabaseRepository();
