import type { Schedule } from "@/constants";
import type { Filter, Sort } from "./FilterModal";

export function applyFilter(schedules: Schedule[], filter: Filter) {
  return schedules.filter((schedule) => {
    const date =
      filter.filterBy === "addedDate" ? schedule.addedDate : schedule.doneDate;
    if (date === null) return false;

    const start = filter.filterStart
      ? new Date(filter.filterStart).setHours(0, 0, 0, 0)
      : null;
    const end = filter.filterEnd
      ? new Date(filter.filterEnd).setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000
      : null;
    const timestamp = date.getTime();

    return (start === null || timestamp >= start) && (end === null || timestamp < end);
  });
}

export function applySort(schedules: Schedule[], sort: Sort) {
  return schedules.toSorted((scheduleA, scheduleB) => {
    const dateA =
      sort.sortBy === "addedDate" ? scheduleA.addedDate : scheduleA.doneDate;
    const dateB =
      sort.sortBy === "addedDate" ? scheduleB.addedDate : scheduleB.doneDate;

    if (dateA === null || dateB === null) {
      if (dateA === dateB) return 0;
      return dateA === null ? 1 : -1;
    }

    const difference = dateA.getTime() - dateB.getTime();
    return sort.ascending ? difference : -difference;
  });
}
