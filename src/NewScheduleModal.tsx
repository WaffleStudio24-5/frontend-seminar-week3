import { Button } from "@/components/ui/button";
import { Field, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useCategories,
  useHomeSchedules,
  useNewScheduleDraft,
} from "./storage";

function NewScheduleModal() {
  const addSchedule = useHomeSchedules((state) => state.addSchedule);
  const categories = useCategories((state) => state.categories);
  const name = useNewScheduleDraft((state) => state.name);
  const selectedCategory = useNewScheduleDraft((state) => state.category);
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
    <Popover
      open={isAdding}
      onOpenChange={(nextOpen) => (nextOpen ? open() : close())}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            className="fixed right-16 bottom-24 size-12 rounded-full text-2xl"
          >
            +
          </Button>
        }
      />
      <PopoverContent side="top" align="end" className="w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PopoverHeader className="-mx-4 -mt-4 rounded-t-md bg-black p-4 text-white">
            <PopoverTitle>새 할 일 추가</PopoverTitle>
            <PopoverDescription>
              <span className="text-sm text-cyan-100">
                작성 중인 내용은 저장 전까지 임시 보관됩니다.
              </span>
            </PopoverDescription>
          </PopoverHeader>
          <Field>
            <Label htmlFor="schedule-name">할 일 제목</Label>
            <Input
              type="text"
              id="schedule-name"
              name="schedule-name"
              placeholder="예: 낙성대버터떡 굽기"
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
              onValueChange={(value) => updateCategory(Number(value))}
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
          </FieldSet>
          <div className="flex gap-2">
            <Button render={<button type="button" onClick={close} />}>
              취소
            </Button>
            <Button render={<button type="submit" />}>저장하기</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default NewScheduleModal;
