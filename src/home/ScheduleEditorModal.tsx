import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useCategories,
  useHomeSchedules,
  useNewScheduleDraft,
} from "../storage";

function ScheduleEditorModal() {
  const [categoryError, setCategoryError] = useState(false);
  const schedules = useHomeSchedules((state) => state.schedules);
  const addSchedule = useHomeSchedules((state) => state.addSchedule);
  const saveSchedule = useHomeSchedules((state) => state.editSchedule);
  const categories = useCategories((state) => state.categories);
  const name = useNewScheduleDraft((state) => state.name);
  const selectedCategory = useNewScheduleDraft((state) => state.category);
  const editingScheduleId = useNewScheduleDraft(
    (state) => state.editingScheduleId,
  );
  const isAdding = useNewScheduleDraft((state) => state.isAdding);
  const open = useNewScheduleDraft((state) => state.open);
  const close = useNewScheduleDraft((state) => state.close);
  const updateName = useNewScheduleDraft((state) => state.updateName);
  const updateCategory = useNewScheduleDraft((state) => state.updateCategory);
  const clear = useNewScheduleDraft((state) => state.clear);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("schedule-name");
    const categoryValue = formData.get("schedule-category");
    const category = Number(categoryValue);

    if (typeof name !== "string" || name.trim() === "") {
      return;
    }

    if (
      categoryValue === null ||
      !categories.some((item) => item.id === category && item.id !== 0)
    ) {
      setCategoryError(true);
      return;
    }

    setCategoryError(false);
    if (editingScheduleId !== null) {
      const schedule = schedules.find((item) => item.id === editingScheduleId);
      if (!schedule) return;
      saveSchedule({ ...schedule, category, name: name.trim() });
    } else {
      addSchedule({
        category,
        name: name.trim(),
        addedDate: new Date(),
        isDone: false,
        doneDate: null,
      });
    }
    clear();
  }

  return (
    <Dialog
      open={isAdding}
      onOpenChange={(nextOpen) => (nextOpen ? open() : close())}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            className="fixed right-16 bottom-24 size-12 cursor-pointer rounded-full text-2xl"
          >
            +
          </Button>
        }
      />
      <DialogContent className="w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader className="-mx-6 -mt-6 rounded-t-xl bg-cyan-900 p-6 text-white dark:bg-slate-800">
            <DialogTitle>
              {editingScheduleId === null ? "새 할 일 추가" : "할 일 수정"}
            </DialogTitle>
            <DialogDescription>
              <span className="text-sm text-cyan-100">
                작성 중인 내용은 저장 전까지 임시 보관됩니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <Field>
            <Label htmlFor="schedule-name">할 일 제목</Label>
            <Input
              type="text"
              id="schedule-name"
              name="schedule-name"
              placeholder="예: 낙성대버터떡 굽기"
              maxLength={30}
              required
              value={name}
              onChange={(event) => updateName(event.target.value)}
            />
          </Field>
          <hr />
          <FieldSet>
            <FieldLegend>카테고리</FieldLegend>
            <RadioGroup
              name="schedule-category"
              value={selectedCategory ?? undefined}
              onValueChange={(value) => {
                updateCategory(Number(value));
                setCategoryError(false);
              }}
              className="schedule-category-options"
            >
              {categories.map((category) => {
                if (category.id === 0) return null;
                const inputId = `schedule-category-${category.id}`;

                return (
                  <Field key={category.id} orientation="horizontal">
                    <RadioGroupItem id={inputId} value={category.id} />
                    <Label htmlFor={inputId}>{category.name}</Label>
                  </Field>
                );
              })}
            </RadioGroup>
            {categoryError && (
              <p role="alert" className="text-sm text-destructive">
                카테고리를 선택해 주세요.
              </p>
            )}
          </FieldSet>
          <div className="flex gap-2">
            <Button render={<button type="button" onClick={close} />}>
              취소
            </Button>
            <Button render={<button type="submit" />}>저장하기</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleEditorModal;
