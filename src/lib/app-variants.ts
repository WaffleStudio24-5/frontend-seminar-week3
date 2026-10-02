import { cva } from "class-variance-authority";

export const scheduleItemVariants = cva(
  "bg-cyan-400 p-4 text-slate-950 dark:bg-slate-700 dark:text-slate-50",
  {
    variants: {
      layout: {
        home: "flex-row cursor-pointer",
        archive: "flex-row flex-wrap sm:flex-nowrap",
      },
    },
  },
);

export const scheduleCategoryBadgeVariants = cva(
  "bg-cyan-700 px-2 py-3 text-white dark:bg-cyan-300 dark:text-slate-950",
  {
    variants: {
      placement: {
        inline: "ml-auto",
        column: "",
      },
    },
  },
);

export const cyanSurfaceVariants = cva("bg-cyan-200 dark:bg-slate-800");

export const archiveFilterButtonVariants = cva(
  "w-12 cursor-pointer bg-secondary hover:bg-gray-300 dark:hover:bg-gray-800",
  {
    variants: {
      control: {
        filter: "mr-2",
        sort: "",
      },
    },
  },
);
