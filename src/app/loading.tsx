// 홈 화면 데이터 로딩 중 스켈레톤 UI
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-16 sm:px-10">
        <section className="flex flex-col items-center gap-4">
          <div className="h-9 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-5 w-72 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-11 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </section>

        <section className="flex flex-col gap-4">
          <div className="h-6 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="h-6 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-square w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
