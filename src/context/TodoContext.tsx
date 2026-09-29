import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type {
  ArchivedTodo,
  Todo,
  TodoCategory,
  TodoDraft,
} from "../types/todo";

type TodoState = {
  todos: Todo[];
  archivedTodos: ArchivedTodo[];
  draft: TodoDraft;
  isDarkMode: boolean;
};

type TodoAction =
  | { type: "ADD_TODO"; payload: Todo }
  | {
      type: "UPDATE_TODO";
      payload: {
        id: string;
        title: string;
        category: TodoCategory;
      };
    }
  | { type: "TOGGLE_TODO"; payload: string }
  | { type: "ARCHIVE_TODO"; payload: string }
  | { type: "SET_DRAFT"; payload: TodoDraft }
  | { type: "CLEAR_DRAFT" }
  | { type: "TOGGLE_THEME" }
  | { type: "RESET_ALL" };

type TodoContextValue = TodoState & {
  addTodo: (title: string, category: TodoCategory) => void;
  updateTodo: (todoId: string, title: string, category: TodoCategory) => void;
  toggleTodo: (todoId: string) => void;
  archiveTodo: (todoId: string) => void;
  setDraft: (draft: TodoDraft) => void;
  clearDraft: () => void;
  toggleTheme: () => void;
  resetAll: () => void;
};

const TODOS_KEY = "thousand-todos:todos";
const ARCHIVE_KEY = "thousand-todos:archive";
const THEME_KEY = "thousand-todos:theme";
const DRAFT_KEY = "thousand-todos:draft";

const emptyDraft: TodoDraft = {
  title: "",
  category: "study",
};

const TodoContext = createContext<TodoContextValue | null>(null);

const readStorage = <T,>(key: string, fallback: T, storage: Storage): T => {
  try {
    const savedValue = storage.getItem(key);
    return savedValue ? (JSON.parse(savedValue) as T) : fallback;
  } catch {
    return fallback;
  }
};

const createInitialState = (): TodoState => ({
  todos: readStorage<Todo[]>(TODOS_KEY, [], localStorage),
  archivedTodos: readStorage<ArchivedTodo[]>(ARCHIVE_KEY, [], localStorage),
  draft: readStorage<TodoDraft>(DRAFT_KEY, emptyDraft, sessionStorage),
  isDarkMode: readStorage<boolean>(THEME_KEY, false, localStorage),
});

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [action.payload, ...state.todos],
      };

    case "UPDATE_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? {
                ...todo,
                title: action.payload.title,
                category: action.payload.category,
              }
            : todo,
        ),
      };

    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo,
        ),
      };

    case "ARCHIVE_TODO": {
      const targetTodo = state.todos.find((todo) => todo.id === action.payload);

      if (!targetTodo) return state;

      const archivedTodo: ArchivedTodo = {
        id: targetTodo.id,
        title: targetTodo.title,
        category: targetTodo.category,
        createdAt: targetTodo.createdAt,
        completedAt: new Date().toISOString(),
      };

      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
        archivedTodos: [archivedTodo, ...state.archivedTodos],
      };
    }

    case "SET_DRAFT":
      return {
        ...state,
        draft: action.payload,
      };

    case "CLEAR_DRAFT":
      return {
        ...state,
        draft: emptyDraft,
      };

    case "TOGGLE_THEME":
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      };

    case "RESET_ALL":
      return {
        todos: [],
        archivedTodos: [],
        draft: emptyDraft,
        isDarkMode: false,
      };
  }
};

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, createInitialState());

  useEffect(() => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(state.todos));
  }, [state.todos]);

  useEffect(() => {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(state.archivedTodos));
  }, [state.archivedTodos]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(state.isDarkMode));
    document.documentElement.classList.toggle("dark", state.isDarkMode);
  }, [state.isDarkMode]);

  useEffect(() => {
    if (state.draft.title.trim()) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state.draft));
      return;
    }

    sessionStorage.removeItem(DRAFT_KEY);
  }, [state.draft]);

  const addTodo = (title: string, category: TodoCategory) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    dispatch({
      type: "ADD_TODO",
      payload: {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        category,
        createdAt: new Date().toISOString(),
        completed: false,
      },
    });
  };

  const updateTodo = (
    todoId: string,
    title: string,
    category: TodoCategory,
  ) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    dispatch({
      type: "UPDATE_TODO",
      payload: {
        id: todoId,
        title: trimmedTitle,
        category,
      },
    });
  };

  const toggleTodo = (todoId: string) => {
    dispatch({ type: "TOGGLE_TODO", payload: todoId });
  };

  const archiveTodo = (todoId: string) => {
    dispatch({ type: "ARCHIVE_TODO", payload: todoId });
  };

  const setDraft = (draft: TodoDraft) => {
    dispatch({ type: "SET_DRAFT", payload: draft });
  };

  const clearDraft = () => {
    dispatch({ type: "CLEAR_DRAFT" });
  };

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  const resetAll = () => {
    localStorage.removeItem(TODOS_KEY);
    localStorage.removeItem(ARCHIVE_KEY);
    localStorage.removeItem(THEME_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    dispatch({ type: "RESET_ALL" });
  };

  return (
    <TodoContext.Provider
      value={{
        ...state,
        addTodo,
        updateTodo,
        toggleTodo,
        archiveTodo,
        setDraft,
        clearDraft,
        toggleTheme,
        resetAll,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodos must be used within TodoProvider");
  }

  return context;
}
