import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  Announcement,
  Photo,
  SurveyResponse,
  ParticipantNote,
} from "./types";

// Supabase로 교체 시 이 인터페이스를 그대로 구현한 리포지토리로 바꿔치기하면 된다.
export interface DataRepository {
  listAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(input: { title: string; content: string }): Promise<Announcement>;

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
}

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

// mock 단계 구현체. 서버리스(Vercel) 배포에서는 파일시스템이 재배포마다 초기화되므로
// 작성 데이터가 영구 저장되지 않는다 — Supabase 연동 전까지의 임시 구현.
class JsonFileRepository implements DataRepository {
  async listAnnouncements(): Promise<Announcement[]> {
    const items = await readJson<Announcement[]>("announcements.json");
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createAnnouncement(input: { title: string; content: string }): Promise<Announcement> {
    const items = await readJson<Announcement[]>("announcements.json");
    const created: Announcement = {
      id: randomUUID(),
      title: input.title,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    items.push(created);
    await writeJson("announcements.json", items);
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
}

export const repository: DataRepository = new JsonFileRepository();
