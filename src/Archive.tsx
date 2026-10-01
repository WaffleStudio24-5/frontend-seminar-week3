import type { Schedule } from "./constants";
import Head from "./Head";
import { useArchiveSchedules, useCategories } from "./storage";

function formatKstDate(date: Date) {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value;

  return `${getPart("year")}.${getPart("month")}.${getPart("day")}`;
}

function ArchivedScheduleCard({ schedule }: { schedule: Schedule }) {
  const categories = useCategories((state) => state.categories);
  const category = categories.find((category) => {
    return category.id === schedule.category;
  });

  return (
    <div className="schedule-card">
      <p>{schedule.name}</p>
      {category && (
        <span className="schedule-card-category">{category.name}</span>
      )}
      <span className="schedule-card-added-date">
        {formatKstDate(schedule.addedDate)}
      </span>
      {schedule.doneDate && (
        <span className="schedule-card-done-date">
          {formatKstDate(schedule.doneDate)}
        </span>
      )}
    </div>
  );
}

function ArchivedSchedules() {
  const schedules = useArchiveSchedules((state) => state.schedules);
  return (
    <section id="schedules">
      {schedules.length === 0 ? (
        <>
          <p>보관함이 비어 있습니다</p>
          <p>완료한 할 일의 보관하기 버튼을 누르면 이곳에 모입니다.</p>
        </>
      ) : (
        <>
          <div id="archived-schedules-header">
            <span>제목</span>
            <span>카테고리</span>
            <span>생성일</span>
            <span>완료일</span>
          </div>
          {schedules.map((schedule) => (
            <ArchivedScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </>
      )}
    </section>
  );
}

function Archive() {
  const schedules = useArchiveSchedules((state) => state.schedules);
  return (
    <>
      <Head />
      <h2>보관함</h2>
      <div>완료 후 보관한 할 일 {schedules.length}개</div>
      <ArchivedSchedules />
    </>
  );
}

export default Archive;
