import type { Category } from "./constants";
import {
  useCategories,
  useHomeSchedules,
  useNewScheduleDraft,
} from "./storage";

function NewScheduleCategoryOption({
  category,
  isSelected,
  onChange,
}: {
  category: Category;
  isSelected: boolean;
  onChange: (category: number) => void;
}) {
  const inputId = `schedule-category-${category.id}`;

  return (
    <div className="schedule-category-option">
      <input
        id={inputId}
        type="radio"
        name="schedule-category"
        value={category.id}
        required={true}
        checked={isSelected}
        onChange={() => onChange(category.id)}
      />
      <label htmlFor={inputId}>{category.name}</label>
    </div>
  );
}

function NewScheduleModal() {
  const addSchedule = useHomeSchedules((state) => state.addSchedule);
  const categories = useCategories((state) => state.categories);
  const name = useNewScheduleDraft((state) => state.name);
  const selectedCategory = useNewScheduleDraft((state) => state.category);
  const close = useNewScheduleDraft((state) => state.close);
  const updateName = useNewScheduleDraft((state) => state.updateName);
  const updateCategory = useNewScheduleDraft((state) => state.updateCategory);
  const clear = useNewScheduleDraft((state) => state.clear);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("schedule-name");
    const category = Number(formData.get("schedule-category"));

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !categories.some((item) => item.id === category && item.id !== 0)
    ) {
      return;
    }

    addSchedule({
      category,
      name: name.trim(),
      addedDate: new Date(),
      isDone: false,
      doneDate: null,
    });
    clear();
  }

  return (
    <>
      <div id="overlayBackground" />
      <form onSubmit={handleSubmit}>
        <h3>새 할 일 추가</h3>
        <label htmlFor="schedule-name">할 일 제목</label>
        <input
          type="text"
          id="schedule-name"
          name="schedule-name"
          placeholder="예: 낙성대버터떡 먹기"
          required={true}
          value={name}
          onChange={(event) => updateName(event.target.value)}
        />
        <fieldset className="schedule-category-options">
          <legend>카테고리</legend>
          {categories.map((category) => {
            return (
              category.id !== 0 && (
                <NewScheduleCategoryOption
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onChange={updateCategory}
                />
              )
            );
          })}
        </fieldset>
        <p>{"참고) 작성 중인 내용은 저장 전까지 임시 보관됩니다."}</p>
        <button type="button" onClick={close}>
          취소
        </button>
        <button type="submit">저장하기</button>
      </form>
    </>
  );
}

export default NewScheduleModal;
