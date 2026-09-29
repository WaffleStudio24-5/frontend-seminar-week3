import { create } from "zustand";
import {
  type Category,
  defaultCategories,
  defaultSettings,
  type Schedule,
} from "./constants";

const SETTING_KEY = "waffle-kdh-todo-settings";
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

function loadSettings() {
  const settingStroage = localStorage.getItem(SETTING_KEY);
  if (settingStroage === null) return defaultSettings;

  try {
    const parsedSettings: unknown = JSON.parse(settingStroage);
    if (
      !Array.isArray(parsedSettings) ||
      !parsedSettings.every(
        (entry): entry is [string, unknown] =>
          Array.isArray(entry) &&
          entry.length === 2 &&
          typeof entry[0] === "string",
      )
    ) {
      return defaultSettings;
    }

    const settings = new Map(parsedSettings);

    for (const key of defaultSettings.keys()) {
      if (
        !settings.has(key) ||
        typeof settings.get(key) !== typeof defaultSettings.get(key)
      ) {
        settings.set(key, defaultSettings.get(key));
      }
    }

    return settings;
  } catch {
    return defaultSettings;
  }
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
};

type SettingsStore = {
  settings: Map<string, unknown>;
  updateIsDark: (isDark: boolean) => void;
};

type NewScheduleDraft = {
  isAdding: boolean;
  name: string;
  category: number | null;
};

type NewScheduleDraftStore = NewScheduleDraft & {
  open: () => void;
  close: () => void;
  updateName: (name: string) => void;
  updateCategory: (category: number) => void;
  clear: () => void;
};

function loadNewScheduleDraft(): NewScheduleDraft {
  const draftStorage = sessionStorage.getItem(NEW_SCHEDULE_DRAFT_KEY);
  if (draftStorage === null) {
    return { isAdding: false, name: "", category: null };
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
      };
    }
  } catch {}

  return { isAdding: false, name: "", category: null };
}

function saveNewScheduleDraft(draft: NewScheduleDraft) {
  sessionStorage.setItem(NEW_SCHEDULE_DRAFT_KEY, JSON.stringify(draft));
}

export const useSettings = create<SettingsStore>((set) => ({
  settings: loadSettings(),
  updateIsDark: (isDark) =>
    set((state) => {
      const settings = new Map(state.settings);
      settings.set("isDark", isDark);
      localStorage.setItem(SETTING_KEY, JSON.stringify([...settings]));

      return { settings };
    }),
}));
const initialCategories = loadCategories();

export const useCategories = create<{ categories: Category[] }>(() => ({
  categories: initialCategories,
}));
export const useHomeSchedules = create<HomeScheduleStore>((set) => ({
  schedules: loadSchedules(HOME_SCHEDULE_KEY, initialCategories),
  addSchedule: (schedule) =>
    set((state) => {
      const id = Math.max(0, ...state.schedules.map((item) => item.id)) + 1;
      const schedules = [...state.schedules, { ...schedule, id }];

      localStorage.setItem(HOME_SCHEDULE_KEY, JSON.stringify(schedules));

      return { schedules };
    }),
}));
export const useArchiveSchedules = create<{ schedules: Schedule[] }>(() => ({
  schedules: loadSchedules(ARCHIVE_SCHEDULE_KEY, initialCategories),
}));

const initialNewScheduleDraft = loadNewScheduleDraft();

export const useNewScheduleDraft = create<NewScheduleDraftStore>((set) => ({
  ...initialNewScheduleDraft,
  open: () =>
    set((state) => {
      saveNewScheduleDraft({ ...state, isAdding: true });
      return { isAdding: true };
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
      const emptyDraft = { isAdding: false, name: "", category: null };
      saveNewScheduleDraft(emptyDraft);
      return emptyDraft;
    }),
}));

export function resetApplicationData() {
  localStorage.removeItem(SETTING_KEY);
  localStorage.removeItem(CATEGORY_KEY);
  localStorage.removeItem(HOME_SCHEDULE_KEY);
  localStorage.removeItem(ARCHIVE_SCHEDULE_KEY);
  sessionStorage.removeItem(NEW_SCHEDULE_DRAFT_KEY);

  useSettings.setState({ settings: new Map(defaultSettings) });
  useCategories.setState({ categories: [...defaultCategories] });
  useHomeSchedules.setState({ schedules: [] });
  useArchiveSchedules.setState({ schedules: [] });
  useNewScheduleDraft.setState({ isAdding: false, name: "", category: null });
}
