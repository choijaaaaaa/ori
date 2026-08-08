import { supabase } from "./supabase";
import type { DataRepository } from "./repository";
import type {
  EventPost,
  Photo,
  SurveyResponse,
  ParticipantNote,
  Application,
} from "./types";

function mapEvent(row: {
  id: string;
  title: string;
  content: string;
  event_date: string | null;
  cover_photo_url: string | null;
  venue_info: string | null;
  created_at: string;
}): EventPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    eventDate: row.event_date ?? undefined,
    coverPhotoUrl: row.cover_photo_url ?? undefined,
    venueInfo: row.venue_info ?? undefined,
    createdAt: row.created_at,
  };
}

function mapPhoto(row: { id: string; url: string; caption: string | null; created_at: string }): Photo {
  return { id: row.id, url: row.url, caption: row.caption ?? undefined, createdAt: row.created_at };
}

function mapSurveyResponse(row: {
  id: string;
  participant_name: string;
  contact: string | null;
  answers: Record<string, string>;
  submitted_at: string;
}): SurveyResponse {
  return {
    id: row.id,
    participantName: row.participant_name,
    contact: row.contact ?? undefined,
    answers: row.answers,
    submittedAt: row.submitted_at,
  };
}

function mapNote(row: {
  id: string;
  participant_name: string;
  note: string;
  tags: string[];
  created_at: string;
}): ParticipantNote {
  return {
    id: row.id,
    participantName: row.participant_name,
    note: row.note,
    tags: row.tags,
    createdAt: row.created_at,
  };
}

function mapApplication(row: {
  id: string;
  name: string;
  contact: string | null;
  message: string | null;
  event_id: string | null;
  submitted_at: string;
}): Application {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact ?? undefined,
    message: row.message ?? undefined,
    eventId: row.event_id ?? undefined,
    submittedAt: row.submitted_at,
  };
}

export class SupabaseRepository implements DataRepository {
  async listEvents(): Promise<EventPost[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEvent);
  }

  async getEvent(id: string): Promise<EventPost | null> {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapEvent(data) : null;
  }

  async createEvent(input: {
    title: string;
    content: string;
    eventDate?: string;
    coverPhotoUrl?: string;
    venueInfo?: string;
  }): Promise<EventPost> {
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: input.title,
        content: input.content,
        event_date: input.eventDate ?? null,
        cover_photo_url: input.coverPhotoUrl ?? null,
        venue_info: input.venueInfo ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapEvent(data);
  }

  async listPhotos(): Promise<Photo[]> {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPhoto);
  }

  async addPhoto(input: { url: string; caption?: string }): Promise<Photo> {
    const { data, error } = await supabase
      .from("photos")
      .insert({ url: input.url, caption: input.caption ?? null })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPhoto(data);
  }

  async listSurveyResponses(): Promise<SurveyResponse[]> {
    const { data, error } = await supabase
      .from("survey_responses")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSurveyResponse);
  }

  async createSurveyResponse(input: {
    participantName: string;
    contact?: string;
    answers: Record<string, string>;
  }): Promise<SurveyResponse> {
    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        participant_name: input.participantName,
        contact: input.contact ?? null,
        answers: input.answers,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSurveyResponse(data);
  }

  async listNotesByParticipant(participantName: string): Promise<ParticipantNote[]> {
    const { data, error } = await supabase
      .from("participant_notes")
      .select("*")
      .eq("participant_name", participantName)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNote);
  }

  async addNote(input: {
    participantName: string;
    note: string;
    tags: string[];
  }): Promise<ParticipantNote> {
    const { data, error } = await supabase
      .from("participant_notes")
      .insert({ participant_name: input.participantName, note: input.note, tags: input.tags })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapNote(data);
  }

  async listApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapApplication);
  }

  async createApplication(input: {
    name: string;
    contact?: string;
    message?: string;
    eventId?: string;
  }): Promise<Application> {
    const { data, error } = await supabase
      .from("applications")
      .insert({
        name: input.name,
        contact: input.contact ?? null,
        message: input.message ?? null,
        event_id: input.eventId ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapApplication(data);
  }
}
