import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function formatKstDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

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

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

export function DatePickerInput({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(new Date());
  const [inputValue, setInputValue] = React.useState(
    formatKstDate(value ?? undefined),
  );
  const date = value ?? undefined;

  React.useEffect(() => {
    setInputValue(formatKstDate(value ?? undefined));
  }, [value]);

  return (
    <Field className={className ?? "mx-auto w-48"}>
      <FieldLabel htmlFor="date-required">{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={inputValue}
          placeholder="YYYY.MM.DD"
          onChange={(e) => {
            const nextDate = new Date(e.target.value);
            setInputValue(e.target.value);
            if (isValidDate(nextDate)) {
              setMonth(nextDate);
              onChange(nextDate);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id="date-picker"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  onChange(date ?? null);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
