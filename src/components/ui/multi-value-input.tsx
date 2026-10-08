"use client";

import { ArrowLeftToLine, Check, ChevronDown, Undo2, X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utility/classNames";

import { IconBadge } from "./icon-badge";

export type MultiValueOption = {
  label: ReactNode;
  value: string | number;
};

export type MultiValueIntent = "add" | "remove";
type MultiValueDisplayState = "added" | "removed" | "partial";

export type MultiValueInputProps<OptionValueType> = {
  options: MultiValueOption[];
  onChange?: (newOptions: MultiValueOption[]) => void;
  values?: OptionValueType[];
  className?: string;
  placeholder?: string;
  selectedValueFormater?: (
    value: string | number,
    change?: "added" | "removed" | "partial",
    coverage?: { count: number; total: number },
  ) => ReactNode;
  changeBaselineValues?: OptionValueType[];
  valueCounts?: Record<string, number>;
  totalValueCount?: number;
  valueIntents?: Record<string, MultiValueIntent>;
  onValueIntentChange?: (value: string | number, intent?: MultiValueIntent) => void;
  loading?: boolean;
  variant?: "default" | "inline";
  "aria-label"?: string;
};

export function MultiValueInput<OptionValueType extends string = string>({
  options,
  onChange: originalOnChange,
  values: initialValues = [],
  className,
  placeholder = "Select options",
  selectedValueFormater,
  changeBaselineValues,
  valueCounts,
  totalValueCount,
  valueIntents = {},
  onValueIntentChange,
  loading = false,
  variant = "default",
  "aria-label": ariaLabel,
}: MultiValueInputProps<OptionValueType>) {
  const onChange = originalOnChange || (() => {});
  const selectedValueFormaterFn = selectedValueFormater || getDefaultValueFormatter(options);
  const [open, setOpen] = useState(false);
  const initialOptions = initialValues.map((optionValue) =>
    options.find(getOptionComparator(optionValue))!,
  );
  const [selectedOptions, setSelectedOptions] = useState<MultiValueOption[]>(initialOptions);
  const inline = variant === "inline";
  const visibleOptionCount = inline ? 2 : 4;
  const triState = Boolean(valueCounts && totalValueCount && onValueIntentChange);
  const baselineIds = new Set(changeBaselineValues?.map((value) => String(value).toLowerCase()));
  const changedOptions = [
    ...selectedOptions.map((option) => ({
      option,
      change:
        changeBaselineValues && !baselineIds.has(String(option.value).toLowerCase())
          ? ("added" as const)
          : undefined,
    })),
    ...(changeBaselineValues ?? []).flatMap((value) => {
      if (selectedOptions.some(getOptionComparator(value))) return [];
      const option = options.find(getOptionComparator(value));
      return option ? [{ option, change: "removed" as const }] : [];
    }),
  ];
  const displayedOptions = triState
    ? options.flatMap((option) => {
        const key = String(option.value);
        const count = valueCounts?.[key] ?? 0;
        const intent = valueIntents[key];
        if (count === 0 && intent !== "add") return [];
        const change: MultiValueDisplayState | undefined = intent
          ? intent === "add"
            ? "added"
            : "removed"
          : count < (totalValueCount ?? 0)
            ? "partial"
            : undefined;
        return [
          {
            option,
            change,
            coverage: { count, total: totalValueCount ?? 0 },
          },
        ];
      })
    : changedOptions.map((item) => ({ ...item, coverage: undefined }));

  const getTriState = (value: string | number) => {
    const key = String(value);
    const intent = valueIntents[key];
    if (intent === "add") return true;
    if (intent === "remove") return false;
    const count = valueCounts?.[key] ?? 0;
    if (count === 0) return false;
    return count === totalValueCount ? true : ("indeterminate" as const);
  };

  const advanceTriState = (value: string | number) => {
    if (!onValueIntentChange) return;
    const key = String(value);
    const intent = valueIntents[key];
    const count = valueCounts?.[key] ?? 0;
    if (count > 0 && count < (totalValueCount ?? 0)) {
      onValueIntentChange(
        value,
        intent === "add" ? "remove" : intent === "remove" ? undefined : "add",
      );
      return;
    }
    onValueIntentChange(value, intent ? undefined : count === totalValueCount ? "remove" : "add");
  };

  useEffect(() => {
    const nextOptions = initialValues
      .map((optionValue) => options.find(getOptionComparator(optionValue))!)
      .filter(Boolean);
    setSelectedOptions((currentOptions) =>
      areOptionsEqual(currentOptions, nextOptions) ? currentOptions : nextOptions,
    );
  }, [initialValues, options]);

  const onOptionSelect = useCallback(
    (newOptionValue: string | number) => {
      const findNewOption = getOptionComparator(newOptionValue);

      const optionAlreadySelected = selectedOptions.find(findNewOption);
      if (optionAlreadySelected) {
        const newOptions = selectedOptions.filter(
          (option) => String(option.value).toLowerCase() !== String(newOptionValue).toLowerCase(),
        );
        setSelectedOptions(newOptions);
        onChange(newOptions);
        return;
      }

      const newOption = options.find(findNewOption)!;
      if (!newOption) return selectedOptions;

      const newOptions = [...selectedOptions, newOption];
      setSelectedOptions(newOptions);
      onChange(newOptions);
    },
    [selectedOptions, options, onChange],
  );

  if (loading) {
    return (
      <div
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full h-9",
          "bg-background dark:bg-card",
          "p-0",
          className,
        )}
      >
        <Skeleton className="h-9.5 w-full" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group/relations w-fit justify-between",
            inline
              ? "-ml-2 w-[calc(100%+0.5rem)] border-transparent bg-transparent text-foreground hover:border-border hover:bg-transparent hover:text-foreground dark:bg-transparent"
              : "bg-background text-base hover:bg-accent hover:text-accent-foreground dark:bg-card",
            "p-0 has-[&>svg]:pl-0 pr-1.5 py-1 h-9",
            className,
          )}
        >
          <div
            className={cn(
              "grow flex gap-4 pl-1 pr-3 items-center border-r border-border w-fit",
              inline && "border-r-transparent pl-2",
            )}
          >
            {!displayedOptions.length && (
              <span
                className={cn(
                  "text-muted-foreground pl-1.5 opacity-80 min-w-40 [text-box-trim:trim-both]",
                  inline && "min-w-0",
                )}
              >
                {placeholder}
              </span>
            )}
            {displayedOptions.length > 0 && (
              <div
                className={cn(
                  "min-w-40 grow flex gap-4 justify-between items-center w-fit",
                  inline && "min-w-0",
                )}
              >
                <div className="flex min-w-0 gap-x-1 gap-y-0.5 items-center overflow-hidden">
                  {displayedOptions
                    .slice(0, visibleOptionCount)
                    .map(({ option, change, coverage }) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn("focusable text-sm trim-both items-center h-7")}
                        aria-label={
                          change === "added" || change === "removed"
                            ? `Undo ${change === "added" ? "adding" : "removing"} ${String(option.label)}`
                            : `Remove ${String(option.label)} from all selected rows`
                        }
                        onClick={(evt) => {
                          if (inline) return;
                          evt.stopPropagation();
                          if (triState && onValueIntentChange) {
                            onValueIntentChange(
                              option.value,
                              change === "added" || change === "removed" ? undefined : "remove",
                            );
                            return;
                          }
                          onOptionSelect(option.value);
                        }}
                      >
                        {selectedValueFormaterFn(option.value, change, coverage)}
                      </button>
                    ))}

                  {displayedOptions.length > visibleOptionCount && (
                    <span className="bg-background">
                      <IconBadge
                        icon={null}
                        label={`+${displayedOptions.length - visibleOptionCount}`}
                        className="h-7 border-transparent bg-accent/0 hover:bg-accent"
                      />
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onPointerDown={(evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                  }}
                  onClick={(evt) => {
                    evt.stopPropagation();
                    if (triState && onValueIntentChange) {
                      for (const option of options) {
                        onValueIntentChange(
                          option.value,
                          (valueCounts?.[String(option.value)] ?? 0) > 0 ? "remove" : undefined,
                        );
                      }
                      setOpen(false);
                      return;
                    }
                    setSelectedOptions([]);
                    onChange([]);
                    setOpen(false);
                  }}
                  className={cn(
                    "text-muted-foreground hover:text-foreground focusable h-7",
                    inline &&
                      "opacity-0 group-hover/relations:opacity-100 group-focus-within/relations:opacity-100",
                  )}
                  aria-label="Clear selected options"
                >
                  <ArrowLeftToLine size={20} />
                </button>
              </div>
            )}
          </div>
          <ChevronDown
            className={cn(
              "inline-block",
              inline &&
                "opacity-0 group-hover/relations:opacity-50 group-focus-within/relations:opacity-50",
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="end">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={String(option.value)}
                  onSelect={(newValue) => {
                    if (triState) {
                      advanceTriState(option.value);
                      return;
                    }
                    onOptionSelect(newValue as OptionValueType);
                  }}
                >
                  {triState ? (
                    <Checkbox
                      checked={getTriState(option.value)}
                      tabIndex={-1}
                      aria-label={`Change ${String(option.label)}`}
                    />
                  ) : (
                    <Check
                      className={cn(
                        "size-5",
                        selectedOptions.find(getOptionComparator(option.value))
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  )}

                  <div className="w-full flex gap-3 items-center">{option.label}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function getOptionComparator(optionToCompareTo: number | string, include = true) {
  const a = String(optionToCompareTo).toLowerCase();
  return (option: MultiValueOption) => {
    const b = String(option.value).toLowerCase();
    return include ? a === b : a !== b;
  };
}

function areOptionsEqual(a: MultiValueOption[], b: MultiValueOption[]) {
  if (a.length !== b.length) return false;
  return a.every((option, index) => {
    const otherOption = b[index];
    if (!otherOption) return false;
    return String(option.value).toLowerCase() === String(otherOption.value).toLowerCase();
  });
}

function getDefaultValueFormatter(options: MultiValueOption[]) {
  return function defaultFormatter(
    value: string | number,
    change?: "added" | "removed" | "partial",
    coverage?: { count: number; total: number },
  ) {
    const option = options.find((option) => String(option.value) === String(value));
    return (
      <IconBadge
        icon={
          change === "added" || change === "removed" ? (
            <Undo2 size={16} aria-hidden="true" />
          ) : (
            <X
              size={18}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-hidden="true"
            />
          )
        }
        label={
          <span className="flex items-center gap-1.5">
            {option?.label}
            {change === "partial" && coverage ? (
              <span className="text-xs opacity-70">
                {coverage.count}/{coverage.total}
              </span>
            ) : null}
          </span>
        }
        className={cn(
          "flex-row-reverse pl-2.5 pr-1.5 h-7",
          change === "added" &&
            "border-green-500/60 bg-green-500/15 text-green-700 dark:text-green-400",
          change === "removed" && "border-red-500/60 bg-red-500/15 text-red-700 dark:text-red-400",
          change === "partial" && "border-dashed bg-muted/50",
        )}
      />
    );
  };
}
