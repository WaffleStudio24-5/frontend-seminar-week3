import { create } from "zustand";
import {
  type Category,
  defaultCategories,
  type Schedule,
} from "./constants";

const CATEGORY_KEY = "waffle-kdh-todo-categories";
const HOME_SCHEDULE_KEY = "waffle-kdh-todo-home-schedules";
const ARCHIVE_SCHEDULE_KEY = "waffle-kdh-todo-archive-schedules";
const NEW_SCHEDULE_DRAFT_KEY = "waffle-kdh-todo-new-schedule-draft";

function repairDuplicateIds<T extends { id: number }>(
  items: T[],
  isPreferredDuplicate = (_item: T) => false,
): T[] {
  const usedIds = new Set(items.map((item) => item.id));
  const preferredIds = new Set(
    items.filter(isPreferredDuplicate).map((item) => item.id),
  );
  const seenIds = new Set<number>();
  let nextId = items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

  return items.map((item) => {
    const needsRepair =
      seenIds.has(item.id) ||
      (preferredIds.has(item.id) && !isPreferredDuplicate(item));

    if (!needsRepair) {
      seenIds.add(item.id);
      return item;
    }

    while (usedIds.has(nextId)) nextId += 1;
    usedIds.add(nextId);
    seenIds.add(nextId);

    return { ...item, id: nextId++ };
  });
}

function loadCategories() {
  const categoryStroage = localStorage.getItem(CATEGORY_KEY);
  if (categoryStroage === null) return defaultCategories;

  try {
    const parsedCategories: unknown = JSON.parse(categoryStroage);
    if (
      Array.isArray(parsedCategories) &&
      parsedCategories.every(
        (category): category is Category =>
          typeof category === "object" &&
          category !== null &&
          "id" in category &&
          "name" in category &&
          typeof category.id === "number" &&
          typeof category.name === "string",
      ) &&
      parsedCategories.some(
        (category) => category.id === 0 && category.name === "전체",
      )
    ) {
      return repairDuplicateIds(
        parsedCategories,
        (category) => category.id === 0 && category.name === "전체",
      );
    }
  } catch {}

  return defaultCategories;
}

function loadSchedules(
  schedule_key: string,
  categories: Category[],
): Schedule[] {
  const scheduleStroage = localStorage.getItem(schedule_key);
  if (scheduleStroage === null) return [];

  try {
    const parsedSchedules: unknown = JSON.parse(scheduleStroage);
    if (
      !Array.isArray(parsedSchedules) ||
      !parsedSchedules.every(
        (schedule) =>
          typeof schedule === "object" &&
          schedule !== null &&
          "id" in schedule &&
          "category" in schedule &&
          "name" in schedule &&
          "addedDate" in schedule &&
          "isDone" in schedule &&
          "doneDate" in schedule &&
          typeof schedule.id === "number" &&
          typeof schedule.category === "number" &&
          typeof schedule.name === "string" &&
          typeof schedule.addedDate === "string" &&
          !Number.isNaN(Date.parse(schedule.addedDate)) &&
          typeof schedule.isDone === "boolean" &&
          (schedule.doneDate === null ||
            (typeof schedule.doneDate === "string" &&
              !Number.isNaN(Date.parse(schedule.doneDate)))),
      )
    ) {
      return [];
    }

    const validCategoryIds = new Set(
      categories
        .filter((category) => category.id !== 0)
        .map((category) => category.id),
    );

    return repairDuplicateIds(parsedSchedules).map(
      (schedule): Schedule => ({
        ...schedule,
        category: validCategoryIds.has(schedule.category)
          ? schedule.category
          : 1,
        addedDate: new Date(schedule.addedDate),
        doneDate:
          schedule.doneDate === null ? null : new Date(schedule.doneDate),
      }),
    );
  } catch {
    return [];
  }
}

type HomeScheduleStore = {
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, "id">) => void;
  editSchedule: (schedule: Schedule) => void;
  deleteSchedule: (scheduleId: number) => void;
};

type ArchiveScheduleStore = {
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, "id">) => void;
  editSchedule: (schedule: Schedule) => void;
  deleteSchedule: (scheduleId: number) => void;
};

type NewScheduleDraft = {
  isAdding: boolean;
  name: string;
  category: number | null;
  editingScheduleId: number | null;
};

type NewScheduleDraftStore = NewScheduleDraft & {
  open: () => void;
  edit: (schedule: Schedule) => void;
  close: () => void;
  updateName: (name: string) => void;
  updateCategory: (category: number) => void;
  clear: () => void;
};

function loadNewScheduleDraft(): NewScheduleDraft {
  const draftStorage = sessionStorage.getItem(NEW_SCHEDULE_DRAFT_KEY);
  if (draftStorage === null) {
    return {
      isAdding: false,
      name: "",
      category: null,
      editingScheduleId: null,
    };
  }

  try {
    const draft: unknown = JSON.parse(draftStorage);
    if (
      typeof draft === "object" &&
      draft !== null &&
      "isAdding" in draft &&
      "name" in draft &&
      "category" in draft &&
      typeof draft.isAdding === "boolean" &&
      typeof draft.name === "string" &&
      (draft.category === null || typeof draft.category === "number")
    ) {
      return {
        isAdding: draft.isAdding,
        name: draft.name,
        category: draft.category,
        editingScheduleId:
          "editingScheduleId" in draft &&
          typeof draft.editingScheduleId === "number"
            ? draft.editingScheduleId
            : null,
      };
    }
  } catch {}

  return { isAdding: false, name: "", category: null, editingScheduleId: null };
}

function saveNewScheduleDraft(draft: NewScheduleDraft) {
  sessionStorage.setItem(NEW_SCHEDULE_DRAFT_KEY, JSON.stringify(draft));
}

const initialCategories = loadCategories();
const initialHomeSchedules = loadSchedules(
  HOME_SCHEDULE_KEY,
  initialCategories,
);
const initialArchiveSchedules = loadSchedules(
  ARCHIVE_SCHEDULE_KEY,
  initialCategories,
);

function getNextScheduleId() {
  const allScheduleIds = [
    ...useHomeSchedules.getState().schedules,
    ...useArchiveSchedules.getState().schedules,
  ].map((schedule) => schedule.id);

  return Math.max(0, ...allScheduleIds) + 1;
}

export const useCategories = create<{ categories: Category[] }>(() => ({
  categories: initialCategories,
}));
export const useHomeSchedules = create<HomeScheduleStore>((set) => ({
  schedules: initialHomeSchedules,
  addSchedule: (schedule) =>
    set((state) => {
      const id = getNextScheduleId();
      const schedules = [...state.schedules, { ...schedule, id }];

      localStorage.setItem(HOME_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
  editSchedule: (newSchedule: Schedule) =>
    set((state) => {
      const schedules = state.schedules.map((schedule) =>
        schedule.id === newSchedule.id ? newSchedule : schedule,
      );

      localStorage.setItem(HOME_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
  deleteSchedule: (targetScheduleId: number) =>
    set((state) => {
      const schedules = state.schedules.filter(
        (schedule) => schedule.id !== targetScheduleId,
      );

      localStorage.setItem(HOME_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
}));
export const useArchiveSchedules = create<ArchiveScheduleStore>((set) => ({
  schedules: initialArchiveSchedules,
  addSchedule: (schedule) =>
    set((state) => {
      const id = getNextScheduleId();
      const schedules = [...state.schedules, { ...schedule, id }];

      localStorage.setItem(ARCHIVE_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
  editSchedule: (newSchedule) =>
    set((state) => {
      const schedules = state.schedules.map((schedule) =>
        schedule.id === newSchedule.id ? newSchedule : schedule,
      );

      localStorage.setItem(ARCHIVE_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
  deleteSchedule: (targetScheduleId) =>
    set((state) => {
      const schedules = state.schedules.filter(
        (schedule) => schedule.id !== targetScheduleId,
      );

      localStorage.setItem(ARCHIVE_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
}));

const initialNewScheduleDraft = loadNewScheduleDraft();

export const useNewScheduleDraft = create<NewScheduleDraftStore>((set) => ({
  ...initialNewScheduleDraft,
  open: () =>
    set((state) => {
      const next = {
        ...state,
        isAdding: true,
        name: state.editingScheduleId === null ? state.name : "",
        category: state.editingScheduleId === null ? state.category : null,
        editingScheduleId: null,
      };
      saveNewScheduleDraft(next);
      return next;
    }),
  edit: (schedule) =>
    set((state) => {
      const next = {
        ...state,
        isAdding: true,
        name: schedule.name,
        category: schedule.category,
        editingScheduleId: schedule.id,
      };
      saveNewScheduleDraft(next);
      return next;
    }),
  close: () =>
    set((state) => {
      saveNewScheduleDraft({ ...state, isAdding: false });
      return { isAdding: false };
    }),
  updateName: (name) =>
    set((state) => {
      saveNewScheduleDraft({ ...state, name });
      return { name };
    }),
  updateCategory: (category) =>
    set((state) => {
      saveNewScheduleDraft({ ...state, category });
      return { category };
    }),
  clear: () =>
    set(() => {
      const emptyDraft = {
        isAdding: false,
        name: "",
        category: null,
        editingScheduleId: null,
      };
      saveNewScheduleDraft(emptyDraft);
      return emptyDraft;
    }),
}));

export function resetApplicationData() {
  localStorage.removeItem(CATEGORY_KEY);
  localStorage.removeItem(HOME_SCHEDULE_KEY);
  localStorage.removeItem(ARCHIVE_SCHEDULE_KEY);
  sessionStorage.removeItem(NEW_SCHEDULE_DRAFT_KEY);

  useCategories.setState({ categories: [...defaultCategories] });
  useHomeSchedules.setState({ schedules: [] });
  useArchiveSchedules.setState({ schedules: [] });
  useNewScheduleDraft.setState({
    isAdding: false,
    name: "",
    category: null,
    editingScheduleId: null,
  });
}
