import { supabase, PHOTOS_BUCKET } from "./supabase";
import { NotFoundError } from "./errors";
import type { DataRepository } from "./repository";
import type {
  EventPost,
  Photo,
  SurveyResponse,
  ParticipantNote,
  Application,
  ApplicationStatus,
  SiteText,
} from "./types";

function mapEvent(row: {
  id: string;
  title: string;
  content: string;
  event_date: string | null;
  cover_photo_url: string | null;
  venue_info: string | null;
  capacity: number | null;
  closed: boolean;
  created_at: string;
}): EventPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    eventDate: row.event_date ?? undefined,
    coverPhotoUrl: row.cover_photo_url ?? undefined,
    venueInfo: row.venue_info ?? undefined,
    capacity: row.capacity ?? undefined,
    closed: row.closed,
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
  event_id: string | null;
  submitted_at: string;
}): SurveyResponse {
  return {
    id: row.id,
    participantName: row.participant_name,
    contact: row.contact ?? undefined,
    answers: row.answers,
    eventId: row.event_id ?? undefined,
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
  status: ApplicationStatus;
  submitted_at: string;
}): Application {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact ?? undefined,
    message: row.message ?? undefined,
    eventId: row.event_id ?? undefined,
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

// 홈 화면 이벤트 카드는 "다가오는 순"으로 보여준다: 오늘 이후 예정 이벤트를 날짜 오름차순으로
// 먼저 보여주고, 날짜 미지정 이벤트, 그다음 지난 이벤트(최근순)를 아래에 붙인다.
function sortEventsUpcomingFirst(events: EventPost[]): EventPost[] {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.eventDate && e.eventDate >= today)
    .sort((a, b) => a.eventDate!.localeCompare(b.eventDate!));
  const undated = events
    .filter((e) => !e.eventDate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const past = events
    .filter((e) => e.eventDate && e.eventDate < today)
    .sort((a, b) => b.eventDate!.localeCompare(a.eventDate!));
  return [...upcoming, ...undated, ...past];
}

export class SupabaseRepository implements DataRepository {
  async listEvents(): Promise<EventPost[]> {
    const { data, error } = await supabase.from("events").select("*");
    if (error) throw new Error(error.message);
    return sortEventsUpcomingFirst((data ?? []).map(mapEvent));
  }

  async getEvent(id: string): Promise<EventPost | null> {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    if (error) {
      // 잘못된 UUID 형식 조회는 Postgres가 22P02(invalid_text_representation)를 내는데,
      // "그런 이벤트 없음"과 의미상 같으므로 에러 대신 null로 취급한다(오래된/조작된 QR 링크 대비).
      if (error.code === "22P02") return null;
      throw new Error(error.message);
    }
    return data ? mapEvent(data) : null;
  }

  async createEvent(input: {
    title: string;
    content: string;
    eventDate?: string;
    coverPhotoUrl?: string;
    venueInfo?: string;
    capacity?: number;
    closed?: boolean;
  }): Promise<EventPost> {
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: input.title,
        content: input.content,
        event_date: input.eventDate ?? null,
        cover_photo_url: input.coverPhotoUrl ?? null,
        venue_info: input.venueInfo ?? null,
        capacity: input.capacity ?? null,
        closed: input.closed ?? false,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapEvent(data);
  }

  async updateEvent(
    id: string,
    input: Partial<{
      title: string;
      content: string;
      eventDate: string | null;
      coverPhotoUrl: string | null;
      venueInfo: string | null;
      capacity: number | null;
      closed: boolean;
    }>
  ): Promise<EventPost> {
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.content !== undefined) patch.content = input.content;
    if (input.eventDate !== undefined) patch.event_date = input.eventDate;
    if (input.coverPhotoUrl !== undefined) patch.cover_photo_url = input.coverPhotoUrl;
    if (input.venueInfo !== undefined) patch.venue_info = input.venueInfo;
    if (input.capacity !== undefined) patch.capacity = input.capacity;
    if (input.closed !== undefined) patch.closed = input.closed;

    const { data, error } = await supabase
      .from("events")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      // PGRST116: 대상 0건(이미 삭제됨), 22P02: id 형식 자체가 잘못됨 — 둘 다 "그런 이벤트 없음".
      if (error.code === "PGRST116" || error.code === "22P02") {
        throw new NotFoundError("수정하려는 이벤트를 찾을 수 없습니다.");
      }
      throw new Error(error.message);
    }
    return mapEvent(data);
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from("events").delete().eq("id", id);
    // 이미 없는 id(0건 삭제)는 성공으로 취급하는 게 자연스럽지만, 형식 자체가 잘못된 id는
    // 매치되는 행이 있을 수 없으므로 마찬가지로 조용히 성공 처리한다.
    if (error && error.code !== "22P02") throw new Error(error.message);
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

  async deletePhoto(id: string): Promise<void> {
    // 형식 자체가 잘못된 id는 매치될 수 없으니 조용히 성공 처리(삭제와 동일한 idempotent 취급).
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("url")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      if (fetchError.code === "22P02") return;
      throw new Error(fetchError.message);
    }

    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error && error.code !== "22P02") throw new Error(error.message);

    // 우리 Storage에 업로드된 사진이면 파일도 같이 지운다. 외부 URL(시드 데이터 등)은 그냥 둔다.
    const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`;
    const idx = photo?.url ? photo.url.indexOf(marker) : -1;
    if (idx >= 0) {
      const path = photo!.url.slice(idx + marker.length);
      await supabase.storage.from(PHOTOS_BUCKET).remove([path]).catch(() => undefined);
    }
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
    eventId?: string;
  }): Promise<SurveyResponse> {
    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        participant_name: input.participantName,
        contact: input.contact ?? null,
        answers: input.answers,
        event_id: input.eventId ?? null,
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

  async countActiveApplications(eventId: string): Promise<number> {
    const { count, error } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .neq("status", "cancelled");
    if (error) throw new Error(error.message);
    return count ?? 0;
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

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      if (error.code === "PGRST116" || error.code === "22P02") {
        throw new NotFoundError("수정하려는 신청을 찾을 수 없습니다.");
      }
      throw new Error(error.message);
    }
    return mapApplication(data);
  }

  async getSiteText(key: string): Promise<SiteText | null> {
    const { data, error } = await supabase
      .from("site_texts")
      .select("*")
      .eq("key", key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return { key: data.key, valueJp: data.value_jp, valueKr: data.value_kr };
  }

  async upsertSiteText(key: string, input: { valueJp: string; valueKr: string }): Promise<SiteText> {
    const { data, error } = await supabase
      .from("site_texts")
      .upsert(
        { key, value_jp: input.valueJp, value_kr: input.valueKr, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { key: data.key, valueJp: data.value_jp, valueKr: data.value_kr };
  }
}
