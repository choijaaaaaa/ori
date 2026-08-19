import { SupabaseRepository } from "./supabase-repository";
import type {
  EventPost,
  Photo,
  SurveyResponse,
  ParticipantNote,
  Application,
  ApplicationStatus,
  SiteText,
  ApplyFormField,
  ApplyFormFieldType,
  ApplyFormFieldOption,
} from "./types";

export interface DataRepository {
  listEvents(): Promise<EventPost[]>;
  getEvent(id: string): Promise<EventPost | null>;
  createEvent(input: {
    title: string;
    content: string;
    eventDate?: string;
    coverPhotoUrl?: string;
    venueMapUrl?: string;
    venueImageUrl?: string;
    venueInfo?: string;
    capacity?: number;
    closed?: boolean;
  }): Promise<EventPost>;
  updateEvent(
    id: string,
    input: Partial<{
      title: string;
      content: string;
      eventDate: string | null;
      coverPhotoUrl: string | null;
      venueMapUrl: string | null;
      venueImageUrl: string | null;
      venueInfo: string | null;
      capacity: number | null;
      closed: boolean;
    }>
  ): Promise<EventPost>;
  deleteEvent(id: string): Promise<void>;
  reorderEvents(orderedIds: string[]): Promise<void>;

  listPhotos(): Promise<Photo[]>;
  addPhoto(input: { url: string; caption?: string }): Promise<Photo>;
  updatePhoto(id: string, input: { caption: string | null }): Promise<Photo>;
  deletePhoto(id: string): Promise<void>;
  reorderPhotos(orderedIds: string[]): Promise<void>;

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
    answers?: Record<string, string>;
  }): Promise<Application>;
  updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application>;

  getSiteText(key: string): Promise<SiteText | null>;
  upsertSiteText(key: string, input: { valueJp: string; valueKr: string }): Promise<SiteText>;

  listApplyFormFields(): Promise<ApplyFormField[]>;
  createApplyFormField(input: {
    fieldKey: string;
    type: ApplyFormFieldType;
    labelJp: string;
    labelKr?: string;
    helpJp?: string;
    helpKr?: string;
    options?: ApplyFormFieldOption[];
    required?: boolean;
    requireAll?: boolean;
    imageUrl?: string;
  }): Promise<ApplyFormField>;
  updateApplyFormField(
    id: string,
    input: Partial<{
      labelJp: string;
      labelKr: string;
      helpJp: string;
      helpKr: string;
      options: ApplyFormFieldOption[];
      required: boolean;
      requireAll: boolean;
      imageUrl: string | null;
    }>
  ): Promise<ApplyFormField>;
  deleteApplyFormField(id: string): Promise<void>;
  reorderApplyFormFields(orderedIds: string[]): Promise<void>;
}

export const repository: DataRepository = new SupabaseRepository();
