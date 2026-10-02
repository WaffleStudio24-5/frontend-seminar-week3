import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import Head from "../components/Head";
import type { Schedule } from "../constants";
import {
  cyanSurfaceVariants,
  scheduleCategoryBadgeVariants,
  scheduleItemVariants,
} from "../lib/app-variants";
import { cn } from "../lib/utils";
import {
  useArchiveSchedules,
  useCategories,
  useHomeSchedules,
  useNewScheduleDraft,
} from "../storage";
import ScheduleEditorModal from "./ScheduleEditorModal";

function HomeScheduleCard({ schedule }: { schedule: Schedule }) {
  const editSchedule = useHomeSchedules((state) => state.editSchedule);
  const deleteSchedule = useHomeSchedules((state) => state.deleteSchedule);
  const editDraft = useNewScheduleDraft((state) => state.edit);
  const archiveSchedule = useArchiveSchedules((state) => state.addSchedule);
  const categories = useCategories((state) => state.categories);
  const category = categories.find((category) => {
    return category.id === schedule.category;
  });

  return (
    <Item
      className={scheduleItemVariants({ layout: "home" })}
      role="button"
      tabIndex={0}
      onClick={() => editDraft(schedule)}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          editDraft(schedule);
        }
      }}
    >
      <Checkbox
        checked={schedule.isDone}
        onClick={(event) => event.stopPropagation()}
        onCheckedChange={(checked) =>
          editSchedule({
            ...schedule,
            isDone: checked === true,
            doneDate: checked === true ? new Date() : null,
          })
        }
        className="bg-background"
      />
      <ItemTitle
        className={`text-base ${schedule.isDone ? "line-through" : ""}`}
      >
        {schedule.name}
      </ItemTitle>
      <ItemContent className="relative flex-row items-center justify-end">
        {schedule.isDone && (
          <Button
            render={
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  archiveSchedule(schedule);
                  deleteSchedule(schedule.id);
                }}
              />
            }
            className="absolute right-16 w-16 cursor-pointer bg-gray-400 text-gray-900 hover:text-white dark:bg-slate-600 dark:text-slate-50 dark:hover:bg-slate-500"
          >
            보관하기
          </Button>
        )}
        {category && (
          <Badge
            className={scheduleCategoryBadgeVariants({ placement: "inline" })}
          >
            {category.name}
          </Badge>
        )}
      </ItemContent>
    </Item>
  );
}

function HomeSchedules() {
  const schedules = useHomeSchedules((state) => state.schedules);
  return (
    <Card
      id="schedules"
      className={cn("min-h-0 border-none", cyanSurfaceVariants())}
    >
      <CardContent className="min-h-0 flex-1">
        {schedules.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>할 일이 비어 있습니다</EmptyTitle>
              <EmptyDescription>
                오른쪽 아래의 + 버튼을 눌러 할 일을 추가해 보세요.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup>
            {schedules.map((schedule) => (
              <HomeScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Head />
      <main id="home-main" className="flex-1">
        <h2>할 일 리스트</h2>
        <p>오늘 해야 할 일을 기록하고 관리해 보세요.</p>
        <HomeSchedules />
        <ScheduleEditorModal />
      </main>
    </div>
  );
}

export default Home;
