"use client";

import { format, isValid, parse, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/utility/classNames";

import { Calendar } from "./calendar";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

function dateFromValue(value: string) {
  if (!value) return undefined;
  const date = parseISO(value);
  return isValid(date) ? date : undefined;
}

function formatDate(date: Date | undefined, dateFormat: string) {
  return date ? format(date, dateFormat, { locale: enGB }) : "";
}

function parseDate(value: string, dateFormat: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  const isoDate = dateFromValue(trimmedValue);
  if (isoDate) return isoDate;

  const readableDate = parse(trimmedValue, dateFormat, new Date(), {
    locale: enGB,
  });
  return isValid(readableDate) ? readableDate : undefined;
}

export type DatePickerInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  calendarLabel?: string;
  commitEmpty?: boolean;
  onCalendarOpenChange?: (open: boolean) => void;
  onDateSelect?: (value: string) => void;
  dateFormat?: string;
  defaultCalendarOpen?: boolean;
  showCalendarButton?: boolean;
  keepInputFocusOnOpen?: boolean;
};

export function DatePickerInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  className,
  containerClassName,
  calendarLabel = "Select date",
  commitEmpty = true,
  onCalendarOpenChange,
  onDateSelect,
  dateFormat = "dd MMMM yyyy",
  defaultCalendarOpen = false,
  showCalendarButton = true,
  keepInputFocusOnOpen = false,
  placeholder = "01 June 2025",
  disabled,
  ...props
}: DatePickerInputProps) {
  const selectedDate = dateFromValue(value);
  const [open, setOpen] = useState(defaultCalendarOpen);
  const [month, setMonth] = useState<Date | undefined>(selectedDate);
  const [inputValue, setInputValue] = useState(formatDate(selectedDate, dateFormat));
  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onCalendarOpenChange?.(nextOpen);
  };

  useEffect(() => {
    const nextDate = dateFromValue(value);
    setInputValue(formatDate(nextDate, dateFormat));
    if (nextDate) setMonth(nextDate);
  }, [dateFormat, value]);

  return (
    <div
      className={cn(
        "group/date-input relative flex h-10 w-full min-w-0 items-center border border-border bg-background",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 dark:bg-card",
        containerClassName,
      )}
    >
      <input
        value={inputValue}
        type="text"
        inputMode="text"
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none",
          showCalendarButton && "pr-10",
          "placeholder:text-muted-foreground/70",
          className,
        )}
        onChange={(event) => {
          const nextInputValue = event.target.value;
          const nextDate = parseDate(nextInputValue, dateFormat);
          setInputValue(nextInputValue);
          if (!nextInputValue.trim()) {
            if (commitEmpty) onChange("");
            return;
          }
          if (nextDate) {
            setMonth(nextDate);
            onChange(format(nextDate, "yyyy-MM-dd"));
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            changeOpen(true);
          }
          onKeyDown?.(event);
        }}
        onBlur={(event) => {
          if (!parseDate(inputValue, dateFormat) && inputValue.trim()) {
            setInputValue(formatDate(selectedDate, dateFormat));
          }
          onBlur?.(event);
        }}
        {...props}
      />
      <Popover open={open} onOpenChange={changeOpen}>
        {showCalendarButton ? (
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={calendarLabel}
              disabled={disabled}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focusable"
            >
              <CalendarIcon className="size-4" />
              <span className="sr-only">{calendarLabel}</span>
            </button>
          </PopoverTrigger>
        ) : (
          <PopoverAnchor asChild>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0" />
          </PopoverAnchor>
        )}
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          sideOffset={10}
          onOpenAutoFocus={(event) => {
            if (keepInputFocusOnOpen) event.preventDefault();
          }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              if (!date) return;
              const nextValue = format(date, "yyyy-MM-dd");
              onChange(nextValue);
              onDateSelect?.(nextValue);
              setInputValue(formatDate(date, dateFormat));
              changeOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
