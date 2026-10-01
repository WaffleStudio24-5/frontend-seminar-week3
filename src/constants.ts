/* 페이지 */
export type Pages = "home" | "archive" | "settings";

/* 카테고리 */
export type Category = {
  id: number;
  name: string;
};

export const defaultCategories: Category[] = [
  { id: 0, name: "전체" },
  { id: 1, name: "공부" },
  { id: 2, name: "운동" },
  { id: 3, name: "집안일" },
];

/* 할 일 */
export type Schedule = {
  id: number;
  category: number;
  name: string;

  addedDate: Date;
  isDone: boolean;
  doneDate: null | Date;
};

/* 설정 */
export const defaultSettings = new Map([["isDark", false]]);
