import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ──────────────────────────────
// 데이터 타입
// ──────────────────────────────

const categories = ["공부", "운동", "집안일"] as const;

type Category = (typeof categories)[number];
type Filter = "전체" | Category;
type Page = "main" | "settings" | "archive";

type Todo = {
  id: string;
  title: string;
  category: Category;
  createdAt: string;
  completed: boolean;
  completedAt: string | null;
};

type AppData = {
  todos: Todo[];
  archive: Todo[];
  darkMode: boolean;
};

type Draft = {
  title: string;
  category: Category;
};

// 다른 앱의 데이터와 섞이지 않도록 전용 이름 사용
const DATA_KEY = "waffle-week3-data";
const DRAFT_KEY = "waffle-week3-draft";

const filters: Filter[] = ["전체", ...categories];

// 여러 버튼에서 함께 사용할 Tailwind 스타일
const normalButton =
  "cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800";

const primaryButton =
  "cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300";

const fieldStyle =
  "mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

// ──────────────────────────────
// 초기값과 저장된 데이터 불러오기
// ──────────────────────────────

function emptyData(): AppData {
  return {
    todos: [],
    archive: [],
    darkMode: false,
  };
}

function emptyDraft(): Draft {
  return {
    title: "",
    category: "공부",
  };
}

function loadData(): AppData {
  try {
    const saved = localStorage.getItem(DATA_KEY);

    if (!saved) {
      return emptyData();
    }

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      !Array.isArray(parsed.todos) ||
      !Array.isArray(parsed.archive)
    ) {
      return emptyData();
    }

    return {
      todos: parsed.todos,
      archive: parsed.archive,
      darkMode: parsed.darkMode === true,
    };
  } catch {
    return emptyData();
  }
}

function loadDraft(): Draft {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);

    if (!saved) {
      return emptyDraft();
    }

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      !categories.includes(parsed.category)
    ) {
      return emptyDraft();
    }

    return {
      title: parsed.title,
      category: parsed.category,
    };
  } catch {
    return emptyDraft();
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("ko-KR");
}

// ──────────────────────────────
// Context: 여러 컴포넌트가 공유하는 상태
// ──────────────────────────────

type AppContextValue = {
  data: AppData;
  setData: Dispatch<SetStateAction<AppData>>;
};

const AppContext = createContext<AppContextValue | null>(null);

function useAppData() {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error("AppContext 안에서 사용해야 합니다.");
  }

  return context;
}

// 다크모드 버튼도 Context로 같은 상태를 사용
function ThemeToggle() {
  const { data, setData } = useAppData();

  function toggleTheme() {
    setData((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={data.darkMode}
      onClick={toggleTheme}
      className={`${normalButton} flex w-full items-center justify-between gap-4`}
    >
      <span>다크 모드</span>
      <span className="font-bold">{data.darkMode ? "켜짐" : "꺼짐"}</span>
    </button>
  );
}

// ──────────────────────────────
// 앱 화면
// ──────────────────────────────

function TodoApp() {
  const { data, setData } = useAppData();

  const [page, setPage] = useState<Page>("main");
  const [filter, setFilter] = useState<Filter>("전체");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(loadDraft);

  const dialogRef = useRef<HTMLDialogElement>(null);

  // 작성 중인 내용은 sessionStorage에 임시 저장
  useEffect(() => {
    try {
      if (draft.title === "" && draft.category === "공부") {
        sessionStorage.removeItem(DRAFT_KEY);
      } else {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    } catch (error) {
      console.error("작성 중인 내용을 저장하지 못했습니다.", error);
    }
  }, [draft]);

  // 네이티브 dialog 열기/닫기
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isModalOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isModalOpen && dialog.open) {
      dialog.close();
    }
  }, [isModalOpen]);

  const filteredTodos = data.todos.filter((todo) => {
    return filter === "전체" || todo.category === filter;
  });

  // 할 일 추가
  function addTodo() {
    const title = draft.title.trim();

    if (title === "") {
      return;
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      category: draft.category,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
    };

    setData((prev) => ({
      ...prev,
      todos: [...prev.todos, newTodo],
    }));

    setDraft(emptyDraft());
    setIsModalOpen(false);

    // 새 항목이 다른 필터에 가려지지 않도록 전체로 이동
    setFilter("전체");
  }

  // 취소: 작성 중이던 내용을 지우고 닫기
  function cancelAdd() {
    setDraft(emptyDraft());
    setIsModalOpen(false);
  }

  // 체크 / 체크 해제
  function toggleTodo(id: string) {
    const now = new Date().toISOString();

    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: todo.completed ? null : now,
            }
          : todo,
      ),
    }));
  }

  // 완료된 할 일을 보관함으로 옮기기
  function archiveTodo(id: string) {
    const now = new Date().toISOString();

    setData((prev) => {
      const todo = prev.todos.find((item) => item.id === id);

      if (!todo || !todo.completed) {
        return prev;
      }

      return {
        ...prev,
        todos: prev.todos.filter((item) => item.id !== id),
        archive: [
          {
            ...todo,
            completedAt: todo.completedAt ?? now,
          },
          ...prev.archive,
        ],
      };
    });
  }

  // 앱 데이터 전체 초기화
  function resetAll() {
    const confirmed = window.confirm(
      "할 일, 보관함, 작성 중인 내용, 다크모드 설정을 모두 초기화할까요?",
    );

    if (!confirmed) {
      return;
    }

    setData(emptyData());
    setDraft(emptyDraft());
    setFilter("전체");
    setIsModalOpen(false);
    setPage("main");
  }

  return (
    <div className="min-h-screen min-w-[320px] bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* 상단 메뉴 */}
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => setPage("main")}
            className="cursor-pointer font-bold"
          >
            오늘 뭐하지
          </button>

          <button
            type="button"
            onClick={() => setPage(page === "settings" ? "main" : "settings")}
            className="cursor-pointer rounded-md border border-gray-600 px-3 py-1 text-sm hover:bg-gray-800"
          >
            {page === "settings" ? "메인으로" : "설정"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* 메인 화면 */}
        {page === "main" && (
          <section>
            <h1 className="text-2xl font-bold">천 개의 할 일</h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              오늘 해야 할 일을 기록하고 관리해보세요.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                  className={filter === item ? primaryButton : normalButton}
                >
                  {item}
                </button>
              ))}
            </div>

            <ul className="mt-6 space-y-3 pb-20">
              {filteredTodos.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  아직 할 일이 없어요.
                  <br />
                  우측 하단 + 버튼으로 추가해보세요.
                </li>
              ) : (
                filteredTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-4 w-4 shrink-0 accent-gray-900 dark:accent-gray-200"
                      />

                      <span className="min-w-0">
                        <span
                          className={
                            todo.completed
                              ? "block break-words text-gray-400 line-through"
                              : "block break-words"
                          }
                        >
                          {todo.title}
                        </span>

                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          생성일: {formatDate(todo.createdAt)}
                        </span>
                      </span>
                    </label>

                    {todo.completed && (
                      <button
                        type="button"
                        onClick={() => archiveTodo(todo.id)}
                        className={normalButton}
                      >
                        보관하기
                      </button>
                    )}

                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {todo.category}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        )}

        {/* 설정 화면 */}
        {page === "settings" && (
          <section className="mx-auto max-w-xl">
            <h1 className="text-2xl font-bold">설정</h1>

            <div className="mt-6 space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="mb-3 font-bold">화면 설정</h2>
                <ThemeToggle />
              </div>

              <div>
                <h2 className="mb-3 font-bold">보관함</h2>

                <button
                  type="button"
                  onClick={() => setPage("archive")}
                  className={normalButton}
                >
                  보관함 열기 ({data.archive.length})
                </button>
              </div>

              <div>
                <h2 className="mb-2 font-bold">데이터 초기화</h2>

                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  할 일, 보관함, 작성 중인 내용과 다크모드 설정을 모두
                  삭제합니다.
                </p>

                <button
                  type="button"
                  onClick={resetAll}
                  className="cursor-pointer rounded-md border border-red-400 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  초기화
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 보관함 화면 */}
        {page === "archive" && (
          <section>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">완료한 할 일 보관함</h1>

              <button
                type="button"
                onClick={() => setPage("settings")}
                className={normalButton}
              >
                설정으로
              </button>
            </div>

            <ul className="mt-6 space-y-3">
              {data.archive.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  보관된 할 일이 없어요.
                </li>
              ) : (
                data.archive.map((todo) => (
                  <li
                    key={todo.id}
                    className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="min-w-0 break-words font-bold">
                        {todo.title}
                      </h2>

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {todo.category}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <p>생성일: {formatDate(todo.createdAt)}</p>
                      <p>완료일: {formatDate(todo.completedAt)}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        )}
      </main>

      {/* 메인 화면에서만 추가 버튼 표시 */}
      {page === "main" && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="할 일 추가"
          className="fixed right-6 bottom-6 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-black text-3xl text-white shadow-lg hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          +
        </button>
      )}

      {/* 할 일 추가 모달 */}
      <dialog
        ref={dialogRef}
        aria-labelledby="add-todo-title"
        onCancel={(event) => {
          // Esc로 닫아도 작성 내용은 유지
          event.preventDefault();
          setIsModalOpen(false);
        }}
        className="m-auto max-h-[90vh] w-11/12 max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="add-todo-title" className="text-xl font-bold">
            할 일 추가
          </h2>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            aria-label="작성 내용 유지하고 닫기"
            className="cursor-pointer rounded px-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            addTodo();
          }}
        >
          <label htmlFor="todo-title" className="mt-6 block text-sm font-bold">
            제목
          </label>

          <input
            id="todo-title"
            type="text"
            autoFocus
            required
            placeholder="해야 할 일을 입력하세요"
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                title: event.target.value,
              }))
            }
            className={fieldStyle}
          />

          <label
            htmlFor="todo-category"
            className="mt-5 block text-sm font-bold"
          >
            카테고리
          </label>

          <select
            id="todo-category"
            value={draft.category}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                category: event.target.value as Category,
              }))
            }
            className={fieldStyle}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="mt-8 flex justify-end gap-2">
            <button type="button" onClick={cancelAdd} className={normalButton}>
              취소
            </button>

            <button
              type="submit"
              disabled={draft.title.trim() === ""}
              className={primaryButton}
            >
              저장하기
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

// ──────────────────────────────
// 상태 공유와 영구 저장
// ──────────────────────────────

function App() {
  const [data, setData] = useState<AppData>(loadData);

  // 목록, 보관함, 다크모드를 하나의 데이터로 저장
  useEffect(() => {
    try {
      const isEmpty =
        data.todos.length === 0 &&
        data.archive.length === 0 &&
        data.darkMode === false;

      if (isEmpty) {
        // 초기화 후 빈 데이터가 다시 저장되지 않도록 삭제
        localStorage.removeItem(DATA_KEY);
      } else {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error("앱 데이터를 저장하지 못했습니다.", error);
    }
  }, [data]);

  // html에 dark 클래스를 적용해서 앱 전체 테마 변경
  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.darkMode);
  }, [data.darkMode]);

  return (
    <AppContext.Provider value={{ data, setData }}>
      <TodoApp />
    </AppContext.Provider>
  );
}

export default App;
