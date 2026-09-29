import "./App.css";
import { useState } from "react";
import { useTodos } from "./context/TodoContext";
import { categories, type Todo, type TodoCategory } from "./types/todo";

type Page = "main" | "settings" | "archive";
type CategoryFilter = "all" | TodoCategory;
type ArchiveSort = "newest" | "oldest";

const categoryLabel: Record<TodoCategory, string> = {
  study: "공부",
  exercise: "운동",
  home: "집안일",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(new Date(date));

function App() {
  const {
    todos,
    archivedTodos,
    draft,
    isDarkMode,
    addTodo,
    archiveTodo,
    clearDraft,
    resetAll,
    setDraft,
    toggleTheme,
    toggleTodo,
    updateTodo,
  } = useTodos();

  const [page, setPage] = useState<Page>("main");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [archiveDate, setArchiveDate] = useState("");
  const [archiveSort, setArchiveSort] = useState<ArchiveSort>("newest");

  const visibleTodos =
    selectedCategory === "all"
      ? todos
      : todos.filter((todo) => todo.category === selectedCategory);

  const visibleArchivedTodos = archivedTodos
    .filter(
      (todo) => !archiveDate || todo.completedAt.slice(0, 10) === archiveDate,
    )
    .slice()
    .sort((firstTodo, secondTodo) => {
      const firstDate = new Date(firstTodo.completedAt).getTime();
      const secondDate = new Date(secondTodo.completedAt).getTime();

      return archiveSort === "newest"
        ? secondDate - firstDate
        : firstDate - secondDate;
    });

  const openAddModal = () => {
    setEditingTodo(null);
    setIsTodoModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setDraft({
      title: todo.title,
      category: todo.category,
    });
    setIsTodoModalOpen(true);
  };

  const closeTodoModal = () => {
    setIsTodoModalOpen(false);
    setEditingTodo(null);
  };

  const handleSaveTodo = () => {
    if (!draft.title.trim()) return;

    if (editingTodo) {
      updateTodo(editingTodo.id, draft.title, draft.category);
    } else {
      addTodo(draft.title, draft.category);
    }

    clearDraft();
    closeTodoModal();
  };

  const handleCancelTodo = () => {
    clearDraft();
    closeTodoModal();
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "진행 중인 할 일, 보관함, 다크 모드 설정을 모두 초기화할까요?",
    );

    if (!confirmed) return;

    resetAll();
    setPage("main");
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 transition-colors duration-300 dark:bg-[#161616] dark:text-stone-100">
      <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-10 flex items-start justify-between gap-4">
          <button
            className="text-left"
            type="button"
            onClick={() => setPage("main")}
          >
            <p className="mb-1 text-xs font-bold tracking-[0.16em] text-violet-600">
              THOUSAND TODO
            </p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              천 개의 할 일
            </h1>
          </button>

          <button
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            type="button"
            onClick={() => setPage("settings")}
          >
            설정
          </button>
        </header>

        {page === "main" && (
          <>
            <section className="mb-7">
              <p className="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">
                오늘 해야 할 일을 정리해보세요.
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === "all"
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                      : "bg-white text-stone-500 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
                  }`}
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                >
                  전체
                </button>

                {categories.map((category) => (
                  <button
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedCategory === category
                        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                        : "bg-white text-stone-500 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {categoryLabel[category]}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              {visibleTodos.length > 0 ? (
                visibleTodos.map((todo) => (
                  <article
                    className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                    key={todo.id}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        aria-label={`${todo.title} 완료 여부`}
                        checked={todo.completed}
                        className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-violet-600"
                        type="checkbox"
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleTodo(todo.id)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            className={`break-words text-left text-base font-semibold hover:text-violet-600 dark:hover:text-violet-400 ${
                              todo.completed
                                ? "text-stone-400 line-through dark:text-stone-500"
                                : ""
                            }`}
                            type="button"
                            onClick={() => openEditModal(todo)}
                          >
                            {todo.title}
                          </button>

                          <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {categoryLabel[todo.category]}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs text-stone-400 dark:text-stone-500">
                            {formatDate(todo.createdAt)} 생성
                          </p>

                          {todo.completed && (
                            <button
                              className="text-xs font-bold text-violet-600 hover:text-violet-800 dark:text-violet-400"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                archiveTodo(todo.id);
                              }}
                            >
                              보관하기
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-700">
                  <p className="text-lg font-semibold">표시할 할 일이 없어요</p>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    오른쪽 아래 버튼을 눌러 첫 할 일을 추가해보세요.
                  </p>
                </div>
              )}
            </section>

            <button
              aria-label="할 일 추가"
              className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-violet-600 text-3xl font-light text-white shadow-lg shadow-violet-600/30 transition hover:scale-105 hover:bg-violet-700 sm:bottom-10 sm:right-10"
              type="button"
              onClick={openAddModal}
            >
              +
            </button>
          </>
        )}

        {page === "settings" && (
          <section>
            <button
              className="mb-5 text-sm font-bold text-stone-500 hover:text-violet-600 dark:text-stone-400"
              type="button"
              onClick={() => setPage("main")}
            >
              ← 메인으로
            </button>

            <h2 className="mb-6 text-3xl font-semibold tracking-tight">설정</h2>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between gap-4 border-b border-stone-100 p-5 dark:border-stone-800">
                <div>
                  <p className="font-bold">다크 모드</p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    앱 전체의 색상을 어둡게 바꿔요.
                  </p>
                </div>

                <button
                  aria-label="다크 모드 전환"
                  className={`relative h-7 w-12 rounded-full transition ${
                    isDarkMode
                      ? "bg-violet-600"
                      : "bg-stone-300 dark:bg-stone-700"
                  }`}
                  type="button"
                  onClick={toggleTheme}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      isDarkMode ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                className="flex w-full items-center justify-between gap-4 border-b border-stone-100 p-5 text-left transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
                type="button"
                onClick={() => setPage("archive")}
              >
                <div>
                  <p className="font-bold">보관함</p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    완료한 할 일을 다시 확인해요.
                  </p>
                </div>
                <span className="text-stone-400">→</span>
              </button>

              <button
                className="w-full p-5 text-left font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                type="button"
                onClick={handleReset}
              >
                모든 데이터 초기화
              </button>
            </div>
          </section>
        )}

        {page === "archive" && (
          <section>
            <button
              className="mb-5 text-sm font-bold text-stone-500 hover:text-violet-600 dark:text-stone-400"
              type="button"
              onClick={() => setPage("settings")}
            >
              ← 설정으로
            </button>

            <h2 className="mb-2 text-3xl font-semibold tracking-tight">
              보관함
            </h2>
            <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
              완료한 할 일을 모아두는 공간이에요.
            </p>

            <div className="mb-6 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-2 dark:border-stone-800 dark:bg-stone-900">
              <label>
                <span className="mb-2 block text-xs font-bold text-stone-500 dark:text-stone-400">
                  완료일 검색
                </span>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-stone-700 dark:bg-stone-800"
                  type="date"
                  value={archiveDate}
                  onChange={(event) => setArchiveDate(event.target.value)}
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-stone-500 dark:text-stone-400">
                  완료일 정렬
                </span>
                <select
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-stone-700 dark:bg-stone-800"
                  value={archiveSort}
                  onChange={(event) =>
                    setArchiveSort(event.target.value as ArchiveSort)
                  }
                >
                  <option value="newest">최신 완료순</option>
                  <option value="oldest">오래된 완료순</option>
                </select>
              </label>
            </div>

            {archiveDate && (
              <button
                className="mb-4 text-sm font-bold text-violet-600 hover:text-violet-800 dark:text-violet-400"
                type="button"
                onClick={() => setArchiveDate("")}
              >
                날짜 검색 초기화
              </button>
            )}

            <div className="space-y-3">
              {visibleArchivedTodos.length > 0 ? (
                visibleArchivedTodos.map((todo) => (
                  <article
                    className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                    key={todo.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{todo.title}</p>
                        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                          {formatDate(todo.createdAt)} 생성 ·{" "}
                          {formatDate(todo.completedAt)} 완료
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        {categoryLabel[todo.category]}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-700">
                  <p className="text-lg font-semibold">
                    조건에 맞는 보관함 항목이 없어요
                  </p>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    다른 날짜를 선택하거나, 완료한 할 일을 보관해보세요.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {isTodoModalOpen && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-stone-950/40 p-5 backdrop-blur-sm">
          <form
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900"
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveTodo();
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-violet-600">
                  {editingTodo ? "EDIT TODO" : "NEW TODO"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {editingTodo ? "할 일 수정" : "할 일 추가"}
                </h2>
              </div>

              <button
                aria-label="모달 닫기"
                className="grid h-9 w-9 place-items-center rounded-full text-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                type="button"
                onClick={closeTodoModal}
              >
                ×
              </button>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-bold">할 일 제목</span>
              <input
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition placeholder:text-stone-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-stone-700 dark:bg-stone-800 dark:focus:ring-violet-950"
                placeholder="예: 리액트 복습하기"
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
              />
            </label>

            <label className="mb-7 block">
              <span className="mb-2 block text-sm font-bold">카테고리</span>
              <select
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-stone-700 dark:bg-stone-800 dark:focus:ring-violet-950"
                value={draft.category}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    category: event.target.value as TodoCategory,
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel[category]}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-3">
              <button
                className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                type="button"
                onClick={handleCancelTodo}
              >
                취소
              </button>
              <button
                className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                type="submit"
              >
                {editingTodo ? "수정하기" : "저장하기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
