import type { Schedule } from "./constants";
import Head from "./Head";
import NewScheduleModal from "./NewScheduleModal";
import {
  useArchiveSchedules,
  useCategories,
  useHomeSchedules,
  useNewScheduleDraft,
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
    <div className="schedule-card">
      <input
        type="checkbox"
        checked={schedule.isDone}
        onChange={(event) =>
          editSchedule({
            ...schedule,
            isDone: event.target.checked,
            doneDate: new Date(Date.now()),
          })
        }
      />
      <p>{schedule.name}</p>
      {schedule.isDone && (
        <button
          type="button"
          onClick={() => {
            archiveSchedule(schedule);
            deleteSchedule(schedule.id);
          }}
        >
          보관하기
        </button>
      )}
      {category && (
        <span className="schedule-card-category">{category.name}</span>
      )}
    </div>
  );
}

function HomeSchedules() {
  const schedules = useHomeSchedules((state) => state.schedules);
  return (
    <section id="schedules">
      {schedules.length === 0 ? (
        <>
          <p>할 일이 비어 있습니다</p>
          <p>오른쪽 아래의 + 버튼을 눌러 할 일을 추가해 보세요.</p>
        </>
      ) : (
        schedules.map((schedule) => (
          <HomeScheduleCard key={schedule.id} schedule={schedule} />
        ))
      )}
    </section>
  );
}

function AddScheduleButton() {
  const openNewSchedule = useNewScheduleDraft((state) => state.open);

  return (
    <button type="button" onClick={openNewSchedule}>
      +
    </button>
  );
}

function Home() {
  const isAdding = useNewScheduleDraft((state) => state.isAdding);
  return (
    <>
      <Head page="home" />
      <main>
        <h2>할 일 리스트</h2>
        <p>오늘 해야 할 일을 기록하고 관리해 보세요.</p>
        <HomeSchedules />
        <AddScheduleButton />
        {isAdding && <NewScheduleModal />}
      </main>
    </>
  );
}

export default Home;
