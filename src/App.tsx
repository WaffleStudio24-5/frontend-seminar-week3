import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";

type Todo = {
  id: number;
  title: string;
  category: "공부" | "운동" | "집안일";
  createdAt: string;
  completed: boolean;
};

type ArchivedTodo = {
  id: number;
  title: string;
  category: "공부" | "운동" | "집안일";
  createdAt: string;
  completedAt: string;
};

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleDark, resetDark } = useTheme();

  const [title, setTitle] = useState(() => {
    const savedTitle = sessionStorage.getItem("title");
    if (savedTitle) {
      return savedTitle;
    }
    return "";
  });

  const [category, setCategory] = useState<"공부" | "운동" | "집안일">(() => {
    const savedCategory = sessionStorage.getItem("category");
    if (
      savedCategory === "공부" ||
      savedCategory === "운동" ||
      savedCategory === "집안일"
    ) {
      return savedCategory;
    }
    return "공부";
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      return JSON.parse(savedTodos);
    }
    return [];
  });

  const [archive, setArchive] = useState<ArchivedTodo[]>(() => {
    const savedArchive = localStorage.getItem("archive");
    if (savedArchive) {
      return JSON.parse(savedArchive);
    }
    return [];
  });

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [filter, setFilter] = useState<"전체" | "공부" | "운동" | "집안일">(
    "전체",
  );

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("archive", JSON.stringify(archive));
  }, [archive]);

  useEffect(() => {
    sessionStorage.setItem("title", title);
  }, [title]);

  useEffect(() => {
    sessionStorage.setItem("category", category);
  }, [category]);

  const handleSave = () => {
    const newTodo: Todo = {
      id: Date.now(),
      title: title,
      category: category,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setTitle("");
    setCategory("공부");
    setIsOpen(false);
  };

  const handleToggle = (id: number) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
        };
      }

      return todo;
    });
    setTodos(newTodos);
  };

  const handleArchive = (id: number) => {
    const todoToArchive = todos.find((todo) => todo.id === id);
    if (!todoToArchive) return;
    setTodos(todos.filter((todo) => todo.id !== id));
    const archivedTodo: ArchivedTodo = {
      id: todoToArchive.id,
      title: todoToArchive.title,
      category: todoToArchive.category,
      createdAt: todoToArchive.createdAt,
      completedAt: new Date().toISOString(),
    };
    setArchive([...archive, archivedTodo]);
  };

  const handleReset = () => {
    setTodos([]);
    setArchive([]);
    resetDark();
    localStorage.removeItem("todos");
    localStorage.removeItem("archive");
    localStorage.removeItem("mode");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "전체") {
      return true;
    }

    return todo.category === filter;
  });

  return (
    <main
      className={
        isDark
          ? "min-h-screen bg-gray-950 p-8 text-white"
          : "min-h-screen bg-gray-50 p-8 text-black"
      }
    >
      <h1 className="mb-6 text-3xl font-bold">천 개의 할일</h1>
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm text-black"
          onClick={toggleDark}
        >
          {isDark ? "라이트모드" : "다크모드"}
        </button>

        <button
          type="button"
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm text-black"
          onClick={() => setIsArchiveOpen(true)}
        >
          보관함
        </button>

        <button
          type="button"
          className="rounded-xl bg-red-100 px-4 py-2 text-sm text-red-600"
          onClick={handleReset}
        >
          초기화
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          className={
            filter === "전체"
              ? isDark
                ? "rounded-full bg-white px-4 py-2 text-black"
                : "rounded-full bg-black px-4 py-2 text-white"
              : isDark
                ? "rounded-full bg-gray-800 px-4 py-2 text-gray-200"
                : "rounded-full bg-gray-100 px-4 py-2 text-black"
          }
          onClick={() => setFilter("전체")}
        >
          {" "}
          전체{" "}
        </button>
        <button
          type="button"
          className={
            filter === "공부"
              ? isDark
                ? "rounded-full bg-white px-4 py-2 text-black"
                : "rounded-full bg-black px-4 py-2 text-white"
              : isDark
                ? "rounded-full bg-gray-800 px-4 py-2 text-gray-200"
                : "rounded-full bg-gray-100 px-4 py-2 text-black"
          }
          onClick={() => setFilter("공부")}
        >
          {" "}
          공부{" "}
        </button>
        <button
          type="button"
          className={
            filter === "운동"
              ? isDark
                ? "rounded-full bg-white px-4 py-2 text-black"
                : "rounded-full bg-black px-4 py-2 text-white"
              : isDark
                ? "rounded-full bg-gray-800 px-4 py-2 text-gray-200"
                : "rounded-full bg-gray-100 px-4 py-2 text-black"
          }
          onClick={() => setFilter("운동")}
        >
          {" "}
          운동{" "}
        </button>
        <button
          type="button"
          className={
            filter === "집안일"
              ? isDark
                ? "rounded-full bg-white px-4 py-2 text-black"
                : "rounded-full bg-black px-4 py-2 text-white"
              : isDark
                ? "rounded-full bg-gray-800 px-4 py-2 text-gray-200"
                : "rounded-full bg-gray-100 px-4 py-2 text-black"
          }
          onClick={() => setFilter("집안일")}
        >
          {" "}
          집안일{" "}
        </button>
      </div>

      {isArchiveOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div
            className={
              isDark
                ? "w-full max-w-lg rounded-2xl bg-gray-800 p-6 text-white shadow-xl"
                : "w-full max-w-lg rounded-2xl bg-white p-6 text-black shadow-xl"
            }
          >
            <h2 className="mb-6 text-xl font-bold">보관함</h2>
            {archive.map((archivedTodo) => (
              <div
                key={archivedTodo.id}
                className={
                  isDark
                    ? "mb-3 rounded-xl border border-gray-600 bg-gray-700 p-4"
                    : "mb-3 rounded-xl border bg-gray-50 p-4"
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{archivedTodo.title}</span>

                  <span
                    className={
                      isDark
                        ? "rounded-full bg-gray-600 px-3 py-1 text-sm text-gray-200"
                        : "rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
                    }
                  >
                    {archivedTodo.category}
                  </span>
                </div>

                <div
                  className={
                    isDark ? "text-sm text-gray-300" : "text-sm text-gray-500"
                  }
                >
                  <p>
                    생성:{" "}
                    {new Date(archivedTodo.createdAt).toLocaleString("ko-KR")}
                  </p>
                  <p>
                    완료:{" "}
                    {new Date(archivedTodo.completedAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
              onClick={() => setIsArchiveOpen(false)}
            >
              닫기{" "}
            </button>
          </div>
        </div>
      )}
      {filteredTodos.map((todo) => (
        <div
          key={todo.id}
          className={
            isDark
              ? "mb-3 flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4"
              : "mb-3 flex items-center gap-3 rounded-xl border bg-white p-4"
          }
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id)}
          />
          <span className={todo.completed ? "flex-1 line-through" : "flex-1"}>
            {todo.title}{" "}
          </span>
          <span
            className={
              isDark
                ? "rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-200"
                : "rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
            }
          >
            {todo.category}
          </span>
          {todo.completed && (
            <button
              type="button"
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
              onClick={() => handleArchive(todo.id)}
            >
              보관하기
            </button>
          )}
        </div>
      ))}
      <div>
        <button
          type="button"
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white shadow-lg hover:bg-gray-800"
          onClick={() => setIsOpen(true)}
        >
          +{" "}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div
            className={
              isDark
                ? "w-full max-w-md rounded-2xl bg-gray-800 p-6 text-white shadow-xl"
                : "w-full max-w-md rounded-2xl bg-white p-6 text-black shadow-xl"
            }
          >
            <h2>할일 추가하기</h2>
            <input
              type="text"
              className={
                isDark
                  ? "mb-5 w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-white"
                  : "mb-5 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="radio"
                name="category"
                checked={category === "공부"}
                onChange={() => setCategory("공부")}
              />
              공부
              <input
                type="radio"
                name="category"
                checked={category === "운동"}
                onChange={() => setCategory("운동")}
              />{" "}
              운동
              <input
                type="radio"
                name="category"
                checked={category === "집안일"}
                onChange={() => setCategory("집안일")}
              />{" "}
              집안일
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setTitle("");
                  setCategory("공부");
                }}
              >
                취소{" "}
              </button>
              <button
                type="button"
                className="rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
                onClick={handleSave}
              >
                저장{" "}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
