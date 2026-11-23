//import { title } from "process";
import "./App.css";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  moved: number;
  created: number;
};
function emptyTask(): Task {
  return {
    id: Date.now(),
    title: "",
    completed: false,
    category: "",
    moved: 0,
    created: 0,
  };
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("SavedTasks");
    const temp: Task = emptyTask();
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [popUpActive, setPopUpActive] = useState<boolean>(false);
  const [settingActive, setSettingActive] = useState<boolean>(false);
  const [onEditTask, setOnEditTask] = useState<Task>(() => {
    const savedOnEditTask = sessionStorage.getItem("SavedOnEditTask");
    return savedOnEditTask ? JSON.parse(savedOnEditTask) : emptyTask();
  });
  const [selectedCategory, SetSelectedCategory] = useState<string>("");
  const [viewingCompletion, SetViewingCompletion] = useState<boolean>(false);
  const darkModeContext = useTheme();
  const { darkMode, toggleDarkMode } = darkModeContext;

  const completedN = tasks.filter((task) => task.moved !== 0).length;
  useEffect(() => {
    localStorage.setItem("SavedTasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    sessionStorage.setItem("SavedOnEditTask", JSON.stringify(onEditTask));
  }, [onEditTask]);
  useEffect(() => {
    if (popUpActive) {
      const savedOnEditTask = sessionStorage.getItem("SavedOnEditTask");
      if (savedOnEditTask) setOnEditTask(JSON.parse(savedOnEditTask));
    }
  }, [popUpActive]);

  function changeCompletion(id: number, v: boolean) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: v } : task)),
    );
  }
  function changeMoved(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, moved: task.moved !== 0 ? 0 : Date.now() }
          : task,
      ),
    );
  }

  function addTask(newTask: Task | null, resetOnEdit: boolean) {
    if (newTask != null) {
      const task_t: Task = { ...newTask, created: Date.now() };
      setTasks((prevTasks) => [...prevTasks, task_t]);
      if (resetOnEdit) setOnEditTask(emptyTask());
    }
  }

  function resetAll() {
    const temp = emptyTask();
    setTasks([]);
    SetSelectedCategory("");
    setOnEditTask(temp);
    SetViewingCompletion(false);
    toggleDarkMode(false);
  }

  return (
    <main className="relative mx-auto grid min-h-screen w-full content-start gap-0 bg-(--color-primary) pb-24 text-(--color-opposite)">
      <header className="w-full sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 bg-(--color-opposite) px-4 py-3 text-(--color-primary) shadow-sm sm:px-8">
        <div className="mr-auto text-lg font-bold tracking-tight">
          오늘 뭐하지
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-current/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-current/10"
            onClick={() =>
              SetViewingCompletion((viewingCompletion) => !viewingCompletion)
            }
          >
            {viewingCompletion ? "할일 목록" : "보관함"}
          </button>
          <button
            className="rounded-lg border border-current/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-current/10"
            type="button"
            onClick={() => setSettingActive(true)}
          >
            설정
          </button>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[800px] gap-7 px-4 py-8 sm:px-8 sm:py-12">
        <div className="grid gap-2">
          <div className="text-2xl font-bold tracking-tight sm:text-3xl">
            천 개의 할 일{viewingCompletion ? " (보관함)" : ""}
          </div>
          <div className="text-sm text-gray-500 sm:text-base">
            {viewingCompletion
              ? `완료 후 보관한 할 일 ${completedN}개`
              : "오늘 해야 할 일을 기록하고 관리해보세요."}
          </div>
        </div>
        <div className="min-w-0">
          <div id="categorySelection" className="mb-4 flex flex-wrap gap-2">
            {["공부", "운동", "집안일"].map((c) => {
              return (
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === c ? (darkMode ? "border-white bg-white text-gray-950" : "border-gray-900 bg-gray-900 text-white") : darkMode ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
                  key={c}
                  onClick={() => {
                    if (c === selectedCategory) SetSelectedCategory("");
                    else SetSelectedCategory(c);
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div>
            {viewingCompletion ? (
              <div
                className={`grid grid-cols-[2rem_minmax(0,1fr)_minmax(4.5rem,0.8fr)_minmax(5rem,0.9fr)_minmax(5rem,0.9fr)] items-center gap-1 border-b px-2 py-3 text-xs font-semibold max-[560px]:grid-cols-[1.5rem_minmax(0,1fr)_3.4rem_4.2rem_4.2rem] max-[560px]:gap-0.5 ${darkMode ? "border-white/15 text-gray-400" : "border-gray-200 text-gray-500"}`}
              >
                <span aria-hidden="true" />
                <span>제목</span>
                <span>카테고리</span>
                <span>생성일</span>
                <span>완료일</span>
              </div>
            ) : (
              ""
            )}
          </div>
          <div
            id="taskHolder"
            className={`overflow-hidden rounded-2xl border ${darkMode ? "border-white/15 bg-gray-900/30" : "border-gray-200 bg-white"}`}
          >
            {tasks.map((task) => {
              if (
                (task.moved !== 0) === viewingCompletion &&
                (selectedCategory === "" || selectedCategory === task.category)
              )
                return TaskRow(
                  task.title,
                  task.completed,
                  task.category,
                  task.moved !== 0,
                  task.created,
                  task.moved,
                  (v) => changeCompletion(task.id, v),
                  () => changeMoved(task.id),
                  darkMode,
                );
              else return null;
            })}
          </div>
        </div>
      </div>
      <div
        id="popUp"
        className={`fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm ${popUpActive ? "" : "hidden"}`}
      >
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl border border-gray-200 bg-(--color-primary) p-6 text-(--color-opposite) shadow-2xl">
          <div className="text-xl font-bold tracking-tight">새 할 일 추가</div>
          <div className="grid gap-2 text-sm font-semibold">
            <label htmlFor="taskTitle">할 일 제목</label>
            <input
              id="taskTitle"
              type="text"
              placeholder="예: 수학 공부하기"
              className="w-full rounded-xl border border-gray-300 bg-(--color-primary) px-3 py-2.5 text-(--color-opposite) font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
              value={onEditTask?.title ?? ""}
              onChange={(e) => {
                setOnEditTask((prev) =>
                  prev
                    ? { ...prev, title: e.target.value }
                    : { ...emptyTask(), title: e.target.value },
                );
              }}
            ></input>
          </div>
          <div className="grid gap-2 text-sm font-semibold">
            <div className="text-sm font-semibold">카테고리</div>
            <div className="flex flex-wrap gap-2">
              {["공부", "운동", "집안일"].map((c) => {
                return (
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${onEditTask.category === c ? (darkMode ? "border-white bg-white text-gray-950" : "border-gray-900 bg-gray-900 text-white") : darkMode ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
                    key={c}
                    onClick={() => {
                      setOnEditTask((prev) =>
                        prev
                          ? { ...prev, category: c }
                          : { ...emptyTask(), category: c },
                      );
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            작성 중인 내용은 저장 전까지 임시 보관됩니다.
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-gray-300 bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-(--color-opposite) transition hover:bg-gray-100"
              onClick={() => setPopUpActive(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              onClick={() => addTask(onEditTask, true)}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
      <div
        id="setting"
        className={`fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm ${settingActive ? "" : "hidden"}`}
      >
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl border border-gray-200 bg-(--color-primary) p-6 text-(--color-opposite) shadow-2xl">
          <div className="text-xl font-bold tracking-tight">설정</div>
          <div className="border-b border-gray-200 py-3">
            <label className="flex-row flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={(e) => {
                  toggleDarkMode(e.target.checked);
                }}
                checked={darkMode}
              />
              <span className="w-3/4">
                <div className="text-lg font-medium">다크 모드</div>
                <div className="ml-3 text-sm font-normal text-gray-500">
                  켜두면 다음 접속 때도 그대로 유지됩니다.
                </div>
              </span>
              <div
                className="
                  relative w-9 h-5 ml-auto
                  bg-gray-300 rounded-full
                  peer-checked:bg-blue-600
                  after:content-['']
                  after:absolute
                  after:top-[2px]
                  after:left-[2px]
                  after:bg-white
                  after:rounded-full
                  after:h-4 after:w-4
                  after:transition-all
                  peer-checked:after:translate-x-full
                "
              ></div>
            </label>
          </div>
          <div className="border-b border-gray-200 py-3">
            <label className="flex-row flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <span className="w-3/4">
                <div className="text-lg font-medium">저장된 데이터 초기화</div>
                <div className="ml-3 text-sm font-normal text-gray-500">
                  기기에 저장된 모든 할 일과 설정 기록을 초기화합니다.
                </div>
              </span>
              <button
                type="button"
                className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                onClick={() => resetAll()}
              >
                초기화
              </button>
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-gray-300 bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-(--color-opposite) transition hover:bg-gray-100"
              onClick={() => setSettingActive(false)}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        id="newTaskButton"
        className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-(--color-opposite) text-2xl text-(--color-primary) shadow-xl transition hover:scale-105 hover:opacity-90 active:scale-95"
        onClick={() => setPopUpActive(true)}
      >
        +
      </button>
    </main>
  );
}

function TaskRow(
  title: string,
  isComplete: boolean,
  category: string,
  isMoved: boolean,
  created: number,
  moved: number,
  setActive: (v: boolean) => void,
  setMoved: () => void,
  darkMode: boolean,
) {
  const createdDate = new Date(created);
  const movedDate = new Date(moved);
  return (
    <div
      className={`grid ${isMoved ? "grid-cols-[2rem_minmax(0,1fr)_minmax(4.5rem,0.8fr)_minmax(5rem,0.9fr)_minmax(5rem,0.9fr)] max-[560px]:grid-cols-[1.5rem_minmax(0,1fr)_3.4rem_4.2rem_4.2rem]" : "grid-cols-[2rem_minmax(0,1fr)_minmax(5rem,auto)]"} items-center gap-1 border-b px-2 py-3 transition-colors max-[560px]:gap-0.5 ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}
    >
      <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer accent-blue-600"
        checked={isComplete}
        onChange={(e) => {
          setActive(e.target.checked);
          if (isMoved) {
            setMoved();
          }
        }}
      ></input>
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span
          className={`min-w-0 truncate ${isComplete ? "line-through" : ""}`}
        >
          {title}
        </span>
        <button
          type="button"
          className={`shrink-0 rounded-lg border px-2 py-1 text-xs ${isComplete && !isMoved ? "" : "hidden"} ${darkMode ? "border-white/20 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-700"}`}
          onClick={() => setMoved()}
        >
          보관하기
        </button>
      </div>
      <div
        className={`truncate text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
      >
        {category}
      </div>
      <div
        className={`whitespace-nowrap text-xs tabular-nums max-[560px]:text-[0.65rem] ${isMoved ? (darkMode ? "text-gray-400" : "text-gray-500") : "hidden"}`}
      >
        {createdDate.toLocaleDateString("ko-KR")}
      </div>
      <div
        className={`whitespace-nowrap text-xs tabular-nums max-[560px]:text-[0.65rem] ${isMoved ? (darkMode ? "text-gray-400" : "text-gray-500") : "hidden"}`}
      >
        {movedDate.toLocaleDateString("ko-KR")}
      </div>
    </div>
  );
}

export default App;
