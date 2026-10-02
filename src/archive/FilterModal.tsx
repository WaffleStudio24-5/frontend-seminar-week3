import { CalendarArrowDown, CalendarArrowUp } from "lucide-react";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { archiveFilterButtonVariants } from "../lib/app-variants";
import { DatePickerInput } from "./DateHelper";

const criteriaOptions = [
  { value: "addedDate", label: "생성일" },
  { value: "doneDate", label: "완료일" },
] as const satisfies readonly { value: string; label: string }[];
type Criteria = (typeof criteriaOptions)[number];
type CriteriaValues = (typeof criteriaOptions)[number]["value"];

export type Filter = {
  filterBy: CriteriaValues;
  filterStart: Date | null;
  filterEnd: Date | null;
};

export type Sort = {
  sortBy: CriteriaValues;
  ascending: boolean;
};

const defaultFilter: Filter = {
  filterBy: "doneDate",
  filterStart: null,
  filterEnd: null,
};

const defaultSort: Sort = {
  sortBy: "doneDate",
  ascending: false,
};

type FilterStore = Filter & {
  changeFilter: (filterBy: CriteriaValues) => void;
  changeStart: (filterStart: Date | null) => void;
  changeEnd: (filterEnd: Date | null) => void;
  clear: () => void;
};

type SortStore = Sort & {
  changeSort: (sortBy: CriteriaValues) => void;
  changeAscending: (ascending: boolean) => void;
  clear: () => void;
};

export const useFilter = create<FilterStore>((set) => ({
  ...defaultFilter,
  changeFilter: (filterBy) => set({ filterBy }),
  changeStart: (filterStart) => set({ filterStart }),
  changeEnd: (filterEnd) => set({ filterEnd }),
  clear: () =>
    set(() => {
      return defaultFilter;
    }),
}));

export const useSort = create<SortStore>((set) => ({
  ...defaultSort,
  changeSort: (sortBy) => set({ sortBy }),
  changeAscending: (ascending) => set({ ascending }),
  clear: () =>
    set(() => {
      return defaultSort;
    }),
}));

function CriteriaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CriteriaValues;
  onChange: (value: CriteriaValues) => void;
}) {
  return (
    <Field className="m-2 w-48">
      <FieldLabel>{label}</FieldLabel>
      <Combobox
        items={criteriaOptions}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue === "addedDate" || nextValue === "doneDate") {
            onChange(nextValue);
          }
        }}
        itemToStringLabel={(nextValue) =>
          criteriaOptions.find((criteria) => criteria.value === nextValue)
            ?.label ?? ""
        }
      >
        <ComboboxInput placeholder={label} />
        <ComboboxContent>
          <ComboboxList>
            {(item: Criteria) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

function FilterControl() {
  const {
    filterBy,
    filterStart,
    filterEnd,
    changeFilter,
    changeStart,
    changeEnd,
    clear,
  } = useFilter();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={archiveFilterButtonVariants({ control: "filter" })}
          >
            필터
          </Button>
        }
      />
      <PopoverContent className="w-auto max-w-[calc(100vw-2rem)]">
        <PopoverHeader>
          <PopoverTitle>보관 일정 필터</PopoverTitle>
          <PopoverDescription>기준과 기간을 선택하세요.</PopoverDescription>
        </PopoverHeader>
        <form className="flex flex-wrap">
          <CriteriaField
            label="필터 기준"
            value={filterBy}
            onChange={changeFilter}
          />
          <DatePickerInput
            label={`${criteriaOptions.find((criteria) => criteria.value === filterBy)?.label ?? ""} 시작`}
            value={filterStart}
            onChange={(date) => changeStart(date)}
            className="m-2 w-48"
          />
          <DatePickerInput
            label={`${criteriaOptions.find((criteria) => criteria.value === filterBy)?.label ?? ""} 끝`}
            value={filterEnd}
            onChange={(date) => changeEnd(date)}
            className="m-2 w-48"
          />
          <Button
            type="button"
            variant="destructive"
            onClick={clear}
            className="m-2 self-end cursor-pointer"
          >
            초기화
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function SortControl() {
  const { sortBy, ascending, changeSort, changeAscending, clear } = useSort();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={archiveFilterButtonVariants({ control: "sort" })}
          >
            정렬
          </Button>
        }
      />
      <PopoverContent className="w-auto max-w-[calc(100vw-2rem)]">
        <PopoverHeader>
          <PopoverTitle>보관 일정 정렬</PopoverTitle>
          <PopoverDescription>
            정렬 기준과 순서를 선택하세요.
          </PopoverDescription>
        </PopoverHeader>
        <form className="flex flex-wrap">
          <CriteriaField
            label="정렬 기준"
            value={sortBy}
            onChange={changeSort}
          />
          <Button
            type="button"
            variant="default"
            onClick={() => changeAscending(!ascending)}
            className="m-2 self-end cursor-pointer"
            aria-label={ascending ? "오름차순" : "내림차순"}
          >
            {ascending ? <CalendarArrowUp /> : <CalendarArrowDown />}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={clear}
            className="m-2 self-end cursor-pointer"
          >
            초기화
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export function FilterModal() {
  return (
    <section className="flex-row">
      <FilterControl />
      <SortControl />
    </section>
  );
}

export default FilterModal;
