export const categories = ["study", "exercise", "home"] as const;

export type TodoCategory = (typeof categories)[number];

export type Todo = {
  id: string;
  title: string;
  category: TodoCategory;
  createdAt: string;
  completed: boolean;
};

export type ArchivedTodo = Omit<Todo, "completed"> & {
  completedAt: string;
};

export type TodoDraft = {
  title: string;
  category: TodoCategory;
};
