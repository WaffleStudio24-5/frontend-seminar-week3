import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item, ItemGroup, ItemTitle } from "@/components/ui/item";
import Head from "../components/Head";
import type { Schedule } from "../constants";
import {
  cyanSurfaceVariants,
  scheduleCategoryBadgeVariants,
  scheduleItemVariants,
} from "../lib/app-variants";
import { cn } from "../lib/utils";
import { useArchiveSchedules, useCategories } from "../storage";
import { formatKstDate } from "./DateHelper";
import { FilterModal, useFilter, useSort } from "./FilterModal";
import { applyFilter, applySort } from "./filter";

function ArchivedScheduleCard({ schedule }: { schedule: Schedule }) {
  const categories = useCategories((state) => state.categories);
  const category = categories.find((category) => {
    return category.id === schedule.category;
  });

  return (
    <Item className={scheduleItemVariants({ layout: "archive" })}>
      <ItemTitle className="min-w-0 basis-full flex-1 text-base sm:basis-auto">
        {schedule.name}
      </ItemTitle>
      <div className="basis-full grid w-fit grid-cols-[max-content_max-content_max-content] items-center gap-x-2 gap-y-2 sm:contents">
        <div className="min-w-0 sm:w-[clamp(5rem,6vw,8rem)] sm:flex-none">
          {category && (
            <Badge
              className={scheduleCategoryBadgeVariants({ placement: "column" })}
            >
              {category.name}
            </Badge>
          )}
        </div>
        <span className="flex min-w-0 flex-col text-sm text-gray-700 dark:text-slate-300 sm:w-[clamp(5rem,6vw,8rem)] sm:flex-none">
          <span className="text-xs text-muted-foreground sm:hidden">
            생성일
          </span>
          <span className="tabular-nums whitespace-nowrap">
            {formatKstDate(schedule.addedDate)}
          </span>
        </span>
        <span className="flex min-w-0 flex-col text-sm text-gray-700 dark:text-slate-300 sm:w-[clamp(5rem,6vw,8rem)] sm:flex-none">
          <span className="text-xs text-muted-foreground sm:hidden">
            완료일
          </span>
          <span className="tabular-nums whitespace-nowrap">
            {schedule.doneDate ? formatKstDate(schedule.doneDate) : "—"}
          </span>
        </span>
      </div>
    </Item>
  );
}

function ArchivedSchedules() {
  const schedules = useArchiveSchedules((state) => state.schedules);
  let processedSchedules: Schedule[] | undefined;
  const filterBy = useFilter((state) => state.filterBy);
  const filterStart = useFilter((state) => state.filterStart);
  const filterEnd = useFilter((state) => state.filterEnd);
  const sortBy = useSort((state) => state.sortBy);
  const ascending = useSort((state) => state.ascending);
  const filter = { filterBy, filterStart, filterEnd };
  const sort = { sortBy, ascending };

  if (schedules) {
    processedSchedules = applySort(applyFilter(schedules, filter), sort);
  }

  return (
    <Card
      id="schedules"
      className={cn("min-h-0 border-none", cyanSurfaceVariants())}
    >
      <CardContent className="min-h-0 flex-1">
        {processedSchedules === undefined ||
        schedules.length === 0 ||
        processedSchedules.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {schedules.length > 0 && processedSchedules?.length === 0
                  ? "필터 조건에 맞는 일정이 없습니다"
                  : "보관함이 비어 있습니다"}
              </EmptyTitle>
              <EmptyDescription>
                {schedules.length > 0 && processedSchedules?.length === 0
                  ? "필터 조건을 변경해 보세요."
                  : "완료한 할 일의 보관하기 버튼을 누르면 이곳에 모입니다."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden w-full flex-nowrap items-center gap-3.5 p-4 font-medium sm:flex">
              <span className="min-w-0 flex-1">제목</span>
              <span className="w-[clamp(5rem,6vw,8rem)] shrink-0">
                카테고리
              </span>
              <span className="w-[clamp(5rem,6vw,8rem)] shrink-0">생성일</span>
              <span className="w-[clamp(5rem,6vw,8rem)] shrink-0">완료일</span>
            </div>
            <ItemGroup>
              {processedSchedules.map((schedule) => (
                <ArchivedScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </ItemGroup>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DevScheduleSeeder() {
  const addArchiveSchedule = useArchiveSchedules((state) => state.addSchedule);
  const categories = useCategories((state) => state.categories);

  const seedSchedules = () => {
    const availableCategories = categories.filter(
      (category) => category.id !== 0,
    );
    const now = Date.now();

    for (let index = 0; index < 24; index += 1) {
      const addedAt =
        now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000);
      const doneAt = addedAt + Math.floor(Math.random() * (now - addedAt + 1));
      const category =
        availableCategories[
          Math.floor(Math.random() * availableCategories.length)
        ];

      addArchiveSchedule({
        category: category?.id ?? 1,
        name: `샘플 일정 ${index + 1}`,
        addedDate: new Date(addedAt),
        isDone: true,
        doneDate: new Date(doneAt),
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className="fixed bottom-4 right-4 z-50 opacity-80 "
      onClick={seedSchedules}
    >
      테스트용 일정 생성
    </Button>
  );
}

function Archive() {
  const schedules = useArchiveSchedules((state) => state.schedules);

  return (
    <div className="flex min-h-screen flex-col">
      <Head />
      <main id="archive-main" className="relative flex-1">
        {import.meta.env.DEV && <DevScheduleSeeder />}
        <h2>보관함</h2>
        <p>완료 후 보관한 할 일 {schedules.length}개</p>
        <div className="absolute right-0 [grid-area:2/1/3/2] flex self-end justify-end [&>section]:flex [&>section]:w-fit">
          <FilterModal />
        </div>
        <ArchivedSchedules />
      </main>
    </div>
  );
}

export default Archive;
