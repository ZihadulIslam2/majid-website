"use client";

import { Input } from "@/components/ui/input";

const monthOptions = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const padValue = (value: number) => value.toString().padStart(2, "0");

export const getTodayDateValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${padValue(now.getMonth() + 1)}-${padValue(
    now.getDate(),
  )}`;
};

export const getCurrentTimeValue = () => {
  const now = new Date();
  return `${padValue(now.getHours())}:${padValue(now.getMinutes())}`;
};

export const formatInvoiceDateTime = (dateValue: string, timeValue: string) => {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours = 0, minutes = 0] = timeValue.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? 0 : 30;
  const value = `${padValue(hours)}:${padValue(minutes)}`;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return {
    value,
    label: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
});

interface InvoiceDateTimeSectionProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function InvoiceDateTimeSection({
  date,
  time,
  onDateChange,
  onTimeChange,
}: InvoiceDateTimeSectionProps) {
  const [selectedYear, selectedMonth, selectedDay] = date.split("-");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, index) =>
    (currentYear - 3 + index).toString(),
  );

  const updateManualDate = (next: {
    day?: string;
    month?: string;
    year?: string;
  }) => {
    const nextYear = next.year || selectedYear || currentYear.toString();
    const nextMonth = next.month || selectedMonth || "01";
    const nextDay = next.day || selectedDay || "01";
    const lastDay = new Date(Number(nextYear), Number(nextMonth), 0).getDate();
    const safeDay = Math.min(Number(nextDay), lastDay);

    onDateChange(`${nextYear}-${nextMonth}-${padValue(safeDay)}`);
  };

  const setQuickDate = (type: "now" | "today" | "yesterday") => {
    const nextDate = new Date();

    if (type === "yesterday") {
      nextDate.setDate(nextDate.getDate() - 1);
    }

    onDateChange(
      `${nextDate.getFullYear()}-${padValue(nextDate.getMonth() + 1)}-${padValue(
        nextDate.getDate(),
      )}`,
    );

    if (type === "now") {
      onTimeChange(getCurrentTimeValue());
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-5">
      <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
        Invoice Date & Time
      </p>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
          Date
        </label>
        <Input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="rounded-2xl h-12 border-primary bg-background font-bold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
          Time
        </label>
        <Input
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="rounded-2xl h-12 border-primary bg-background font-bold"
        />
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Quick Options
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["now", "today", "yesterday"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setQuickDate(option)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-black capitalize text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Or Select Manually
        </p>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={selectedDay || "01"}
            onChange={(event) => updateManualDate({ day: event.target.value })}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground"
          >
            {Array.from({ length: 31 }, (_, index) => {
              const day = padValue(index + 1);
              return (
                <option key={day} value={day}>
                  {day}
                </option>
              );
            })}
          </select>

          <select
            value={selectedMonth || "01"}
            onChange={(event) =>
              updateManualDate({ month: event.target.value })
            }
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear || currentYear.toString()}
            onChange={(event) => updateManualDate({ year: event.target.value })}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <select
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground"
        >
          {timeOptions.map((timeOption) => (
            <option key={timeOption.value} value={timeOption.value}>
              {timeOption.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
