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
    return savedTasks ? JSON.parse(savedTasks) : [temp];
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
    <main className="bg-(--color-primary) text-(--color-opposite)">
      <header className="bg-(--color-opposite) text-(--color-primary) px-5 py-2 flex place-content-between">
        <div className="mr-auto">오늘 뭐하지</div>
        <button
          type="button"
          onClick={() =>
            SetViewingCompletion((viewingCompletion) => !viewingCompletion)
          }
        >
          {viewingCompletion ? "할일 목록" : "보관함"}
        </button>
        <button type="button" onClick={() => setSettingActive(true)}>
          설정
        </button>
      </header>
      <div className="px-5">
        <div>
          <div>천 개의 할 일{viewingCompletion ? " (보관함)" : ""}</div>
          <div>
            {viewingCompletion
              ? `완료 후 보관한 할 일${completedN} 개`
              : "오늘 해야 할 일을 기록하고 관리해보세요."}
          </div>
          <div>
            {viewingCompletion ? (
              <div className="flex flex-row">
                <div>제목</div>
                <div className="ml-auto">카테고리</div>
                <div>생성일</div>
                <div>완료일</div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        <div>
          <div id="categorySelection" className="w-full flex flex-row">
            {["공부", "운동", "집안일"].map((c) => {
              return (
                <button
                  type="button"
                  className={`basis-sm border mx-3 rounded-full ${selectedCategory === c ? "bg-black text-white " : "bg-white text-black "}`}
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
          <div id="taskHolder">
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
                );
              else return null;
            })}
          </div>
        </div>
      </div>
      <div
        id="popUp"
        className={`bg-(--color-opposite)/40 text-(--color-primary) fixed w-full h-full ${popUpActive ? "" : "hidden"}`}
      >
        <div className="bg-(--color-opposite) flex flex-col fixed inset-0 m-auto w-1/2 h-1/2 rounded-md p-3">
          <div>새 할일 추가</div>
          <div className="w-full">
            <div>할일 제목</div>
            <input
              type="text"
              placeholder="예: 수학 공부하기"
              className="w-full border"
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
          <div className="w-full">
            <div>카테고리</div>
            <div className="w-full flex flex-row">
              {["공부", "운동", "집안일"].map((c) => {
                return (
                  <button
                    type="button"
                    className={`basis-1/3 border mx-3 rounded-full ${onEditTask.category === c ? "bg-black text-white" : "bg-white text-black"}`}
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
          <div className="w-full">
            참고) 작성 중인 내용은 저장 전까지 임시 보관됩니다.
          </div>
          <div className="mt-auto w-full flex flex-row">
            <button
              type="button"
              className="basis-1/2 border bg-white text-black mx-2"
              onClick={() => setPopUpActive(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="basis-1/2 border bg-black text-white mx-2"
              onClick={() => addTask(onEditTask, true)}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
      <div
        id="setting"
        className={`bg-(--color-opposite)/40 text-(--color-primary) fixed w-full h-full ${settingActive ? "" : "hidden"}`}
      >
        <div className="bg-(--color-opposite) flex flex-col fixed inset-0 m-auto w-1/2 h-1/2 rounded-md p-3">
          <div>설정</div>
          <div className="w-full">
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
                <div className="ml-3 text-sm font-medium">
                  켜두면 다음 접속 떄도 그대로 유지됩니다.
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
          <div className="w-full">
            <label className="flex-row flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <span className="w-3/4">
                <div className="text-lg font-medium">저장된 데이터 초기화</div>
                <div className="ml-3 text-sm font-medium">
                  기기에 저장된 모든 할일, 설정 기록을 초기화합니다.
                </div>
              </span>
              <button
                type="button"
                className="ml-auto px-1 border rounded-md bg-red-200 text-red-600"
                onClick={() => resetAll()}
              >
                초기화
              </button>
            </label>
          </div>
          <div className="mt-auto w-full flex flex-row">
            <button
              type="button"
              className="basis-full border bg-white text-black mx-2"
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
        className="bg-(--color-opposite) text-(--color-primary) absolute bottom-5 right-5 w-10 h-10 rounded-full"
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
) {
  const createdDate = new Date(created);
  const movedDate = new Date(moved);
  return (
    <div className="taskRow">
      <input
        type="checkbox"
        className="taskRow_checkbox"
        checked={isComplete}
        onChange={(e) => {
          setActive(e.target.checked);
          if (isMoved) {
            setMoved();
          }
        }}
      ></input>
      <div className={`taskRow_title ${isComplete ? "line-through" : ""}`}>
        {title}
      </div>
      <button
        type="button"
        className={`${isComplete && !isMoved ? "" : "hidden"}`}
        onClick={() => setMoved()}
      >
        보관하기
      </button>
      <div className="taskRow_dates flex flex-row">
        {moved === 0 ? (
          ""
        ) : (
          <>
            <div className="taskRow_created">
              {createdDate.toLocaleDateString("ko-KR")}
            </div>
            <div className="taskRow_moved">
              {movedDate.toLocaleDateString("ko-KR")}
            </div>
          </>
        )}
      </div>
      <div className="taskRow_category">{category}</div>
    </div>
  );
}

export default App;
