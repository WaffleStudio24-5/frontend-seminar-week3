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
import type { Schedule } from "./constants";
import Head from "./Head";
import NewScheduleModal from "./NewScheduleModal";
import {
  useArchiveSchedules,
  useCategories,
  useHomeSchedules,
} from "./storage";

function HomeScheduleCard({ schedule }: { schedule: Schedule }) {
  const editSchedule = useHomeSchedules((state) => state.editSchedule);
  const deleteSchedule = useHomeSchedules((state) => state.deleteSchedule);
  const archiveSchedule = useArchiveSchedules((state) => state.addSchedule);
  const categories = useCategories((state) => state.categories);
  const category = categories.find((category) => {
    return category.id === schedule.category;
  });

  return (
    <Item className="flex-row p-4 bg-cyan-300">
      <Checkbox
        checked={schedule.isDone}
        onCheckedChange={(checked) =>
          editSchedule({
            ...schedule,
            isDone: checked === true,
            doneDate: checked === true ? new Date() : null,
          })
        }
        className={"bg-white"}
      />
      <ItemTitle className="text-base">{schedule.name}</ItemTitle>
      <ItemContent className="relative flex-row items-center justify-end">
        {schedule.isDone && (
          <Button
            render={
              <button
                type="button"
                onClick={() => {
                  archiveSchedule(schedule);
                  deleteSchedule(schedule.id);
                }}
              />
            }
            className="absolute right-16 w-16 bg-gray-400 text-gray-900"
          >
            보관하기
          </Button>
        )}
        {category && (
          <Badge className="ml-auto px-2 py-3 bg-cyan-700">
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
    <Card id="schedules" className="min-h-0 border-none bg-cyan-100">
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
        <NewScheduleModal />
      </main>
    </div>
  );
}

export default Home;
