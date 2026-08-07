import { randomUUID } from "crypto";
import { readDataFile, writeDataFile } from "./data-dir";
import type {
  EventPost,
  Photo,
  SurveyResponse,
  ParticipantNote,
  Application,
} from "./types";

// Supabase로 교체 시 이 인터페이스를 그대로 구현한 리포지토리로 바꿔치기하면 된다.
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
  createApplication(input: { name: string; contact?: string }): Promise<Application>;
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await readDataFile(file);
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await writeDataFile(file, JSON.stringify(data, null, 2));
}

// mock 단계 구현체. 서버리스(Vercel) 배포에서는 파일시스템이 재배포마다 초기화되므로
// 작성 데이터가 영구 저장되지 않는다 — Supabase 연동 전까지의 임시 구현.
class JsonFileRepository implements DataRepository {
  async listEvents(): Promise<EventPost[]> {
    const items = await readJson<EventPost[]>("events.json");
    return items.sort((a, b) =>
      (b.eventDate ?? b.createdAt).localeCompare(a.eventDate ?? a.createdAt)
    );
  }

  async getEvent(id: string): Promise<EventPost | null> {
    const items = await readJson<EventPost[]>("events.json");
    return items.find((e) => e.id === id) ?? null;
  }

  async createEvent(input: {
    title: string;
    content: string;
    eventDate?: string;
    coverPhotoUrl?: string;
    venueInfo?: string;
  }): Promise<EventPost> {
    const items = await readJson<EventPost[]>("events.json");
    const created: EventPost = {
      id: randomUUID(),
      title: input.title,
      content: input.content,
      eventDate: input.eventDate,
      coverPhotoUrl: input.coverPhotoUrl,
      venueInfo: input.venueInfo,
      createdAt: new Date().toISOString(),
    };
    items.push(created);
    await writeJson("events.json", items);
    return created;
  }

  async listPhotos(): Promise<Photo[]> {
    const items = await readJson<Photo[]>("photos.json");
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addPhoto(input: { url: string; caption?: string }): Promise<Photo> {
    const items = await readJson<Photo[]>("photos.json");
    const created: Photo = {
      id: randomUUID(),
      url: input.url,
      caption: input.caption,
      createdAt: new Date().toISOString(),
    };
    items.push(created);
    await writeJson("photos.json", items);
    return created;
  }

  async listSurveyResponses(): Promise<SurveyResponse[]> {
    const items = await readJson<SurveyResponse[]>("survey-responses.json");
    return items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async createSurveyResponse(input: {
    participantName: string;
    contact?: string;
    answers: Record<string, string>;
  }): Promise<SurveyResponse> {
    const items = await readJson<SurveyResponse[]>("survey-responses.json");
    const created: SurveyResponse = {
      id: randomUUID(),
      participantName: input.participantName,
      contact: input.contact,
      answers: input.answers,
      submittedAt: new Date().toISOString(),
    };
    items.push(created);
    await writeJson("survey-responses.json", items);
    return created;
  }

  async listNotesByParticipant(participantName: string): Promise<ParticipantNote[]> {
    const items = await readJson<ParticipantNote[]>("participant-notes.json");
    return items
      .filter((n) => n.participantName === participantName)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addNote(input: { participantName: string; note: string; tags: string[] }): Promise<ParticipantNote> {
    const items = await readJson<ParticipantNote[]>("participant-notes.json");
    const created: ParticipantNote = {
      id: randomUUID(),
      participantName: input.participantName,
      note: input.note,
      tags: input.tags,
      createdAt: new Date().toISOString(),
    };
    items.push(created);
    await writeJson("participant-notes.json", items);
    return created;
  }

  async listApplications(): Promise<Application[]> {
    const items = await readJson<Application[]>("applications.json");
    return items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async createApplication(input: { name: string; contact?: string }): Promise<Application> {
    const items = await readJson<Application[]>("applications.json");
    const created: Application = {
      id: randomUUID(),
      name: input.name,
      contact: input.contact,
      submittedAt: new Date().toISOString(),
    };
    items.push(created);
    await writeJson("applications.json", items);
    return created;
  }
}

export const repository: DataRepository = new JsonFileRepository();
