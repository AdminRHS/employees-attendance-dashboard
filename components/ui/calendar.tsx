"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn(
        "bg-background dark:bg-[#1A1F27] group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full min-w-0 overflow-visible", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4 min-w-0 overflow-visible", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50 [&>svg]:size-2.5 text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#E5E7EB] hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-colors",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50 [&>svg]:size-2.5 text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#E5E7EB] hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-colors",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border text-sm",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-sm dark:text-white",
          captionLayout === "label"
            ? "text-sm dark:text-white"
            : "[&>svg]:text-muted-foreground dark:[&>svg]:text-[#9CA3AF] flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-2.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("grid grid-cols-7 w-full", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground dark:text-[#9CA3AF] select-none rounded-md text-[0.8rem] font-normal flex items-center justify-center",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 grid grid-cols-7 w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center flex items-center justify-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-2.5", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-2.5", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-2.5", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // Check if day has data (available modifier)
  const hasData = modifiers.available || false;
  const isToday = modifiers.today || false;
  const isSelected = modifiers.selected || false;
  const isDisabled = modifiers.disabled || false;
  const isOutside = modifiers.outside || false;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={isToday}
      data-has-data={hasData}
      data-disabled={isDisabled}
      data-outside={isOutside}
      className={cn(
        // Base styles
        "flex aspect-square h-auto w-full max-w-full min-w-0 flex-col gap-1 font-normal leading-none rounded-md transition-all",
        // Default day (no data, not selected, not disabled)
        "bg-transparent dark:bg-[#111827] border border-transparent dark:border-[rgba(255,255,255,0.05)] text-gray-700 dark:text-[#9CA3AF]",
        // Day with data - will be styled via CSS based on data quality
        "data-[has-data=true]:dark:bg-[rgba(34,197,94,0.12)] data-[has-data=true]:dark:text-[#22C55E] data-[has-data=true]:dark:border-[rgba(34,197,94,0.4)]",
        // Selected day
        "data-[selected-single=true]:bg-primary dark:data-[selected-single=true]:bg-[#2563EB] data-[selected-single=true]:text-primary-foreground dark:data-[selected-single=true]:text-white data-[selected-single=true]:text-base dark:data-[selected-single=true]:font-semibold data-[selected-single=true]:border-primary dark:data-[selected-single=true]:border-[#3B82F6] dark:data-[selected-single=true]:shadow-[0_0_8px_rgba(59,130,246,0.6)]",
        // Range states
        "data-[range-middle=true]:bg-accent dark:data-[range-middle=true]:bg-[rgba(255,255,255,0.06)] data-[range-middle=true]:text-accent-foreground dark:data-[range-middle=true]:text-white",
        "data-[range-start=true]:bg-primary dark:data-[range-start=true]:bg-[#2563EB] data-[range-start=true]:text-primary-foreground dark:data-[range-start=true]:text-white",
        "data-[range-end=true]:bg-primary dark:data-[range-end=true]:bg-[#2563EB] data-[range-end=true]:text-primary-foreground dark:data-[range-end=true]:text-white",
        // Today indicator (outline only, no fill change)
        "data-[today=true]:dark:outline data-[today=true]:dark:outline-1 data-[today=true]:dark:outline-[#3B82F6] data-[today=true]:dark:outline-offset-[-1px]",
        // Hover state
        "hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.06)] hover:text-gray-900 dark:hover:text-white cursor-pointer",
        // Disabled/future days - no hover
        "data-[disabled=true]:dark:bg-[#0F172A] data-[disabled=true]:dark:text-[#475569] data-[disabled=true]:dark:border-[rgba(255,255,255,0.03)] data-[disabled=true]:dark:cursor-default data-[disabled=true]:dark:opacity-50 data-[disabled=true]:hover:bg-[#0F172A] data-[disabled=true]:hover:text-[#475569]",
        "data-[outside=true]:dark:bg-[#0F172A] data-[outside=true]:dark:text-[#475569] data-[outside=true]:dark:border-[rgba(255,255,255,0.03)] data-[outside=true]:dark:cursor-default data-[outside=true]:dark:opacity-50 data-[outside=true]:hover:bg-[#0F172A] data-[outside=true]:hover:text-[#475569]",
        // Focus state
        "group-data-[focused=true]/day:border-ring dark:group-data-[focused=true]/day:border-[#3B82F6] group-data-[focused=true]/day:ring-ring/50 dark:group-data-[focused=true]/day:ring-[#3B82F6]/50 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]",
        // Text styling
        "[&>span]:text-sm dark:[&>span]:text-[#E5E7EB] [&>span]:opacity-70 dark:[&>span]:opacity-100",
        // Selected text styling
        "data-[selected-single=true]:[&>span]:text-white data-[selected-single=true]:[&>span]:opacity-100",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
