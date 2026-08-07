// 관리자 사진 갤러리 관리 화면 — 목록 조회(그리드) + 사진 추가
import { repository } from "@/lib/repository";
import type { Photo } from "@/lib/types";
import PhotoForm from "./photo-form";
import { Bilingual } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadPhotos(): Promise<{ ok: true; items: Photo[] } | { ok: false }> {
  try {
    const items = await repository.listPhotos();
    return { ok: true, items };
  } catch (error) {
    console.error("사진 목록 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminPhotosPage() {
  const data = await loadPhotos();

  return (
    <div className="flex flex-col gap-8">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="写真管理"
        kr="사진 갤러리 관리"
      />

      <PhotoForm />

      <section aria-labelledby="photo-list-heading" className="flex flex-col gap-3">
        <Bilingual
          as="h2"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          jp={<span id="photo-list-heading">登録済みの写真</span>}
          kr="등록된 사진"
        />

        {!data.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            写真の読み込み中に問題が発生しました。
            <span className="block text-xs opacity-80">사진 목록을 불러오는 중 문제가 발생했습니다.</span>
          </p>
        )}

        {data.ok && data.items.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            登録された写真はありません。
            <span className="block text-xs opacity-80">등록된 사진이 없습니다.</span>
          </p>
        )}

        {data.ok && data.items.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {data.items.map((photo) => (
              <li key={photo.id} className="flex flex-col gap-1">
                <img
                  src={photo.url}
                  alt={photo.caption ?? "日韓交流会の活動写真 / 일한교류회 활동 사진"}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                {photo.caption && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{photo.caption}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
